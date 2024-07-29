import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Button, SafeAreaView, Image,} from 'react-native'
import React, { useState, useEffect } from 'react'
import { IconButton, FAB } from 'react-native-paper'
import {supabase} from '@/app/(auth)/client'


const ConfirmPurchase = ({visible, onClose, user_id, char_id, char_name}) => {
    
    const handleClose = () => {
        onClose();
    } 
    const buyChar = async () => {
        const {data, error} = await supabase.rpc('buy_char', {auth_id : user_id, char_id : char_id});
        console.log(error);
        handleClose();
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

        <View style = {styles.searchProfile}>
            <View style={{flexDirection: 'row', marginBottom: 10}}>
                <Text style = {styles.Label}>Would you like to purchase {char_name} for 500</Text>
                <Image style = {{width: 30, height: 30}}
                    source = {{uri: 'https://i.pinimg.com/474x/e3/74/be/e374be19e2d4ae5844b2b46dd80a094a.jpg'}}/>
                <Text>?</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity onPress={handleClose}>
                    <View style={styles.okView}>
                        <Text style={styles.okText}> Cancel </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={buyChar}>
                    <View style={styles.okView}>
                        <Text style={styles.okText}> OK </Text>
                    </View>
                </TouchableOpacity>
            </View>
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
        height: '30%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: '90%',
        padding: 30,
      },

      okView: {
        flexDirection: "row",
        backgroundColor: "transparent",
        width: "100%",
      },

      okText: {
        color: "blue",
        fontSize: 16,
      },

      rewardRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
      },

      Label: {
        fontSize: 16,
        color: "black",
      },

      buttons: {
        width: '100%',
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignContent: 'space-between',
    },

    })

export default ConfirmPurchase
