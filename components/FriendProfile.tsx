import { Text, View, StyleSheet, FlatList, Modal, TextInput, TouchableOpacity, SectionList, SafeAreaView, KeyboardAvoidingView, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/app/(auth)/client'
import ListSection from 'react-native-paper/lib/typescript/components/List/ListSection';
import {Ionicons} from '@expo/vector-icons';
import FriendSearchResult  from '@/components/FriendSearchResult'

const FriendProfile = ({ visible, onClose, friend_username, friend_uid }) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [searchDisplay, setSearchDisplay] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const[modalVisible, setModalVisible] = useState(false);
    
    const handleClose = () => {
        setSearchDisplay([]);
        setSearchQuery('');
        onClose();
    }

    return (
    <Modal style = {styles.modalContainer}
    animationType = "slide" 
    visible = {visible}
    onRequestClose={handleClose}>

      <SafeAreaView style = {styles.modalContainer}>

      <View style = {styles.modalHeader}>
      <Text style = {styles.modalHeaderText}> Friend's Profile </Text>
      </View>
      <IconButton style = {styles.modalCloseButton}
      icon = "arrow-left"
      size = {30}
      onPress={handleClose}></IconButton>

      <Text> username: {friend_username} </Text>
      <Text> friend's uid: {friend_uid} </Text>


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

})

export default FriendProfile