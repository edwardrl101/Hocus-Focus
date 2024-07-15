import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native'
import { IconButton, FAB, List } from 'react-native-paper';
import { supabase } from '@/app/(auth)/client'
import AddFriend from '@/components/AddFriend'
import FriendProfile from '@/components/FriendProfile'



const FriendList = ({user}) => {
    const[_uid, getUserID] = useState("");
    const[_friends, getFriends] = useState([]);
    const[loading, setLoading] = useState(true);
    const[modalVisible, setModalVisible] = useState(false);
    const[friendVisible, setFriendVisible] = useState(false);
    const[friendData, setFriendData] = useState([]);

    const channel = supabase.channel('load_friends')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Friends',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        console.log("payload3:", payload);
        loadFriends();
      }
    ).subscribe()

    useEffect(() => {
        const loadUser = async () => {
          try{
            const { data, error } = await supabase
            .from('profile')
            .select('uid')
            .eq('id', user.id);
            console.log("id: ", data[0].uid);
            getUserID(data[0].uid);
            setLoading(false);
          } catch (error) {
            console.error(error);
          }
        };
    
        loadUser();
    }, []);        

    const loadFriends = async () => {
            try{
                console.log("load friend: ", user.id);
                const { data, error } = await supabase.rpc('display_friend', {auth_id : user.id})
                console.log(error)
                console.log("data ", data);
                getFriends(data);
            } catch (error) {
              console.error(error);
            }
    };
    

    useEffect(() => {
        loadFriends();
      }, []);

  const handleFriendProfile = ({item}) => {
    console.log(item);
    setFriendData(item);
    setFriendVisible(true);
  };


  console.log(loading);
  if (loading) {
    console.log("load");
    return (
        <Text>Loading...</Text>
    )
  }

  return (
    <View style = {styles.friendPage}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            style={styles.avatar}
            source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar1.png' }}
          />
          <Text style={styles.name}>{user.user_metadata.username}</Text>
          <Text style={styles.name}>uid: {_uid}</Text>
        </View>
      </View>

      <View style = {styles.content}>
        <View style = {styles.title}>
          <Text style = {styles.titleText}>Friends:</Text>
        </View>
        { (_friends.length > 0) ? 
          <FlatList
          style={styles.container}
          scrollEnabled = {true}
          enableEmptySections={true}
          data={_friends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => { return(
              <TouchableOpacity onPress = {() => handleFriendProfile({item})}>
                <View style={styles.box}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.username}>uid: {item.id}</Text>
                </View>
              </TouchableOpacity>
              
              )
          }}
        /> : <View style={styles.noFriendBackground}> 
          <Text style = {styles.noFriends}> No friends yet! </Text>
        </View>
        }


         <FAB style = {styles.fab}
          small
          icon = "plus"
          onPress={() => setModalVisible(true)}/>

            <AddFriend visible = {modalVisible} 
            onClose = {() => setModalVisible(false)}
            _user = {user}
            my_uid = {_uid}
            ></AddFriend>
            <FriendProfile visible = {friendVisible} 
            onClose = {() => setFriendVisible(false)}
            friend_username = {friendData.username}
            friend_uid = {friendData.id}
            ></FriendProfile>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  friendPage: {
    backgroundColor: "#F9DFAD",
  },
  header: {
    backgroundColor: '#7d5675',
    height: '35%',
    justifyContent: 'center',

  },
  content: {
    height: '65%',
  },
  headerContent: {
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
  },
  name: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  body: {
    padding: 30,
    backgroundColor: '#E6E6FA',
  },
  box: {
    padding: 10,
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
  username: {
    color: '#20B2AA',
    fontSize: 22,
    alignSelf: 'center',
    marginLeft: 10,
  },

  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  container: {
    height: '90%',
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

export default FriendList