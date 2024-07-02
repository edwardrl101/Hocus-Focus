import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View, Image } from 'react-native';
import { supabase } from '@/app/(auth)/client'

export default function Profile() {

  return(
      <View style = {styles.container}>
        <View style = {styles.header}>
      <Text style = {styles.headerText}>Profile</Text>

      <View style = {styles.profileContainer}>
        <Image source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar1.png' }} style = {styles.avatar}></Image>
        <Text style = {styles.username} >
            TestUser
        </Text>
        <Text style = {styles.uid}>uid: 00007</Text>
      </View>
      </View>

      </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 24,
        paddingHorizontal: 15,
        marginTop: 10,
        color: 'white'
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 99,
        borderWidth: 4,
    borderColor: '#FFFFFF',
    },
    profileContainer: {
        marginTop: 10,
        alignItems:'center',
        backgroundColor:'purple'
    },
    username: {
        fontSize: 22, 
        fontFamily: 'outfit-medium',
        color: 'white'
    },
    uid: {
        fontSize: 17,
        fontFamily: 'outfit-medium',
        color: 'white'
    },
    header: {
        backgroundColor: 'purple',
        height: '32%'
    }
})