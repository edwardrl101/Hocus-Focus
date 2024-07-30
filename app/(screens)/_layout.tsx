import { useFonts, } from 'expo-font';
import { AppState, Text } from "react-native";
import React, {useRef, useState, useEffect} from 'react'
import { differenceInSeconds } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from "@/app/(auth)/client"
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '@/app/(screens)/home'
import Notes from '@/app/(screens)/notes'
import Planner from '@/app/(screens)/planner'
import Friends from '@/app/(screens)/friends'
import Settings from '@/app/(screens)/settings'
import Profile from '@/app/(screens)/profile'
import Statistics from '@/app/(screens)/statistics';
import Store from './store';

const Drawer = createDrawerNavigator();

export default function RootLayout() {
  
  const [_user, setUserData] = useState([]);
  const[loading, setLoading] = useState(true);
  
  const [fontsLoaded] = useFonts({
    'Oswald': require('@/assets/fonts/Oswald-Bold.ttf'),
    'Bigelow': require('@/assets/fonts/BigelowRules-Regular.ttf')
  });

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [startTime, setStartTime] = useState(new Date());

  const getUserInfo = async () => {
    setLoading(true);
      try{
        const { data: { user } } = await supabase.auth.getUser()
        setUserData(user);
      } catch (error) {
        console.error(error);
      }
    };
  
  useEffect(() => {
    getUserInfo();
    setLoading(false);
  }, [_user]); 

  useEffect(() => {
    const handleApp = async nextAppState => {
      if (nextAppState === 'background' && _user !== null && _user.length !== 0) {
        const { data, error } = await supabase.rpc('is_timer_on', {auth_id : _user.id});
        if (data) {
          const { data, error } = await supabase.rpc('fail_timer', {auth_id: _user.id})
        }

        let endTime = new Date();
        let difference = differenceInSeconds(endTime, startTime);

        if (endTime.toLocaleDateString() === startTime.toLocaleDateString()) {
          //updateData(startTime.toISOString().split('T')[0], difference.toString());
          const {data, error} = await supabase.rpc('update_screentime', {auth_id : _user.id, _date: endTime, _seconds : difference});
          console.log(error);
        } else {
          let midnight = endTime;
          midnight.setHours(0,0,0);
          let nextDayTime = differenceInSeconds(endTime, midnight);
          const {data: nextDayData, error: nextDayError} = await supabase.rpc('update_screentime', 
            {auth_id : _user.id, _date: endTime, _seconds : nextDayTime});
          const {data: prevDayData, error: prevDayError} = await supabase.rpc('update_screentime', 
            {auth_id: _user.id, _date: startTime, _seconds: difference - nextDayTime});
        }
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
      setStartTime(new Date());
    };


    const subscription = AppState.addEventListener('change', handleApp)

    return () => {
      subscription.remove();
    };
    
  }, [_user]); 

  if (loading || _user === null || _user.length === 0) {
    return (
      <Text>Loading...</Text>
      );
  }

  return (
    <Drawer.Navigator initialRouteName="Home">
     <Drawer.Screen name="Home" component={Home} initialParams={{user: _user}}/>
     <Drawer.Screen name="Notes" component={Notes} initialParams={{user: _user}}/>
     <Drawer.Screen name="Planner" component={Planner} initialParams={{user: _user}}/>
     <Drawer.Screen name="Friend" component={Friends} initialParams={{user: _user}}/>
     <Drawer.Screen name="Profile" component={Profile} initialParams={{user: _user}}/>
     <Drawer.Screen name="Statistics" component ={Statistics} initialParams={{user: _user}}/>
     <Drawer.Screen name="Store" component ={Store} initialParams={{user: _user}}/>
     <Drawer.Screen name="Settings" component={Settings}/>

  </Drawer.Navigator>
  );
}