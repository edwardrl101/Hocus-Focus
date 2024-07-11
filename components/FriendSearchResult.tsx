import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, SectionList, SafeAreaView, Image, ScrollView} from 'react-native'
import React, { useState, useEffect } from 'react'
import { IconButton, FAB } from 'react-native-paper'
import {supabase} from '@/app/(auth)/client'


const FriendSearchResult = ({visible, clearSearch, onClose, my_uid, searchResult}) => {
    
    const [allowAdd, setAllowAdd] = useState(false);
    const buttonStyle = allowAdd ? styles.validButton : styles.invalidButton;
    
    const handleClose = () => {
        clearSearch();
        setAllowAdd(false);;
        onClose();
    }

    useEffect(() => {
        const checkAllowAdd = async () => {
          try{
            const {data, error} = await supabase.rpc('is_friend', {my_uid : my_uid, search_uid : (searchResult[0].uid)});
            if (!data && my_uid !== searchResult[0].uid) {
                setAllowAdd(true);
            }
          } catch (error) {
            console.error(error);
          }
        };
    
        checkAllowAdd();
    }, []); 

    const sendRequest = async (frienduid) => {
        const {data, error} = await supabase.rpc('send_request', {my_uid : my_uid, _frienduid : frienduid}); 
        setAllowAdd(false);
    }


    return(
    <View style = {styles.container}>  
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={handleClose}
      transparent
    >
      <SafeAreaView style={styles.modalContainer}>

        <View style={styles.modalHeader}>
        <Text style={styles.modalHeaderText}></Text>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={handleClose}
            style={styles.modalCloseButton}
          />
        </View>
        <View style = {styles.searchProfile}>
            <Image
                style={styles.avatar}
                source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar1.png' }}
            />
            <Text style={styles.name}>{searchResult[0].username}</Text>
            <Text style={styles.name}>uid: {searchResult[0].uid}</Text>
            <TouchableOpacity disabled = {!allowAdd} onPress = {() => sendRequest(searchResult[0].uid)} >
                <View style={buttonStyle}>
                    <Text style={styles.buttonText}> Send Request</Text>
                </View>
            </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Modal>
    </View> 
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',

    },
    modalContainer: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          
        },
      modalCloseButton: {
          position: 'absolute',
          top: 10,
          left: 5,
          color: 'white',
        },
      modalHeader: {
          flexDirection: 'row',
          backgroundColor: 'white', 
          padding: 2,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          width: '90%',
        },
      modalHeaderText: {
          fontSize: 25,
          fontWeight: 'bold',
          marginTop: 18,
          marginLeft: 55,
          
      },
      searchProfile: {
        backgroundColor: 'white',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: '90%',
        padding: 30,
      },
      name: {
        fontSize: 20,
        color: 'black',
        fontWeight: '600',
      },
      avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        marginBottom: 10,
      },
      validButton: {
        backgroundColor: "purple",
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        height: 35,
        width: 100,
        borderRadius: 50,
        marginTop : 10,
      },
      invalidButton: {
        backgroundColor: "#808080",
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        height: 35,
        width: 100,
        borderRadius: 50,
        marginTop: 10,
      },
      buttonText: {
        color: 'white'
      },

    })

export default FriendSearchResult
