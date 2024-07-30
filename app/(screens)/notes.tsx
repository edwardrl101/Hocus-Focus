import { Text, View, StyleSheet, FlatList, Modal, SectionList, SafeAreaView, Alert, ScrollView } from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar, Checkbox } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { differenceInCalendarDays, isToday, isThisWeek, isTomorrow, isThisMonth, isAfter, endOfMonth } from 'date-fns';
import { supabase } from '@/app/(auth)/client'
import AddNoteModal from '@/components/AddNoteModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotetakingScreen from '@/components/NotetakingScreen';

const Notes = ({route}) => {

  const { user } = route.params;

    const [modalVisible, setModalVisible] = useState(false);
    const [notebooks, setNotebooks] = useState([]);
    const [selectedNotebook, setSelectedNotebook] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [_uid, getUserID] = useState("");

    const channel = supabase.channel('load_notes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notebooks',
        filter: `unique_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("load_notes:", payload);
        loadNotes();
  
      }
    ).subscribe()

    const loadUser = async () => { // load the user's uid
      try{
        const { data, error } = await supabase
        .from('profile')
        .select('uid')
        .eq('id', user.id);
        console.log("id: ", data[0].uid);
        getUserID(data[0].uid);
      } catch (error) {
        console.error(error);
      }
    };

    const loadNotes = async () => {
      try {
        //const { data: { user } } = await supabase.auth.getUser();
        //(user);
        const { data, error } = await supabase.rpc('get_user_notes', { user_id: _uid });
        if (error) { throw error; }
        setNotebooks(data);
        console.log(notebooks);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    useEffect(() => {
      loadUser();
      loadNotes();
    }, [_uid]);
  
    

    const handleAddNote = async (note) => {
      try {
        const noteId = Date.now().toString();
        const newNote = { id: noteId, ...note };
        console.log(noteId)
        setNotebooks((prevNotebooks) => [...prevNotebooks, newNote]);
    
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

    const handleUpdateNote = async (updatedNote) => {
      const updatedNotebooks = notebooks.map((notebook) =>
        notebook.id === updatedNote.id ? updatedNote : notebook
      );
      setNotebooks(updatedNotebooks);
      
      try {
        const { data, error } = await supabase
          .from('notebook')
          .update({ nb_content: updatedNote.content })
          .eq('id', updatedNote.id);

  
        if (error) {
          console.log('Error updating note in Supabase:', error);
        }
      } catch (error) {
        console.log('Error updating note:', error);
      }
    };

    const handleSelectNotebook = (notebook) => {
        setSelectedNotebook(notebook);
        setNoteModalVisible(true);
      };
  
    const handleSearch = (query) => {
      setSearchQuery(query);
    };
  
    const filteredNotebooks = notebooks.filter(notebook =>
      notebook.title && notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    const groupedNotebooks = filteredNotebooks.reduce((sections, notebook) => {
      const firstLetter = notebook.title[0].toUpperCase();
      const section = sections.find((sec) => sec.title === firstLetter);
      if (section) {
        section.data.push(notebook);
      } else {
        sections.push({ title: firstLetter, data: [notebook] });
      }
      return sections;
    }, []);



    const renderItem = ({ item }) => {
    
      return (
      <List.Item
      title = {item.title}
      description={item.description}
      onPress = {() => handleSelectNotebook(item)}
      style = {styles.listItem}
      right={props => (
        <IconButton
          {...props}
          icon="delete"
          onPress={() => {}}
        />
      )}
      />
    );
  }



    return(
        <PaperProvider>
        <SafeAreaView style = {styles.container}>
          
        <List.Section>
        <List.Subheader style = {styles.headerText}>My Notes</List.Subheader>
        <Searchbar
            placeholder="Search"
            onChangeText={handleSearch}
            value={searchQuery}
            style = {styles.searchBar}
          />
          <SectionList
          sections={groupedNotebooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
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
            handlesSave={handleAddNote}>

            </AddNoteModal>)
        }
        
        {
            noteModalVisible&& (<NotetakingScreen
            visible = {noteModalVisible}
            onClose = {() => setNoteModalVisible(false)}
            note={selectedNotebook}
            onUpdateNote={handleUpdateNote}
            >

            </NotetakingScreen>)
        }
        

        </SafeAreaView>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: 'white'
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
      fontSize: 25,
      color: 'black'
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
      backgroundColor: '#FFFACD',
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
    searchBar: {
      backgroundColor: 'transparent'
    }
  })
  

export default Notes
