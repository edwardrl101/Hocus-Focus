import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, SectionList, SafeAreaView, KeyboardAvoidingView, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/app/(auth)/client'
import ListSection from 'react-native-paper/lib/typescript/components/List/ListSection';
import {Ionicons} from '@expo/vector-icons';
import FriendSearchResult  from '@/components/FriendSearchResult'

const AddFriend = ({ visible, onClose, _user, my_uid }) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [searchDisplay, setSearchDisplay] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const[modalVisible, setModalVisible] = useState(false);
    
    const channel = supabase.channel('load_friend_requests')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Friends',
        filter: `friend_uid=eq.${my_uid}`,
      },
      (payload) => {
        console.log("payload4:", payload);
        loadRequests();
      }
    ).subscribe()
    
    const handleClose = () => {
        setSearchDisplay([]);
        setSearchQuery('');
        onClose();
    }
    const handleSearch = async () => {
      console.log(searchQuery);
      const {data, error} = await supabase.rpc('search_user', {input : searchQuery})
      if (data.length == 0) {
          alert("Unable to find user")
          return;
      }
      else {
          console.log(data);
          setSearchDisplay(data)
          setModalVisible(true)
      }
    }
    
      const loadRequests = async () => {
          try{
            const {data, error} = await supabase.rpc('fetch_friendrequests', {auth_id : _user.id})
            console.log(_user.id)
            console.log(error)
            if (data) {
                setFriendRequests(data)
                
                //setLoading(false)
            }

          } catch (error) {
            console.error(error);
          }
          setLoading(false) //temporarily here
        };
    
      useEffect(() => {
        loadRequests();
    }, []);      
    
    const handleAccept = async (frienduid) => {
      console.log(frienduid);
      const {data, error} = await supabase.rpc('accept_friend', 
        {my_uid : my_uid, _frienduid: frienduid})
      console.log(error);
      console.log("accept");
    }

    const handleReject = async (frienduid) => {
      const {data, error} = await supabase.rpc('reject_request', {my_uid : my_uid, _frienduid: frienduid})
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
      <Text style = {styles.modalHeaderText}> Add Friend </Text>
      </View>
      <IconButton style = {styles.modalCloseButton}
      icon = "arrow-left"
      size = {30}
      onPress={handleClose}></IconButton>

        <View style = {styles.listSection}>
        <List.Subheader style = {styles.headerText} >Search for user</List.Subheader>
        <View style = {styles.search}>
            <Searchbar
                placeholder="Enter user's uid"
                onChangeText={setSearchQuery}
                value= {searchQuery}
                style={styles.searchBar}
            />
        <TouchableOpacity style = {styles.searchButton} 
        onPress = {handleSearch}>
            <Text style = {styles.searchText}>Search</Text>
        </TouchableOpacity>
        </View>

    </View>
    <View>
      <View style = {styles.title}>
        <Text style = {styles.titleText}>Friend Requests:</Text>
      </View>
        { (friendRequests.length > 0) ? <FlatList
          style={styles.container}
          enableEmptySections={true}
          data={friendRequests}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            return (
              <View style = {styles.friendRequestRow}>  
              <TouchableOpacity style={styles.request}>
                <View style={styles.box}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.username}>uid: {item.uid}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.crossButton} onPress = {() => handleReject(item.uid)}>
                <View>
                  <Ionicons name = "close" size = {20} color = 'white'/>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tickButton} onPress = {() => handleAccept(item.uid)}>
                <View>
                  <Ionicons name = "checkmark-outline" size = {20} color = 'white'/>
                </View>
              </TouchableOpacity>
              </View>
            )
          }}
        /> : <View style={styles.noFriendBackground}> 
        <Text style = {styles.noFriends}> No friend requests yet! </Text>
      </View>}
        </View>
        {(searchDisplay.length > 0) ?
          (<FriendSearchResult visible = {modalVisible}
            clearSearch = {() => setSearchDisplay([])}
            onClose = {() => setModalVisible(false)}
            my_uid = {my_uid}
            searchResult = {searchDisplay}>
          </FriendSearchResult>) : null
        }


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
        backgroundColor: '#F3E5F5', // light gray background
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
    headerText: {
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 25,
        marginLeft: 10,
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
      box: {
        padding: 5,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
      },
      request: {
        width: '70%',
      },
      username: {
        color: '#20B2AA',
        fontSize: 22,
        alignSelf: 'center',
        marginLeft: 10,
      },
      container: {
        height: '80%'
      },
      listSection: {
        backgroundColor: 'white',
        height: '20%',
        justifyContent: 'center'
      },
      crossButton: {
        backgroundColor: '#bf5154',
        padding: 10,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10, 
        marginRight: 10,
        shadowColor: 'black',
        width: 40,
        height: 40,
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
      },
      tickButton: {
        backgroundColor: '#93e3a9',
        padding: 10,
        marginLeft:10,
        marginRight: 10,
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 10,
        shadowColor: 'black',
        width: 40,
        height: 40,
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
        
      },
      friendRequestRow:{
        flexDirection: 'row',
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
      noFriends: {
        color: '#3b2437',
        fontWeight: 'bold',
        fontSize: 30,
        marginBottom: '50%',
      },
      noFriendBackground: {
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
      },
})

export default AddFriend 