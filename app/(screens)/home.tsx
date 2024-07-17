import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { supabase } from '@/app/(auth)/client';


const screen = Dimensions.get('window');

const formatNumber = number => `0${number}`.slice(-2);

const getRemaining = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time - mins * 60;
    return { mins: formatNumber(mins), secs: formatNumber(secs) };
}

const createMinArray = length => {
    const arr = [];
    let i = 0;
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
  const [selectedMins, setSelectedMins] = useState({"itemValue": "0"});
  const [selectedSecs, setSelectedSecs] = useState({"itemValue": "0"});
  
  const { user } = route.params;
  let interval = null;

  const channel = supabase.channel('stop_activetimer')
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
    }
  ).subscribe()

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
    let duration = parseInt((selectedMins.itemValue), 10) * 60 + parseInt((selectedSecs.itemValue), 10)
    const {data, error} = await supabase.rpc('start_timer', {auth_id : user.id, _duration: duration});
    setRemainingSecs(duration)
    setIsActive(true);
  } 

  const endTimer = async () => {
    setRemainingSecs(0);
    setIsActive(false);
    const {data, error} = await supabase.rpc('stopping_timer', {auth_id : user.id, remain : remainingSecs})
    console.log("error");
    alert('Congratulations! [you will earn some rewards]')
    clearInterval(interval);
    interval = null;
    setRemainingSecs(0);
  }

  const stopTimer = async () => {
    setIsActive(false);
    const {data, error} = await supabase.rpc('stopping_timer', {auth_id : user.id, remain: remainingSecs})
    console.log("call");
    alert('The timer has stopped! [you will lose your rewards]')
    clearInterval(interval);
    interval = null;
    setRemainingSecs(0);
  }

  return (

          <View style={styles.container}>
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
                <Picker
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  selectedValue={selectedSecs.itemValue}
                  onValueChange={itemValue => {
                    setSelectedSecs({itemValue});
                  }}
                  mode="dropDown"
                > 
                  {
                    AVAILABLE_SECONDS.map(value => (
                      <Picker.Item key={value} label={value} value={value} />
                    ))
                  }
                </Picker>
                <Text style={styles.pickerItem}>seconds</Text>
              </View>
            )
          }
          {
            isActive ? (
              <TouchableOpacity 
                onPress={stopTimer}
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
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b2437',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
      borderWidth: 10,
      borderColor: '#f9ebd6',
      width: screen.width / 2,
      height: screen.width / 2,
      borderRadius: screen.width / 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
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
  }
});