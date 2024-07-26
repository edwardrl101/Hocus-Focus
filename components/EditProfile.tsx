import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Button, SafeAreaView, Image, Alert} from 'react-native'
import React, { useState, useEffect } from 'react'
import { IconButton, FAB } from 'react-native-paper'
import {supabase} from '@/app/(auth)/client'


const EditProfile = ({visible, onClose, my_uid}) => {
    
    const [newUsername, setNewUsername] = useState('');
    
    const handleClose = () => {
        if (newUsername.length > 0) {
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
                    setNewUsername('');
                    onClose();
                  }
                }
              ]
            );
          } else {
          onClose();
        }
    } 

    const updateDatabase = async () => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { username: newUsername }
            })
        } catch (error) {
            throw (error)
        }

        try {
            const { data, error } = await supabase
            .from('profile')
            .update({ 
                username: newUsername, 
            })
            .eq('uid', my_uid);
        } catch (error) {
            console.log(error)
        }
        
    }

    const handleSave = () => {
        Alert.alert(
            "Confirm",
            "Do you want to save changes?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "OK",
                onPress: () => {
                  updateDatabase();
                  setNewUsername('');
                  onClose();
                }
              }
            ]
          );
    }

    return(
    <View style = {styles.container}>  
    <Modal
      animationType="fade"
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
            <Text style = {styles.Label}>Username:</Text>
            <TextInput 
                style = {styles.form} 
                placeholder = "Enter new username" 
                value = {newUsername} 
                onChangeText = {setNewUsername}/>
            <TouchableOpacity onPress = {handleSave} >
                <View style={styles.saveButton}>
                    <Text style={styles.buttonText}> Save </Text>
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
          backgroundColor: '#eeeeee', 
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
        backgroundColor: '#eeeeee',
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

      Label: {
        color: "Black",
        paddingTop: 10,
      },

      form: {
        backgroundColor: "white",
        padding: 8,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },

      saveButton: {
        backgroundColor: "#853f43",
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

export default EditProfile
