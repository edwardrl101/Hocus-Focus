import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View, Image } from 'react-native';
import { IconButton, FAB, List } from 'react-native-paper';
import { supabase } from '@/app/(auth)/client'
import EditProfile from '@/components/EditProfile'
import {ProgressBar} from 'react-native-paper';

export default function Profile({route}) {
    const[_uid, getUserID] = useState("");
    const [userExp, setUserExp] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [maxExp, setMaxExp] = useState(1);
    const [charLink, setCharLink] = useState('');
    const[loading, setLoading] = useState(true);
    const[modalVisible, setModalVisible] = useState(false);

    const { user } = route.params; 

    const channel = supabase.channel('display_exp')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        console.log("exp change:", payload);
        loadExp();
      }
    ).subscribe()

    const channel2 = supabase.channel('load_char')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profile',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        console.log("char", payload);
        getChar();
      }
    ).subscribe()

    const loadUser = async () => {
      try{
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

    const loadExp = async () => {
      try{
        const { data, error } = await supabase
        .from('inventory')
        .select('exp')
        .eq('id', user.id);
        console.log("exp ", data[0].exp);
        setUserExp(data[0].exp);
      } catch (error) {
        console.error(error);
      }
    };

    const getChar = async () => {
      try{
        const { data, error } = await supabase.rpc('get_char_link', {auth_id : user.id})
        setCharLink(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
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
      getChar();
  }, []);

  useEffect(() => {
    calculateLevel();
  }, [userExp]);

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
          <Text style={styles.username}>{user.user_metadata.username}</Text>
          <Text style={styles.name}>uid: {_uid}</Text>
          <Text style={styles.name}>Level {userLevel}</Text>
          <View style={styles.expBar}>
            <View style={styles.progressBar}>
              <ProgressBar progress={(userExp/maxExp)} color="#f6ac6c"></ProgressBar>
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

      <FAB style = {styles.fab}
          small
          icon = "pen"
          color = "white"
          onPress={() => setModalVisible(true)}/>

      <EditProfile visible = {modalVisible}
      onClose = {() => setModalVisible(false)}
      user = {user}
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
  fab: {
    position: 'absolute',
    backgroundColor: '#853f43',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
})