import React, { useState, useEffect } from 'react';
import { SafeAreaView, Button, StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '@/app/(auth)/client';
import ConfirmPurchase from '@/components/ConfirmPurchase';

export default function Store({route}) {
    
    const [coins, setCoins] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [_shop, getShop] = useState([]);
    const [_userchar, getUserChar] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [char_id, setCharID] = useState(-1);
    const [char_name, setCharName] = useState('');
    const { user } = route.params;

    const channel2 = supabase.channel('update_store_coin')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        console.log("payload7:", payload);
        loadCoin();
      }
    ).subscribe()

    const channel1 = supabase.channel('display_curr_char')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_characters',
        filter: `unique_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("uc:", payload);
        loadUserChar();
      }
    ).subscribe()
  
    const loadCoin = async () => {
      try{
        const { data, error } = await supabase
        .from('inventory')
        .select('coins')
        .eq('id', user.id);
        console.log("coins: ", data[0].coins);
        setCoins(data[0].coins);
      } catch (error) {
        console.error(error);
      }
    }

    const loadShop = async() => {
      try{
        const {data, error} = await supabase.rpc('display_shop', {});
          getShop(data);
          console.log(data);
      } catch (error) {
        console.error(error);
      }
    }

    const loadUserChar = async () => {
      try{
        const {data, error} = await supabase.rpc('load_user_char', {auth_id : user.id});
          const arr = []
          for (let i = 0; i < data.length; i++) {
            arr.push(data[i].character_id)
          }
          console.log(arr);
          getUserChar(arr);
          setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    const handleBuy = (id, name) => {
      if (coins < 500) {
        alert('Insufficent coins!');
      }
      else {
        setCharID(id);
        setCharName(name);
        setModalVisible(true);
      }
    }

    useEffect(() => {
        loadCoin();
        loadShop();
        loadUserChar();
      }, []);

      if (loading) {
        console.log("load");
        return (
            <Text>Loading...</Text>
        )
      }

    return (
        <View>
          <View style = {{backgroundColor: "#f9dfad"}}>
            <View style={styles.coinBox}>
                <Image style = {{width: 30, height: 30}}
                source = {{uri: 'https://i.pinimg.com/474x/e3/74/be/e374be19e2d4ae5844b2b46dd80a094a.jpg'}}/>
                {(coins>0) ? <Text style = {styles.coinText}>{coins}</Text> : <Text style = {styles.coinText}> </Text>}
            </View>
          </View>
          <FlatList
          style={styles.container}
          scrollEnabled = {true}
          enableEmptySections={true}
          data={_shop}
          keyExtractor={item => item.id}
          renderItem={({ item }) => { return(
              <TouchableOpacity disabled = {_userchar.includes(item.id)} onPress = {() => handleBuy(item.id, item.name)}>
                <View style={styles.box}>
                  <Image style={{width: "80%", height : '80%'}} source = {require('@/assets/images/test.png')}></Image>
                  <Text style={styles.username}>{item.name}</Text>
                  {!(_userchar.includes(item.id)) ? 
                  <View style={styles.price}>
                    <Text> 500 </Text>
                    <Image style = {{width: 30, height: 30}}
                      source = {{uri: 'https://i.pinimg.com/474x/e3/74/be/e374be19e2d4ae5844b2b46dd80a094a.jpg'}}/>
                  </View> : 
                  
                  <View style={styles.price}>
                    <Text>Unlocked!</Text>
                  </View>}
                </View>
              </TouchableOpacity>
              
              )
          }}
        />

          <ConfirmPurchase visible = {modalVisible}
            onClose = {() => setModalVisible(false)}
            char_id = {char_id}
            char_name = {char_name}
            user_id = {user.id}
            ></ConfirmPurchase>
        </View>

  
    )
}

const styles = StyleSheet.create({
    coinBox: {
        borderWidth: 3,
        borderColor: '#eeeeee',
        width: 150,
        height: 50,
        backgroundColor:'#3b2437',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 10,
      },
      coinText: {
        color: 'white',
        fontSize: 15,
      },
      box: {
        padding: 10,
        height: 300,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 1,
          width: -2,
        },
        elevation: 2,
        justifyContent: "center",
        alignContent: "center",
      },
      username: {
        color: 'black',
        fontSize: 22,
        alignSelf: 'center',
        marginLeft: 10,
      },
      container: {
        backgroundColor: '#f9dfad',
        height: '100%',
      },
      price: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }
}
)