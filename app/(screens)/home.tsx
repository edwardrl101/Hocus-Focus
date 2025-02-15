import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Dimensions, Platform, Image, ImageBackground } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Picker } from "@react-native-picker/picker";
import { supabase } from '@/app/(auth)/client';
import RewardModal from '@/components/RewardModal';
import { Center } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';


const screen = Dimensions.get('window');

const formatNumber = number => `0${number}`.slice(-2);

const getRemaining = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time - mins * 60;
    return { mins: formatNumber(mins), secs: formatNumber(secs) };
}

const createMinArray = length => {
    const arr = [];
    let i = 10;
    while(i <= length){
      arr.push(i.toString());
      i += 10;
    }
    return arr;
  }
  const createSecArray = length => {
    const arr = [];
    let i = 0;
    while(i < length){
      arr.push(i.toString());
      i += 1;
    }
    return arr;
  }



const AVAILABLE_MINUTES = createMinArray(60);
const AVAILABLE_SECONDS = createSecArray(60);

export default function Home({route}) {
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { mins, secs } = getRemaining(remainingSecs);
  const [selectedMins, setSelectedMins] = useState({"itemValue": "10"});
  const [selectedSecs, setSelectedSecs] = useState({"itemValue": "0"});
  const [modalVisible, setModalVisible] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [coins, setCoins] = useState(-1);
  
  const { user } = route.params;
  let interval = null;

  const channel1 = supabase.channel('stop_activetimer')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'activetimer',
      filter: `id=eq.${user.id}`,
    },
    (payload) => {
      console.log("payload6:", payload);
      stopTimer();
      loadCoin();
    }
  ).subscribe()

  const channel2 = supabase.channel('display_home_coin')
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
  
  useEffect(() => {
    loadCoin();
  }, [coins]);

  useEffect(() => {
    interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setRemainingSecs(prevSecs => prevSecs - 1);
      }, 1000);
      getRemaining(remainingSecs);
      if(remainingSecs === 0) {
        endTimer();
      }
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, remainingSecs]);

  const startTimer = async () => {
    let duration = parseInt((selectedMins.itemValue), 10) * 60
    const {data, error} = await supabase.rpc('start_timer', {auth_id : user.id, _duration: duration});
    setRemainingSecs(duration)
    setIsActive(true);
  } 

  const endTimer = async () => {
    setIsActive(false);
    const {data, error} = await supabase.rpc('stopping_timer', {auth_id : user.id, remain : remainingSecs})
    setIsFailed(false);
    console.log(error);
    setModalVisible(true);
    //alert('Congratulations! [you will earn some rewards]')
    clearInterval(interval);
    interval = null;
    setRemainingSecs(0);
  }

  const stopTimer = async () => {
    setIsActive(false);
    const {data, error} = await supabase.rpc('stopping_timer', {auth_id : user.id, remain: remainingSecs})
    console.log(error);
    setIsFailed(true);
    setModalVisible(true);
    //alert('The timer has stopped! You did not earn any rewards!')
    clearInterval(interval);
    interval = null;
    setRemainingSecs(0);
  }

  const updateActiveTimer = async () => {
    const { data, error } = await supabase.rpc('fail_timer', {auth_id: user.id})
    stopTimer();
  }

  return (
    
    <ImageBackground source = {require('@/assets/images/home-background.png')} resizeMode = 'stretch'>
          <View style={styles.container}>
            <View style={styles.header}>
            <View>
              <Text style = {styles.titleText}>HocusFocus</Text>
              <Text style ={styles.WelcomeText}>Start being productive now!</Text>

              <View style={styles.coinRow}>
                <View style={styles.coinBox}>
                  <Image style = {{width: 30, height: 30}}
                  source = {{uri: 'https://odecpyodlpiobahncupr.supabase.co/storage/v1/object/public/character_images/Wizards/coin.png'}}/>
                  {(coins>0) ? <Text style = {styles.coinText}>{coins}</Text> : <Text style = {styles.coinText}> </Text>}
                </View>
              </View>
            </View>
            </View>
          <StatusBar barStyle="light-content" />
          {
            isActive ? (
              <Text style={styles.timerText}>{`${mins}:${secs}`}</Text>
            ) : (
                <View style={styles.pickerContainer}>
                <Picker
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  selectedValue={selectedMins.itemValue}
                  onValueChange={itemValue => {
                    setSelectedMins({itemValue});
                  }}
                  mode="dropDown"
                > 
                  {
                    AVAILABLE_MINUTES.map(value => (
                      <Picker.Item key={value} label={value} value={value} />
                    ))
                  }
                </Picker>
                <Text style={styles.pickerItem}>minutes</Text>
              </View>
            )
          }
          {
            isActive ? (
              <TouchableOpacity 
                onPress={updateActiveTimer}
                style={[styles.button, styles.buttonStop]}
                >
                  <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
                </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={startTimer}
                style={styles.button}
                >
                  <Text style={styles.buttonText}>Start</Text>
                </TouchableOpacity>
            )
          }
          <RewardModal visible = {modalVisible}
            onClose = {() => setModalVisible(false)}
            resetFail = {() => setIsFailed(false)}
            isFailed = {isFailed}
            duration = {parseInt((selectedMins.itemValue), 10) * 60}
            ></RewardModal>
            
        </View>
        </ImageBackground>
        
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  },
  button: {
      borderWidth: 10,
      borderColor: '#f9ebd6',
      width: screen.width / 2,
      height: screen.width / 2,
      borderRadius: screen.width / 2,
      alignItems: 'center',
      justifyContent: 'center',
      //marginTop: 100,
  },
  buttonText: {
      fontSize: 45,
      color: '#f9ebd6'
  },
  timerText: {
      color: '#fff',
      fontSize: 90,
  },

  buttonStop: {
    borderColor: "#f6ac6c"
  },

  buttonTextStop: {
    color: "#f6ac6c"
  },

  picker: {
    flex: 1,
    maxWidth: 100,
    ...Platform.select({
      android: {
        color: "#fff",
        backgroundColor: "rgba(92, 92, 92, 0.206)",
      }
    })
  },
  pickerItem: {
    color: "#fff",
    fontSize: 20,
    ...Platform.select({
      android: {
        marginLeft: 10,
        marginRight: 10,
      }
    })
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  coinBox: {
    borderWidth: 3,
    borderColor: '#eeeeee',
    width: 150,
    height: 50,
    backgroundColor:'#3b2437',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
    flexDirection: 'row',
  },
  coinText: {
    color: 'white',
    fontSize: 15,
  },
  titleText: {
    fontSize: 52,
    fontFamily: 'Bigelow',
    color: "white",
    //paddingTop: 60,
  },
  WelcomeText: {
    color : "white", 
    fontStyle: 'italic', 
    fontSize: 15,
  },
  header: {
    flexDirection: 'column', 
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    width: '100%',
    height: '33%',
    padding: 30,
    //backgroundColor: 'black',
  },
  coinRow:
  {
    //backgroundColor: "yellow",
    height: '50%',
    justifyContent: "center",
  }
});