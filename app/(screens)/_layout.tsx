import { Stack } from "expo-router";
import { useFonts, } from 'expo-font';
import { AppState, Text } from "react-native";
import React, {useRef, useState, useEffect} from 'react'
import { supabase } from "@/app/(auth)/client"
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '@/app/(screens)/home'
import Notes from '@/app/(screens)/notes'
import Planner from '@/app/(screens)/planner'
import Friends from '@/app/(screens)/friends'
import Settings from '@/app/(screens)/settings'

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
  

  useEffect(() => {
    const getUserInfo = async () => {
    setLoading(true);
      try{
        const { data: { user } } = await supabase.auth.getUser()
        setUserData(user);
      } catch (error) {
        console.error(error);
      }
    };

    getUserInfo();
    setLoading(false);

  }, [_user]); 

  useEffect(() => {
    const handleApp = async nextAppState => {
     if (nextAppState === 'background') {
      const { data, error } = await supabase.rpc('is_timer_on', {auth_id : _user.id});
      console.log("here ", error);
      if (data) {
        const { data, error } = await supabase.rpc('stop_timer', {auth_id : _user.id});
        alert("You have left the app! [you will lose rewards]");
      }
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    };


    const subscription = AppState.addEventListener('change', handleApp)

    return () => {
      subscription.remove();
    };
    
  }, [_user]); 

  if (loading || _user.length === 0) {
    return (
      <Text>Loading...</Text>
      );
  }

  return (
    <Drawer.Navigator initialRouteName="Home">
     <Drawer.Screen name="Home" component={Home} initialParams={{user: _user}}/>
     <Drawer.Screen name="Notes" component={Notes}/>
     <Drawer.Screen name="Planner" component={Planner}/>
     <Drawer.Screen name="Friend" component={Friends}/>
     <Drawer.Screen name="Settings" component={Settings}/>
  </Drawer.Navigator>
  );
}
