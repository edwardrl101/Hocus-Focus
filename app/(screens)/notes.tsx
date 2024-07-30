import { Text, View, StyleSheet, FlatList, Modal, SectionList, SafeAreaView, Alert } from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar, Checkbox } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { differenceInCalendarDays, isToday, isThisWeek, isTomorrow, isThisMonth, isAfter, endOfMonth } from 'date-fns';
import { supabase } from '@/app/(auth)/client'
import AddNoteModal from '@/components/AddNoteModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notes = ({route}) => {

  const { user } = route.params;

    const [modalVisible, setModalVisible] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
  
    useEffect(() => {
      fetchNotebooks();
    }, []);
  
    const fetchNotebooks = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@notebooks');
        const storedNotebooks = jsonValue != null ? JSON.parse(jsonValue) : [];
        setNotebooks(storedNotebooks);
      } catch (e) {
        console.error("Error fetching notebooks", e);
      }
    };
  
    const storeNotebooks = async (notebooks) => {
      try {
        const jsonValue = JSON.stringify(notebooks);
        await AsyncStorage.setItem('@notebooks', jsonValue);
      } catch (e) {
        console.error("Error storing notebooks", e);
      }
    };

    const handleAddNote = async (note) => {
      try {
        const noteId = Date.now().toString();
        const newNote = { id: noteId, ...note };
        const updatedNotebooks = [...notebooks, newNote];
        setNotebooks(updatedNotebooks);
        await storeNotebooks(updatedNotebooks);
    
        const { data, error } = await supabase.rpc('insert_note', {
          auth_id: user.id,
          title: note.text,
          description: note.desc,
          noteid: noteId,
          content: note.content
        });
    
        if (error) {
          console.log("Error inserting note to Supabase:", error);
        }
      } catch (error) {
        console.log("Error adding note:", error);
      }
    };
  
    const handleSave = async (title, desc) => {
      const newNotebook = { id: Date.now().toString(), title, desc };
      const updatedNotebooks = [...notebooks, newNotebook];
      setNotebooks(updatedNotebooks);
      await storeNotebooks(updatedNotebooks);
      setModalVisible(false);
    };

    const handleDelete = async (id) => {
        const updatedNotebooks = notebooks.filter(notebook => notebook.id !== id);
        setNotebooks(updatedNotebooks);
        await storeNotebooks(updatedNotebooks);
      };

    const handleSelectNotebook = (notebook) => {
        setSelectedNotebook(notebook);
      };
  
    const handleSearch = (query) => {
      setSearchQuery(query);
    };
  
    const filteredNotebooks = notebooks.filter(notebook =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
      <List.Item
      title = {item.title}
      description={item.desc}
      onPress = {() => handleSelectNotebook(item)}
      style = {styles.listItem}
      />
    );



    return(
        <PaperProvider>
        <View style = {styles.container}>
        <List.Section>
        <List.Subheader style = {styles.headerText}>My Notes</List.Subheader>
        <Searchbar
            placeholder="Search"
            onChangeText={handleSearch}
            value={searchQuery}
          />
          <FlatList
            data={filteredNotebooks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                description={item.desc}
                style={styles.listItem}
                onPress={() => handleSelectNotebook(item)}
                right={props => (
                    <IconButton
                      {...props}
                      icon="delete"
                      onPress={() => handleDelete(item.id)}
                    />
                  )}
              />
            )}
          />

        </List.Section>
        <FAB style = {styles.fab}
         small
        icon = "plus"
        onPress={() => setModalVisible(true)}/>


        {
            modalVisible && (<AddNoteModal
            visible = {modalVisible}
            onClose = {() => setModalVisible(false)}
            handleSave={handleSave}
            handlesSave={handleAddNote}>

            </AddNoteModal>)
        }
        

        </View>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#F3E5F5'
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      borderRadius: 28,
    },
    headerText: {
      fontWeight: 'bold',
      marginTop: 5,
      fontSize: 25
    },
    overdueText: {
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 5,
      color: 'red'
    },
    subheaderText: {
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 5,
      color: 'purple'
    },
    section: {
      marginBottom: 20,
    },
    listItem: {
      backgroundColor: '#E1BEE7',
      borderRadius: 20,
      marginVertical: 10,
      marginHorizontal: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000000',  
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 3,
    },
    sectionList: {
      marginBottom: 20
    },
  })
  

export default Notes
