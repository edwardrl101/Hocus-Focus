import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { Box, Button, ButtonText } from "@gluestack-ui/themed";
import { CartesianChart, Bar, Pie, PolarChart } from "victory-native";
import { useFont, vec } from "@shopify/react-native-skia";
import { LinearGradient } from "@shopify/react-native-skia";
import { COLORMODES } from "@gluestack-style/react/lib/typescript/types";
import { Ionicons } from '@expo/vector-icons'; 
import { IconButton, FAB } from 'react-native-paper';
import { supabase } from '@/app/(auth)/client'

const oswald = require("@/assets/fonts/SpaceMono-Regular.ttf");

export default function Statistics({route}) {
  const colorMode = useColorScheme() as COLORMODES;
  const font = useFont(oswald, 12);
  const { user } = route.params;  
  const [failedSessionsCount, setFailedSessionsCount] = useState(null);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(null);
  const [_uid, getUserID] = useState("");
  const [totalTasks, setTotalTasks] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(null);
  const [taskStats, setTaskStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenTime, setScreenTime] = useState([]);

  const fetchScreenTime = async () => { // function to fetch screen times for each day
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const startDate = sevenDaysAgo.toISOString().split('T')[0]; 
    const endDate = today.toISOString().split('T')[0]; 

    try {
      const { data, error } = await supabase
      .from('screentime')
      .select('date, total_time')
      .eq('unique_id', user.id);
      console.log("time:", data )
      if(!data) {
        console.error(error)
        return
      } 
      const filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        console.log("Item Date:", item.date, "Parsed Date:", itemDate);
        return itemDate >= new Date(startDate) && itemDate < new Date(endDate);
      });
      console.log("Filtered screen time data:", filteredData);

      const dateRange = [];
    let currentDate = new Date(startDate);
    while (currentDate < new Date(endDate)) {
      dateRange.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dateToTimeMap = filteredData.reduce((acc, item) => {
      acc[item.date] = parseFloat((item.total_time / 3600).toFixed(2)); // Convert and round total_time
      return acc;
    }, {});

    const completeData = dateRange.map(date => dateToTimeMap[date] || 0);

    console.log("Complete numeric data with zeros for missing dates:", completeData);

    setScreenTime(completeData); // Update state with just the numbers

    console.log("TIME IS:", completeData)
      
  
      
    } catch (error) {
      console.error(error);
    }
    
    
  }

  const loadUser = async () => { // load the user's uid
    try{
      const { data, error } = await supabase
      .from('profile')
      .select('uid')
      .eq('id', user.id);
      console.log("id: ", data[0].uid);
      getUserID(data[0].uid);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFailedSessionsCount = async () => { // fetch the number of interrupted sessions
    setLoading(true);
    const { data, error } = await supabase.rpc('get_failed_timer_sessions_count', { user_id : _uid });
    console.log(data)

    if (error) {
      console.error('Error fetching failed timer sessions count:', error);
    } else {
      setFailedSessionsCount(data);
    }
    setLoading(false);
  };

  const fetchCompletedSessionsCount = async () => { // fetch the number of completed sessions
    setLoading(true);
    const { data, error } = await supabase.rpc('get_completed_timer_sessions_count', { user_id : _uid });
    console.log(data)

    if (error) {
      console.error('Error fetching completed timer sessions count:', error);
    } else {
      setCompletedSessionsCount(data);
    }
    setLoading(false);
  };

  const fetchCompletedTasks = async () => { // fetch the number of completed tasks
    setLoading(true);
    const { data, error } = await supabase.rpc('count_completed_tasks_last_week', { user_uid: _uid });
    console.log(data);

    if (error) {
      console.error('Error fetching completed tasks for last week:', error);
    } else {
      setCompletedTasks(data);
    } 
    setLoading(false);
  }

  const fetchTotalTasks = async () => { // fetch the total number of tasks
    setLoading(true);
    const { data, error } = await supabase.rpc('count_tasks_last_week', { user_uid: _uid });
    console.log(data);

    if (error) {
      console.error('Error fetching total tasks for last week:', error);
    } else {
      setTotalTasks(data);
    } 
    setLoading(false);
  }

  const getCompletedTasksStats = async () => { // get each category, and the number of tasks in each category
    setLoading(true);
    const { data, error } = await supabase.rpc('fetch_completed_tasks_stats', { user_uid : _uid});
    
    const stats = data;

    const formattedData = stats.map((item) => ({
      label: item.category,
      value: parseFloat(item.task_count),
      color: getRandomColor(),
    }));

    console.log(formattedData);

    if (error) {
      console.error('Error fetching statistics of completed tasks', error);
    } else {
      setTaskStats(formattedData);
      console.log(taskStats);
    }
    setLoading(false);
  }
  

  const updateData = () => { // Retrieves data from Supabase and updates the state variables
    fetchScreenTime();
    fetchCompletedSessionsCount();
    fetchFailedSessionsCount();
    fetchCompletedTasks();
    fetchTotalTasks();
    getCompletedTasksStats();
  };

  useEffect(() => {
    loadUser();
    updateData(); 

    const intervalId = setInterval(() => { // Update the data every Sunday (new week)
      const today = new Date();
      if (today.getDay() === 0) { 
        updateData();
      }
    }, 86400000); 

    return () => clearInterval(intervalId); 
  }, [_uid]);

  if (loading) { 
    return (
    <View style = {{flex: 1}}>
    <ActivityIndicator style = {{marginTop: 250}} size = "large" color = "0000ff"></ActivityIndicator>
    </View>)
  }

  const incomplete = totalTasks - completedTasks;

  const GENERATE = (length: number = 7) => // Generate an array to be used for the bar chart
    Array.from({ length }, (_, index) => ({
      month: index + 1,
      listenCount: screenTime[index]
    }));

    const times = GENERATE(7);
    console.log(times);

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

  const dataset = [
    { label: "complete", value: completedTasks, color: "#1E99F2" },
    { label: "incomplete", value: incomplete, color: "white"}
  ]

  const rate = ((completedTasks / totalTasks) * 100);

  const roundIfDecimal = (num) => {
    
    const hasDecimal = num % 1 !== 0;
    
    if (hasDecimal) {
      return parseFloat(num.toFixed(1)); 
    } else {
      return num; 
    }
  };

  const findAverage = (array) => {
    if (array.length === 0) return 0; 
    const sum = array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return sum / array.length;
  };

  const findMaxIndex = (array) => {
    if (array.length === 0) return null; // Handle empty array case
    let maxIndex = 0;
    for (let i = 1; i < array.length; i++) {
      if (array[i] > array[maxIndex]) {
        maxIndex = i;
      }
    }
    return maxIndex;
  };

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const getDayOfWeek = (index) => {
  return daysOfWeek[index % daysOfWeek.length];
};

  const roundedRate = roundIfDecimal(rate);
  const averageTime = findAverage(screenTime).toFixed(2);
  const maxDay = findMaxIndex(screenTime)
  console.log("MAX IS:", maxDay)
  const mostProductiveDay = getDayOfWeek(maxDay);

  

  const updateChart = () => {
    setBarData(DATA(7));
  };

  

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.titleText}>Analytics</Text>
        <Text style={styles.contentText}>Evaluate your performance over the last week!</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.sectionBox}>
          <View style={{flexDirection: 'row'}}>
          <Text style={styles.appUsage}>App Usage (hrs)</Text>
          </View>
          <View style={styles.underline} />

          <Box paddingTop={10} width="100%" height={200}>
            <CartesianChart
              data={times}
              xKey="month"
              padding={5}
              yKeys={["listenCount"]}
              domain={{ y: [0, 10] }}
              domainPadding={{ left: 50, right: 50, top: 30 }}
              axisOptions={{
                font,
                tickCount: 7,
                labelColor: "black",
                lineColor: {
                  grid: {
                    x: "white",
                    y: "black"
                  },
                  frame: "black"
                },
                formatXLabel: (value) => {
                  const daysOfWeek = ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  // Assuming 'value' is an index for days of the week (0 for Sunday, 6 for Saturday)
                  return daysOfWeek[value  - 1% 7];
                },
              }}
            >
              {({ points, chartBounds }) => {
                return (
                  <>
                    <Bar
                      points={points.listenCount}
                      chartBounds={chartBounds}
                      animate={{ type: "timing", duration: 1000 }}
                      roundedCorners={{
                        topLeft: 10,
                        topRight: 10,
                      }}
                      innerPadding={0.4}
                    >
                      <LinearGradient
                        start={vec(0, 0)}
                        end={vec(0, 500)}
                        colors={["#1E99F2", "#E2EBF1"]}
                      />
                    </Bar>
                  </>
                );
              }}
            </CartesianChart>
          </Box>

          <Box paddingTop={10} width="100%" alignItems="center">
            <Text style = {{marginBottom: 10}}>You spent an average of {averageTime} hours last week being productive! You were most productive on {mostProductiveDay}!
            </Text>
          </Box>
        </View>

        <View style = {styles.sectionBox}>
          <Text style = {styles.appUsage}>Task Completion</Text>
          <View style = {styles.underline}/>
          <View style = {styles.chartWrapper}>
          <Box paddingTop={20} width="100%" height={200} alignItems="center">
          <PolarChart
        data={taskStats}
        labelKey="label"
        valueKey="value"
        colorKey="color"
        containerStyle={styles.chartContainer}
        canvasStyle={styles.chartCanvas}
      >
        <Pie.Chart innerRadius={75} >
          </Pie.Chart>
      </PolarChart>
      </Box>
      

      <View style={styles.textContainer}>
        <Text style={styles.text}>{completedTasks}</Text>
        <Text style = {styles.tasksCompleted}>Tasks Completed</Text>
      </View>
      </View>

      <View style={styles.legendContainer}>
        {taskStats.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style = {{marginTop: 30, fontSize: 20, fontWeight: 'bold'}}>Your Task Completion rate is...</Text>

      <View style = {styles.chartWrapper}>
      <Box paddingTop={20} width="100%" height={200} alignItems="center">
          <PolarChart
        data={dataset}
        labelKey="label"
        valueKey="value"
        colorKey="color"
        containerStyle={styles.chartContainer}
        canvasStyle={styles.chartCanvas}
      >
        <Pie.Chart innerRadius={75} >
          </Pie.Chart>
      </PolarChart>
      </Box>
      <View style={styles.donutLabel}>
        <Text style={styles.text}>{roundedRate}%</Text>
      </View>
      </View>

      <Text style = {{marginTop: 20, marginBottom: 20}}>You completed {completedTasks} out of {totalTasks} tasks this week!</Text>
        </View>

        <View style = {{flexDirection: 'row'}}>
          <View style = {styles.sessionBox}>
          <Text style = {{ fontSize: 30, fontWeight: 'bold', color: "white",  marginTop: 40}}> {completedSessionsCount}</Text>
          <Text style = {{textAlign: 'center', color: "white", fontSize: 16, fontWeight:'semibold'}}> Completed Productivity Sessions</Text>
          </View>

          <View style = {[styles.sessionBox, styles.interruptedBox]}>
          <Text style = {{ fontSize: 30, fontWeight: 'bold', color: "white",  marginTop: 40}}> {failedSessionsCount}</Text>
          <Text style = {{textAlign: 'center', color: "white", fontSize: 16, fontWeight:'semibold'}}> Interrupted Productivity Sessions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    paddingHorizontal: 10,
  },
  header: {
    flex: 1,
    backgroundColor: "white",
    height: 85,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  titleText: {
    fontSize: 32,
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  contentText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'semibold',
  },
  sectionBox: {
    marginTop: 25,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
  },
  appUsage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
  underline: {
    backgroundColor: 'black',
    height: 1,
    alignContent: 'center',
    marginHorizontal: 8,
    marginTop: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  reloadButton: {
    marginLeft: 150,
    marginTop: 8
  },
  chartContainer: {
    height: 300,
    width: 300,
  },
  chartCanvas: {
    height: 300,
    width: 300,
  },
  textBox: {
    alignItems: "center",
    marginTop: 20,
  },
  textContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -55 }, { translateY: -30 }],
  },
  text: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendLabel: {
    marginRight: 5,
    fontSize: 16,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  donutLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -15 }],
  },
  tasksCompleted: {
    color: '#929292',
  },
  sessionBox: {
    backgroundColor: '#15BC76',
    borderRadius: 26,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'column',
    width: 183,
    height: 190,
    alignItems: 'center',
    marginTop: 25
  },
  interruptedBox: {
    backgroundColor: '#EA5858',
    marginLeft: 7
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

