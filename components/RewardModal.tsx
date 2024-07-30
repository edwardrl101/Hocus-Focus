import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, Button, SafeAreaView, Image,} from 'react-native'
import React, { useState, useEffect } from 'react'
import { IconButton, FAB } from 'react-native-paper'
import {supabase} from '@/app/(auth)/client'


const RewardModal = ({visible, onClose, resetFail, isFailed, duration}) => {
    
    let exp = duration;
    let coins = duration/120 + 6  * (duration/600 -1);
    
    const handleClose = () => {
        resetFail();
        onClose();
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

        {isFailed ? 
        <View style = {styles.searchProfile}>
            <Text style = {styles.Label}>The timer has stopped! You did not earn any rewards!</Text>
            <TouchableOpacity onPress={handleClose}>
                <View style={styles.okView}>
                    <Text style={styles.okText}> OK </Text>
                </View>
            </TouchableOpacity>
        </View>
        
        : <View style = {styles.searchProfile}>
            <Text style = {styles.Label}>Congratulations! You have earned the following rewards:</Text>
            <View style = {{marginTop: 20, marginBottom: 20}}>
                <View style = {styles.rewardRow}>
                    <Text style = {styles.Label}> {coins} </Text>
                    <Image style = {{width: 30, height: 30}}
                source = {{uri: 'https://odecpyodlpiobahncupr.supabase.co/storage/v1/object/public/character_images/Wizards/coin.png'}}/>
                </View>
                <View style = {styles.rewardRow}>
                    <Text style = {styles.Label}> {exp} </Text>
                    <Image style = {{width: 30, height: 30}}
                source = {{uri: 'https://cdn-icons-png.flaticon.com/512/5542/5542205.png'}}/>
                </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
                <View style={styles.okView}>
                    <Text style={styles.okText}> OK </Text>
                </View>
            </TouchableOpacity>
        </View>}

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
        justifyContent:"flex-end",
      },

      okText: {
        color: "blue",
        fontSize: 16,
      },

      rewardRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      },

      Label: {
        fontSize: 16,
        color: "black",
      }

    })

export default RewardModal
