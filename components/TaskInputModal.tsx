import { Text, View, StyleSheet, FlatList, Modal, TextInput, Button, Alert, SafeAreaView, KeyboardAvoidingView, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react'
import RNPickerSelect from 'react-native-picker-select';
import CalendarButton from './styles/CalendarButton';
import ClockButton from './styles/ClockButton';
import ResetButton from './styles/ResetButton';
import BackArrowTwo from './styles/BackArrowTwo';

const TaskInputModal = ({ visible, onClose, saveTask }) => {

    const[text, setText] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [dueDate, setDueDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState(["Personal", "Work", "School", "Others"]);
    const [dateType, setDateType] = useState(''); // 'start' or 'due'
    const [timeType, setTimeType] = useState(''); // 'start' or 'due'
    const [newCategory, setNewCategory] = useState("");
    const [isEdited, setIsEdited] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const handleAddCategory = () => {
      if (newCategory.trim() && !categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
        setCategory(newCategory);
        setNewCategory("");
        setIsEdited(true);
      }
    };

    const resetInputs = () => {
      setText("");
      setStartDate(null);
      setDueDate(null);
      setCategory('');
      setNewCategory("");
      setShowDatePicker(false);
      setShowTimePicker(false);
      setIsEdited(false);
    }

    const handleClose = () => {
      if (isEdited) {
        Alert.alert(
          "Confirm",
          "Are you sure you want to go back? All changes will be lost.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "OK",
              onPress: () => {
                resetInputs();
                onClose();
              }
            }
          ]
        );
      } else {
      resetInputs();
      onClose();
    }
  }

  const handleSave = () => {
    if(!dueDate || !startDate) {
      Alert.alert('Invalid Date Selection', 'Please Enter a Date')
      return;
    }
    if((dueDate && startDate) && dueDate < startDate) {
      Alert.alert('Invalid Date Selection', 'Due date cannot be before the start date.');
        return;
    }
    if(text.trim()) {
      const dueDateTime = dueDate ? new Date(dueDate) : null;
      const startDateTime = startDate ? new Date(startDate) : null;
      saveTask({ task: text, dueDate: dueDateTime ? dueDateTime.toISOString() : null, 
        startDate: startDateTime ? startDateTime.toISOString() : null, category: category, completedStatus: isComplete });
        setText("");
        setCategory('');
        setStartDate(null);
        setDueDate(null);
        setNewCategory("");
        setIsEdited(false);
        onClose();
    }
}
    const onDateChange = (event, selectedDate) => {
      if(event.type === 'dismissed') {
        setShowDatePicker(false);
        return;
      } else {
        const currentDate = selectedDate || (dateType === 'start' ? startDate : dueDate);
        setShowDatePicker(false);
        if (dateType === 'start') {
        setStartDate(currentDate);
      } else {
        setDueDate(currentDate);
      }
      setIsEdited(true);
    }
  }

    const onTimeChange = (event, selectedTime) => {
      if(event.type === 'dismissed') {
        setShowTimePicker(false);
        return;
      } else {
        const currentTime = selectedTime || (dateType === 'start' ? startDate : dueDate);
        setShowTimePicker(false);
        if (timeType === 'start') {
        setStartDate(currentTime);
      } else {
        setDueDate(currentTime);
      }
      setIsEdited(true);
    }
  }

    return(
        <Modal style = {styles.modalContainer}
      animationType = "slide" 
      visible = {visible}
      onRequestClose={handleClose}>

        <SafeAreaView style = {{backgroundColor: '#F9DFAD', flex: 1}}>
        <ScrollView>
        <View style = {styles.modalHeader}>
        <Text style = {styles.modalHeaderText}> Hello! </Text>
        </View>
        <IconButton style = {styles.modalCloseButton}
        icon = "arrow-left"
        size = {30}
        onPress={onClose}></IconButton>

        <Text style = {styles.subheaderText}>What do you want to do?</Text>
        <TextInput style = {styles.textInput}
        placeholder = {"Enter your task here"}
        value = {text}
        onChangeText={(value) => { setText(value); setIsEdited(true); }}/>

        
        <Text style = {styles.subheaderText}>Start</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Select a date"
            value={startDate ? startDate.toDateString() : ""}
            editable={false}/>
            
            <CalendarButton onClose = {() => {setDateType('start'); setShowDatePicker(true)}}/>

          {startDate && (<ResetButton onClose = {() => {setStartDate(null) ; setDueDate(null)}}/>
            )}

        </View>

        {startDate && (<View style={styles.dateInputContainer}>
        <TextInput
            style={styles.dateInput}
            placeholder="Select a time"
            value={startDate.toLocaleTimeString()}
            editable={false}
          />
          <ClockButton onClose = {() => {setTimeType('start'); setShowTimePicker(true)}}/>
          </View>)}

        {startDate && (<View>
          <Text style = {styles.subheaderText}>End</Text>
          <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Select due date"
            value={dueDate ? dueDate.toDateString() : ""}
            editable={false}
          />
          <CalendarButton onClose = {() => {setDateType('due'); setShowDatePicker(true)}}/>
          
          {dueDate && (<ResetButton
            onClose={() => setDueDate(null)}
          />)}
        </View>
        </View>)}

        {dueDate && (<View style={styles.dateInputContainer}>
        <TextInput
            style={styles.dateInput}
            placeholder="Select due time"
            value={dueDate.toLocaleTimeString()}
            editable={false}
          />
          <CalendarButton onClose = {() => {setTimeType('due'); setShowTimePicker(true)}}/>
          </View>)}

          {showDatePicker && (
          <DateTimePicker
            value={dateType === 'start' ? (startDate || new Date()) : (dueDate || new Date())}
            mode="date"
            display="default"
            onChange={onDateChange}/>
        )}
        
          {showTimePicker && (
          <DateTimePicker
            value={timeType === 'start' ? (startDate || new Date()) : (dueDate || new Date())}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
        
        <Text style={styles.subheaderText}>Choose a Category</Text>
        <View style = {styles.dropdownContainer}>
        <RNPickerSelect
           onValueChange={(value) => { setCategory(value); setIsEdited(true); }}
           items={categories.map(cat => ({ label: cat, value: cat }))}
           placeholder={{ label: 'Select a category', value: null }}
        />
        </View>
        
        <KeyboardAvoidingView behavior = "padding">
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            placeholder="Add a new category"
            value={newCategory}
            onChangeText={(value) => { setNewCategory(value); setIsEdited(true); }}/>
          
           <IconButton
            icon="plus"
            color="#6200EE"
            size={24}
            onPress={handleAddCategory}
            style={styles.calendarIcon}
          />
        </View>
        </KeyboardAvoidingView>
        </ScrollView>

        <FAB style = {styles.fab}
        small
        icon = "check"
        onPress={handleSave}/>
         
        </SafeAreaView>
      </Modal>
    )
}

export default TaskInputModal

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
      backgroundColor: 'white',  // White background for list items
      borderRadius: 20,
      marginVertical: 10,
      marginHorizontal: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000000',  // Black shadow color
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