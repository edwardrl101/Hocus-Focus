import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, SectionList, SafeAreaView, Image, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/app/(auth)/client'
import ListSection from 'react-native-paper/lib/typescript/components/List/ListSection';
import {Ionicons} from '@expo/vector-icons';

const EditProfile = ({ visible, onClose, user, my_uid }) => {

    const [loading, setLoading] = useState(true);
    const [_shop, getShop] = useState([]);
    const [_userchar, getUserChar] = useState([]);
    const [currChar, getCurrChar] = useState([]);
    
    const handleClose = () => {
        onClose();
    }

    const channel1 = supabase.channel('display_skins')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_characters',
        filter: `unique_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("uc:", payload);
        loadUserChar();
        loadCurrChar();
      }
    ).subscribe()

    const channel2 = supabase.channel('update_selected')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profile',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        console.log("us:", payload);
        loadUserChar();
        loadCurrChar();
      }
    ).subscribe()

    const loadCurrChar = async() => {
      try {
        const {data, error} = await supabase
        .from('profile')
        .select('character_id')
        .eq('id', user.id);
        console.log("char: ", data[0].character_id);
        getCurrChar(data[0].character_id);
      } catch (error) {
        console.error(error);
      }
    }

    const loadUserChar = async () => {
      try{
        const {data, error} = await supabase.rpc('display_char_inv', {auth_id : user.id});
          console.log(data);
          getUserChar(data);
          setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    useEffect(() => {
      loadUserChar();
      loadCurrChar();
    }, []);

    const handleSelect = async (id) => {
      try {
        const {data, error} = await supabase
        .from('profile')
        .update({ character_id: `${id}` })
        .match({ id: `${user.id}` });
        onClose(); 
      } catch (error) {
        console.error(error);
      }  
   
    }
  

    if (loading) {
        return (
            <Text>Loading...</Text>
        )
    }
    return (
    <Modal style = {styles.modalContainer}
    animationType = "slide" 
    visible = {visible}
    onRequestClose={handleClose}>

      <SafeAreaView style = {styles.modalContainer}>

      <View style = {styles.modalHeader}>
      <Text style = {styles.modalHeaderText}> Change Character Skin </Text>
      </View>
      <IconButton style = {styles.modalCloseButton}
      icon = "arrow-left"
      size = {30}
      onPress={handleClose}></IconButton>

<FlatList
          style={styles.container}
          scrollEnabled = {true}
          enableEmptySections={true}
          data={_userchar}
          keyExtractor={item => item.id}
          renderItem={({ item }) => { return(
              <TouchableOpacity disabled = {(currChar == item.id)} onPress = {() => handleSelect(item.id)}>
                <View style={styles.box}>
                  <Image style={{width: "80%", height : '80%'}} source = {{uri: item.image}}></Image>
                  <Text style={styles.username}>{item.name}</Text>
                  {!(currChar == item.id) ? 
                  <View style={styles.price}>
                  </View> : 
                  
                  <View style={styles.price}>
                    <Text>Currently selected</Text>
                  </View>}
                </View>
              </TouchableOpacity>
              
              )
          }}
        />


      </SafeAreaView>
      </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "white"
      },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        left: 5,
        color: 'white',
      },
    modalHeader: {
        backgroundColor: 'white', // light gray background
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
        color: 'black'
    },
    search: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        
        height: '10%',
        paddingHorizontal: 5
    },
    searchBar: {
        width: '80%',
        alignSelf: 'center',
    },
    searchButton: {
        backgroundColor: "purple",
        padding: 7,
        alignSelf: "center",

        width: "19%",
        height: 35,
        borderRadius: 50,
      },
      searchText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold"
      },
      username: {
        color: '#20B2AA',
        fontSize: 22,
        alignSelf: 'center',
        marginLeft: 10,
      },
      listSection: {
        backgroundColor: 'white',
        height: '20%',
        justifyContent: 'center'
      },

      title: {
        height: '10%',
        justifyContent: 'space-between',
        flexDirection: 'row',
    
      },
      titleText: {
          fontWeight: 'bold',
          color: 'black',
          marginTop: 10,
          fontSize: 25,
          marginLeft: 10,
      },
      price: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
        backgroundColor: '#f9dfad',
        height: '100%',
      },
      box: {
        padding: 10,
        height: 300,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
        justifyContent: "center",
        alignContent: "center",
      },
})

export default EditProfile 