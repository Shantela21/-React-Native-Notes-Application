import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotes } from '../../context/NotesContext';

export default function StudyNotesScreen() {
  const { notes, isLoading, deleteNote, sortNotes } = useNotes();
  const router = useRouter();
  const [studyNotes, setStudyNotes] = useState(notes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState(studyNotes);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'dateEdited'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const study = notes.filter(note => note.category.toLowerCase() === 'study');
    const sorted = sortNotes(sortBy, sortOrder).filter(note => note.category.toLowerCase() === 'study');
    setStudyNotes(sorted);
    
    if (searchQuery) {
      const filtered = sorted.filter(note => 
        (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(sorted);
    }
  }, [notes, searchQuery, sortBy, sortOrder]);

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${noteTitle || 'Untitled'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(noteId) }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderNote = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => router.push(`/edit-note?id=${item.id}`)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>Study</Text>
        </View>
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {item.dateEdited ? 'Edited: ' + formatDate(item.dateEdited) : 'Added: ' + formatDate(item.dateAdded)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNote(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Notes</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search study notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No study notes found' : 'No study notes yet. Create your first study note!'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-note')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  notesList: {
    padding: 15,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});
