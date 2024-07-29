import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, SafeAreaView, Image, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar, ProgressBar } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/app/(auth)/client'

const EditProfile = ({ visible, onClose, clearFriend, friend_uid, friend_username}) => {

  const [_id, getID] = useState("");
  const [userExp, setUserExp] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [maxExp, setMaxExp] = useState(1);
  const [charLink, setCharLink] = useState('');
  const[loading, setLoading] = useState(true);
    
    const handleClose = () => {
        onClose();
        clearFriend();
    }

    const loadUser = async () => {
      try{
        const { data, error } = await supabase.rpc('get_friend_id', {friend_uid : friend_uid})
        console.log(error);
        getID(data);
      } catch (error) {
        console.error(error);
      }
    };

    const loadExp = async () => {
      try{
        const { data, error } = await supabase.rpc('load_friend_exp', {friend_uid : friend_uid})
        console.log(error);
        setUserExp(data);
      } catch (error) {
        console.error(error);
      }
    };

    const getChar = async () => {
      if (_id.length > 0) {
        try{
          const { data, error } = await supabase.rpc('get_char_link', {auth_id : _id})
          setCharLink(data);
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
    };

    const calculateLevel = async () => {
      let formula = (Math.sqrt(121 + 4 * userExp / 50) - 11) / 2;
      let currLevel = Math.floor(formula) + 1;
      let maximum = 50 * currLevel * (currLevel + 11);

      setUserLevel(currLevel);
      setMaxExp(maximum);
    }

    useEffect(() => {
      loadExp()
      loadUser();
  }, []);

  useEffect(() => {
    getChar();
  })

  useEffect(() => {
    calculateLevel();
  }, [userExp]);


  if (loading) {
    console.log("load");
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

<View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.username}>{friend_username}</Text>
          <Text style={styles.name}>uid: {friend_uid}</Text>
          <Text style={styles.name}>Level {userLevel}</Text>
          <View style={styles.expBar}>
            <View style={styles.progressBar}>
              <ProgressBar progress={userExp/maxExp} color="#f6ac6c"></ProgressBar>
            </View>
            <Text style={styles.expText}> {userExp} / {maxExp} </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.character}>
          <Image
            style={{height: "90%",width: "90%"}}
            source = {{uri: charLink}}
          />
        </View>
      </View>




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
      justifyContent: "center",
      alignContent: "center",
    },
  
    expBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
  
    },
    expText: {
      color: "#FFFFFF"
    },
    progressBar: {
      width: "70%",
    },
})

export default EditProfile 