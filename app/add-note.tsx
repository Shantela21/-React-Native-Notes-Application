import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function AddNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Work');
  const [isLoading, setIsLoading] = useState(false);
  const { addNote } = useNotes();
  const router = useRouter();

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter note content');
      return;
    }

    setIsLoading(true);
    try {
      await addNote(title.trim() || undefined, content.trim(), category);
      Alert.alert('Success', 'Note added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            editable={!isLoading}
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
                disabled={isLoading}
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
            editable={!isLoading}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Note'}
              </Text>
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
    gap: 15,
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
