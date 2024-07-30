import { Text, View, StyleSheet, FlatList, Modal, TextInput, Button, Alert, SafeAreaView, KeyboardAvoidingView, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react'


const AddNoteModal = ({ visible, onClose, handleSave, handlesSave }) => {
    const[text, setText] = useState("");
    const[isEdited, setIsEdited] = useState(false);
    const[desc, setDesc] = useState("");
    const[content, setContent] = useState("");

    const handleClose = () => {
        setText("");
        onClose();
    }

    const handleSaveClick = () => {
        if (text.trim()) {
          handlesSave({ text: text, desc: desc, content: content });
          handleSave(text, desc); // Invoke the save function with the notebook title
          handleClose();
        } else {
          Alert.alert('Error', 'Notebook title cannot be empty.');
        }
      };

    return(
        <Modal style = {styles.modalContainer}
        animationType = "slide" 
        visible = {visible}
        onRequestClose={handleClose}>
            <SafeAreaView style = {{backgroundColor: 'yellow', flex: 1}}>
            <View style = {styles.modalHeader}>
        <Text style = {styles.modalHeaderText}> New Notebook </Text>
        </View>
        <IconButton style = {styles.modalCloseButton}
        icon = "arrow-left"
        size = {30}
        onPress={handleClose}></IconButton>
            
        <Text style = {styles.subheaderText}>Title</Text>
        <TextInput style = {styles.textInput}
        placeholder = {"Enter your title here"}
        value = {text}
        onChangeText={(value) => { setText(value); setIsEdited(true); }}/>
        
        <Text style = {styles.subheaderText}>Description</Text>
        <TextInput style = {styles.textInput}
        placeholder = {"Add a description here"}
        value = {desc}
        multiline = {true}
        onChangeText={(value) => { setDesc(value); setIsEdited(true); }}/>
        
        <FAB style = {styles.fab}
        small
        icon = "check"
        onPress={handleSaveClick}/>
            </SafeAreaView>
            
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'white'
      },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        left: 5,
        color: 'white',
      },
    modalHeader: {
        backgroundColor: '#F3E5F5', 
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: '100%',
      },
    modalHeaderText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 1,
        marginLeft: 40,
        color: 'purple'
    },
    button: {
        marginTop: 100,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      borderRadius: 28,
    },
    subheaderText: {
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 5,
      marginHorizontal: 15,
      color: 'purple'
    },
    textInput:{
      marginHorizontal: 25,
      marginBottom: 20,
      backgroundColor: 'white',  
      borderRadius: 20,
      marginVertical: 10,
      paddingVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000000',  
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 3,
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 25,
      marginBottom: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      marginVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 3,
    },
    dateInput: {
      flex: 1,
      paddingVertical: 10,
    },
    dropdownContainer: {
      marginHorizontal: 25,
      marginBottom: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      marginVertical: 10,
      paddingHorizontal: 0,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 3,
    },
})

export default AddNoteModal