import { Text, View, StyleSheet, FlatList, Modal, SectionList, SafeAreaView, Alert, ScrollView} from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar, Checkbox } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import TaskInputModal from '@/components/TaskInputModal'
import TaskDetailModal from '@/components/TaskDetailModal'
import { differenceInCalendarDays, isToday, isThisWeek, isTomorrow, isThisMonth, isAfter, endOfMonth } from 'date-fns';
import { supabase } from '@/app/(auth)/client'
import TaskDescription from './styles/TaskDescription';

const CompletedTasks = ({route}) => {
  const[modalVisible, setModalVisible] = useState(false);
  const[tasks, setTasks] = useState([]);
  const[selectedTask, setSelectedTask] = useState(null);
  const[taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = route.params;

  const channel = supabase.channel('load_completed_tasks')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'planner',
      filter: `unique_id=eq.${user.id}`,
    },
    (payload) => {
      console.log("payload2: ", payload);
      loadCompletedTasks();

    }
  ).subscribe()
  
  useEffect(() => {
    loadCompletedTasks();
  }, []);

  const loadCompletedTasks = async () => {
    try {
      const { data, error } = await supabase.rpc('display_planner', { auth_id: user.id });
      if (error) { throw error; };
      const sortedTasks = data.filter(task => task.completedStatus === true)
                               .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setTasks(sortedTasks);
    } catch (error) {
      console.error(error);
    }
  };

  setTimeout(() => {
    loadCompletedTasks();
  }, 200)


  const toggleCompletion = async (id) => {
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      const updatedStatus = !taskToToggle.completedStatus;

      const { data, error } = await supabase.rpc('toggle_task_completion', 
        { auth_id: user.id, task_id: id, completed_status: updatedStatus });

        setTasks((prevTasks) =>
          prevTasks.map(task => task.id === id ? { ...task, completedStatus: updatedStatus } : task)
        );

    } catch (error) {
      console.log(error);
    }
  };

  const handleUndo = (id) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to undo marking this task as complete?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            toggleCompletion(id)
          }
        }
      ]
    );
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const groupTasksByCompletion = (tasks) => {
    const groupedTasks = {
      done: [],
    };
  
    tasks.forEach(task => {
      if(task.completedStatus === true) {
        groupedTasks.done.push(task);
    }
    });
  
    return [
      { title: 'Done', data: groupedTasks.done},
    ].filter(section => section.data.length > 0);
  };

  const filteredTasks = tasks.filter(task =>
    task.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTasks = groupTasksByCompletion(filteredTasks)

  const renderItem = ({ item }) => (
    <List.Item
    title = {item.task}
    description={() => <TaskDescription startDate={item.startDate} dueDate={item.dueDate} category={item.category} />}
    right = {() => (
      <Checkbox
      status={item.completedStatus ? 'checked' : 'unchecked'}
      onPress={() => handleUndo(item.id)}
      />
    )}
    titleStyle = {styles.completedText}
    descriptionStyle = {styles.completedText}
    style = {styles.listItem}
    />
  );


    return (
        <PaperProvider>
          <ScrollView style = {styles.container}>
        <List.Section>
            <List.Subheader style = {styles.headerText}>My Completed Tasks </List.Subheader>
            <Searchbar
            placeholder="Search"
            onChangeText={handleSearch}
            value = {searchQuery}
            style={styles.searchBar}
          />
          <SectionList
          sections={groupedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <List.Subheader style={styles.subheaderText}>{title}</List.Subheader>
          )}
          contentContainerStyle={styles.sectionList}
        />
        </List.Section>
        </ScrollView>
        </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#F9DFAD'
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      borderRadius: 28,
    },
    headerText: {
      fontWeight: 'bold',
      marginTop: 5,
      fontSize: 25,
      color: 'purple'
    },
    overdueText: {
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 5,
      color: 'red'
    },
    subheaderText: {
      fontWeight: 'bold',
      fontSize: 20,
      paddingVertical: 5,
      color: 'purple'
    },
    section: {
      marginBottom: 20,
    },
    listItem: {
      backgroundColor: '#E1BEE7',  
      borderRadius: 20,
      marginVertical: 10,
      marginHorizontal: 20,
      paddingVertical: 10,
      paddingHorizontal: 15,
      shadowColor: '#000000', 
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1,
      elevation: 3,
    },
    sectionList: {
      marginBottom: 20
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: 'grey',
    },
    searchBar: {
      backgroundColor: 'transparent'
    }
  })

  export default CompletedTasks