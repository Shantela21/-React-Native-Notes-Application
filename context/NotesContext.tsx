import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Note {
  id: string;
  title?: string;
  content: string;
  category: string;
  dateAdded: string;
  dateEdited?: string;
  userId: string;
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  addNote: (title: string | undefined, content: string, category: string) => Promise<void>;
  updateNote: (id: string, title: string | undefined, content: string, category: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Note[];
  sortNotes: (sortBy: 'dateAdded' | 'dateEdited', order: 'asc' | 'desc') => Note[];
  getNotesByCategory: (category: string) => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Work', 'Study', 'Personal'];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notesData = await AsyncStorage.getItem('notes');
      if (notesData) {
        setNotes(JSON.parse(notesData));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const generateNoteId = () => {
    return 'note_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const addNote = async (title: string | undefined, content: string, category: string) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const newNote: Note = {
        id: generateNoteId(),
        title: title?.trim() || undefined,
        content: content.trim(),
        category: category.trim(),
        dateAdded: new Date().toISOString(),
        userId: user.id
      };

      const updatedNotes = [...notes, newNote];
      await saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (id: string, title: string | undefined, content: string, category: string) => {
    try {
      const updatedNotes = notes.map(note => {
        if (note.id === id) {
          return {
            ...note,
            title: title?.trim() || undefined,
            content: content.trim(),
            category: category.trim(),
            dateEdited: new Date().toISOString()
          };
        }
        return note;
      });

      await saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== id);
      await saveNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    
    return notes.filter(note => {
      const searchableText = [
        note.title || '',
        note.content,
        note.category
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  const sortNotes = (sortBy: 'dateAdded' | 'dateEdited', order: 'asc' | 'desc'): Note[] => {
    const sorted = [...notes].sort((a, b) => {
      const dateA = sortBy === 'dateEdited' && a.dateEdited 
        ? new Date(a.dateEdited).getTime() 
        : new Date(a.dateAdded).getTime();
      const dateB = sortBy === 'dateEdited' && b.dateEdited 
        ? new Date(b.dateEdited).getTime() 
        : new Date(b.dateAdded).getTime();
      
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return sorted;
  };

  const getNotesByCategory = (category: string): Note[] => {
    return notes.filter(note => note.category.toLowerCase() === category.toLowerCase());
  };

  return (
    <NotesContext.Provider value={{
      notes,
      isLoading,
      addNote,
      updateNote,
      deleteNote,
      searchNotes,
      sortNotes,
      getNotesByCategory
    }}>
      {children}
    </NotesContext.Provider>
  );
};
