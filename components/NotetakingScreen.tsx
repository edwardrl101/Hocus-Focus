import { Text, View, StyleSheet, Modal, TextInput, Button, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { IconButton, FAB } from 'react-native-paper';
import EditNoteDetailsModal from './EditNoteDetailsModal';
import { supabase } from '@/app/(auth)/client';

export default function NotetakingScreen({ visible, onClose, note, onUpdateNote }) {
  const [content, setContent] = useState(note ? note.content : '');
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content || ''); // Initialize content correctly
    }
  }, [note]);

  const handleUpdateNoteDetails = async (updatedNote) => {
    try {
      const { data, error } = await supabase
        .from('notebook')
        .update({
          nb_name: updatedNote.title,
          nb_desc: updatedNote.desc,
        })
        .eq('id', updatedNote.id);
  
      if (error) {
        console.error("Error updating note:", error);
      } else {
        console.log("Note updated successfully:", data);
        // Optionally refresh the notes list or state
      }
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedNote = { ...note, content };
      console.log("IT IS:", note);
      console.log(updatedNote)
      await onUpdateNote(updatedNote); // Update note before closing
    } catch (error) {
      console.error("Error updating note:", error);
    }
    onClose(); // Ensure modal closes after update
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={handleSave}>
      <ScrollView style={styles.container}>
        <View style={styles.modalHeader}>
        <IconButton style = {styles.modalCloseButton}
        icon = "arrow-left"
        size = {30}
        onPress={handleSave}></IconButton>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 0, marginLeft: 92 }}>Edit Note</Text>
          <IconButton
          style = {{marginLeft: 95, marginTop: 7}}
          icon="pencil"
          size = {25}
          onPress={() => setEditModalVisible(true)}
        />
    
        </View>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Take down notes here..."
          value={content}
          onChangeText={setContent}
        />
      
        {
            editModalVisible && (<EditNoteDetailsModal
            visible = {editModalVisible}
            onClose = {() => setEditModalVisible(false)}
            note = {note}
            updateDetails={handleUpdateNoteDetails}>

            </EditNoteDetailsModal>)
        }
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#FFFACD',
  },
  modalHeader: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'row'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFACD', // Light yellow background
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 16,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: '#ddd',
    marginBottom: 0,
  },
});
