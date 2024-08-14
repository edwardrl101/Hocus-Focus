import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import TodoList from '@/components/TodoList';
import CompletedTasks from '@/components/CompletedTasks';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 


const Tab = createBottomTabNavigator();

const Planner = ({route}) => {
  const { user } = route.params;
  
  return (
    <NavigationContainer independent = {true}>
    <Tab.Navigator initialRouteName="TodoList"
     screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'TodoList') {
          iconName = 'create-outline';
        } else if (route.name === 'CompletedTasks') {
          iconName = 'checkmark-done-outline'; 
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}>
      
      <Tab.Screen 
        name="TodoList" 
        component={TodoList} 
        options={{ tabBarLabel: 'Active Tasks',
          headerShown: false,
         }} 
         initialParams={{user: user}}
      />
      <Tab.Screen 
        name="CompletedTasks" 
        component={CompletedTasks} 
        options={{ tabBarLabel: 'Completed Tasks',
          headerShown: false
         }} 
         initialParams = {{user: user}}
      />
    </Tab.Navigator>
  </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Planner;
