import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import { supabase } from '@/app/(auth)/client'
import EditProfile from '@/components/EditProfile'

export default function Profile({route}) {
    const[_uid, getUserID] = useState("");
    const[loading, setLoading] = useState(true);
    const[modalVisible, setModalVisible] = useState(false);

    const { user } = route.params; 

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

  const handleEditProfile = () => {
    setModalVisible(true);
    console.log(modalVisible);
  }

  if (loading) {
    console.log("load");
    return (
        <Text>Loading...</Text>
    )
  }

  return(
    <View style = {styles.profilePage}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton icon = "pen" iconColor='#f9ebd6' onPress = {handleEditProfile} size={30}></IconButton> 
          <Text style={styles.username}>{user.user_metadata.username}</Text>
          <Text style={styles.name}>uid: {_uid}</Text>
          <Text style={styles.name}>Level 1</Text>
        </View>
      </View>
        
      <View style={styles.content}>
        <View style={styles.character}>
          <Image
            style={{height: "100%",width: "50%"}}
            source = {{uri: "https://nutechology.com/wp-content/uploads/2018/07/kyt_wizard_400.jpg"}}
          />
        </View>
      </View>

      <EditProfile visible = {modalVisible}
      onClose = {() => setModalVisible(false)}
      my_uid = {_uid}>
      </EditProfile>
      
    </View>
  )
}

const styles = StyleSheet.create({
  profilePage: {
    alignContent: "center",
    justifyContent: "center"
  },
  header: {
    backgroundColor: '#853f43',
    height: '35%',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  content: {
    height: '65%',
    backgroundColor: '#f9dfad',
  },
  headerContent: {
    padding: 30,
    flexDirection: 'column',
    height: '100%',
    justifyContent:'space-around',
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
  username: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  character: {
    backgroundColor: "white",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
})