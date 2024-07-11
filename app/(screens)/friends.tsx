import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import FriendList from '@/components/FriendList'

export default function Friends({route}) {
  const { user } = route.params; 
  
  return(
        <SafeAreaView>
        <FriendList
        user = {user}></FriendList>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });