import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native'
import { IconButton, FAB, List } from 'react-native-paper';
import AddFriend from '@/components/AddFriend'
import { supabase } from '@/app/(auth)/client'
import {Ionicons} from '@expo/vector-icons';


const FriendList = () => {
    const[_user, getUser] = useState([]);
    const[_uid, getUserID] = useState("");
    const[_friends, getFriends] = useState([]);
    const[loading, setLoading] = useState(true);
    const[updateFriends, setUpdateFriends] = useState(false);

    const[modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
          try{

            console.log("here");
            const { data: { user } } = await supabase.auth.getUser()
            console.log("username: ", user.user_metadata.username);
            getUser(user);

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
    
        loadUser();
    }, []);        
        console.log("outside: ", _user);


    useEffect(() => {
        const loadFriends = async () => {
          console.log(updateFriends)
            if (_user.length != 0 || updateFriends) {
                try{
                    console.log("load friend: ", _user.id);
                    const { data, error } = await supabase.rpc('display_friend', {auth_id : _user.id})
                    console.log(error)
                    console.log("data: ", data);
                    getFriends(data);
                    setLoading(false);
                    setUpdateFriends(false);
                } catch (error) {
                    console.error(error);
                }
            }
        };
    
        loadFriends();
      }, [_user, updateFriends]);


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
          <Text style={styles.name}>{_user.user_metadata.username}</Text>
          <Text style={styles.name}>uid: {_uid}</Text>
        </View>
      </View>

      <View>
        <View style = {styles.title}>
          <Text style = {styles.titleText}>Friends:</Text>
          <TouchableOpacity style={styles.refresh} onPress = {() => setUpdateFriends(true)}>
                <View>
                  <Ionicons name = "refresh" size = {30} color = 'black'/>
                </View>
              </TouchableOpacity>
        </View>
        <FlatList
          style={styles.container}
          scrollEnabled = {true}
          enableEmptySections={true}
          data={_friends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => { return(
            (_friends.length > 0) ? (
              <TouchableOpacity>
                <View style={styles.box}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.username}>uid: {item.id}</Text>
                </View>
              </TouchableOpacity>
            ) : <Text> trying </Text>)
          }}
        />
         <FAB style = {styles.fab}
          small
          icon = "plus"
          onPress={() => setModalVisible(true)}/>
            <AddFriend visible = {modalVisible} 
            onClose = {() => setModalVisible(false)}
            _user = {_user}
            updateFriends = {() => setUpdateFriends(true)}
            my_uid = {_uid}
            currentFriends = {_friends}
            ></AddFriend>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  friendPage: {
    backgroundColor: "#F9DFAD",
  },
  header: {
    backgroundColor: 'purple',
    height: '35%',
    justifyContent: 'center',

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
    height: '55%',
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
  refresh: {
    marginTop: 10,
    marginRight: 10,
  },
})

export default FriendList