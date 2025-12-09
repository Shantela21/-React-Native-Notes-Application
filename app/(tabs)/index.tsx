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

export default function AllNotesScreen() {
  const { notes, isLoading, deleteNote, sortNotes } = useNotes();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'dateEdited'>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const sorted = sortNotes(sortBy, sortOrder);
    
    if (searchQuery) {
      const filtered = sorted.filter(note => 
        (note.title && note.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.category.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work': return '#FF9500';
      case 'study': return '#34C759';
      case 'personal': return '#007AFF';
      default: return '#8E8E93';
    }
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
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
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
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>All Notes</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'dateAdded' && styles.sortButtonActive]}
            onPress={() => setSortBy('dateAdded')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'dateAdded' && styles.sortButtonTextActive]}>
              Date Added
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'dateEdited' && styles.sortButtonActive]}
            onPress={() => setSortBy('dateEdited')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'dateEdited' && styles.sortButtonTextActive]}>
              Date Edited
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderButton, sortOrder === 'asc' && styles.orderButtonActive]}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color={sortOrder === 'asc' ? '#007AFF' : '#666'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  sortButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  orderButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  orderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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
