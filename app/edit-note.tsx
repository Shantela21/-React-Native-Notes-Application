import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useNotes } from '../context/NotesContext';

const categories = ['Work', 'Study', 'Personal'];

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams();
  const { notes, updateNote, deleteNote } = useNotes();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Work');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteExists, setNoteExists] = useState(false);

  useEffect(() => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setTitle(note.title || '');
      setContent(note.content);
      setCategory(note.category);
      setNoteExists(true);
    } else {
      setNoteExists(false);
    }
  }, [id, notes]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    setIsLoading(true);
    try {
      await updateNote(id as string, title.trim() || undefined, content.trim(), category);
      Alert.alert('Success', 'Note updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteNote(id as string);
              Alert.alert('Success', 'Note deleted successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (!noteExists) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Note not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Title (Optional)</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter note title..."
            value={title}
            onChangeText={setTitle}
            editable={!isLoading && !isDeleting}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
                disabled={isLoading || isDeleting}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Enter your note content..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={!isLoading && !isDeleting}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.deleteButton, (isLoading || isDeleting) && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={isLoading || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, (isLoading || isDeleting) && styles.buttonDisabled]}
              onPress={() => router.back()}
              disabled={isLoading || isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, (isLoading || isDeleting) && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading || isDeleting}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 200,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    width: 50,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
