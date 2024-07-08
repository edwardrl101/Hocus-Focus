import { Text, View, StyleSheet, FlatList, Modal, SectionList, SafeAreaView, Alert, ScrollView } from 'react-native'
import { Provider as PaperProvider, Appbar, FAB, List, IconButton, Searchbar, Checkbox } from 'react-native-paper';
import React, { useState, useEffect } from 'react'
import TaskInputModal from '@/components/TaskInputModal'
import TaskDetailModal from '@/components/TaskDetailModal'
import { differenceInCalendarDays, isToday, isThisWeek, isTomorrow, isThisMonth, isAfter, endOfMonth } from 'date-fns';
import { supabase } from '@/app/(auth)/client'
import TaskDescription from './styles/TaskDescription';

const TodoList = ({route}) => {
  const[modalVisible, setModalVisible] = useState(false);
  const[tasks, setTasks] = useState([]);
  const[selectedTask, setSelectedTask] = useState(null);
  const[taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {user} = route.params;

  const channel = supabase.channel('load_planner_tasks')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'planner',
      filter: `unique_id=eq.${user.id}`,
    },
    (payload) => {
      console.log("payload:", payload);
      loadTasks();

    }
  ).subscribe()
  
  // Load the tasks from Supabase
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      //const { data: { user } } = await supabase.auth.getUser();
      //(user);
      const { data, error } = await supabase.rpc('display_planner', { auth_id: user.id });
      if (error) { throw error; }
      setTasks(data);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  async function handleAddTask (task) {
    try {
      const taskid = Date.now().toString()
      setTasks((prevTasks) => [...prevTasks, { id: taskid, ...task }]);

      const { data, error } = await supabase.rpc('insert_planner', 
        { auth_id : user.id, 
          taskname : task.task, 
          due_date : task.dueDate, 
          start_date: task.startDate,
          categoryname : task.category, 
          task_id : taskid,
          completed_status: task.completedStatus})
  
    } catch (error) {
      console.log(error);
    }
  };

  const toggleCompletion = async (id) => {
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      const updatedStatus = !taskToToggle.completedStatus;

      const { data, error } = await supabase.rpc('toggle_task_completion', 
        { auth_id: user.id, task_id: id, completed_status: updatedStatus });

        setTasks((prevTasks) =>
          prevTasks.map(task => task.id === id ? { ...task, completedStatus: updatedStatus } : task)
        );
        
        loadTasks();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCompleteTask = (id) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to mark this task as completed?.",
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

  async function handleDeleteTask (id) {
    try {
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== id));
      //const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.rpc('delete_planner', 
        { auth_id : user.id, task_id : id})
    } catch (error) {
      console.log(error)
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetailModalVisible(true);
  };

  async function handleSaveTask (id, newTask, newDueDate, newStartDate, newCategory) {
    try {
      const { data, error } = await supabase.rpc('edit_planner', 
        { auth_id : user.id, newtask : newTask, due_date : newDueDate, start_date : newStartDate, newcategory : newCategory, task_id : id })
  
      setTasks((prevTasks) =>
        prevTasks.map(task => task.id === id ? { ...task, task: newTask, dueDate: newDueDate, start_date : newStartDate, category: newCategory } : task)
    );
      setTaskDetailModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Check if a task is due today
  const isForToday = (startDate) => {
    return isToday(new Date(startDate));
  }

  // Check if a task is due tomorrow
  const isForTomorrow = (startDate) => {
    return isTomorrow(new Date(startDate));
  };
  
  // Check if a task is due this week (excluding tomorrow)
  const isForThisWeek = (startDate) => {
    const date = new Date(startDate);
    return isThisWeek(date, { weekStartsOn: 1 }) && !isForTomorrow(startDate); // Assuming week starts on Monday
  };

  // Check if a task is due this month (excluding tomorrow and this week)
  const isForThisMonth = (startDate) => {
    const date = new Date(startDate);
    return isThisMonth(date) && !isForThisWeek(startDate);
  };

  // Check if a task is due next month or later
  const isUpcoming = (startDate) => {
    const date = new Date(startDate);
    return isAfter(date, endOfMonth(new Date()));
  };

  // Check if a task is overdue, including the ones today
  const isOverdue = (dueDate) => {
    const now = new Date();
    const date = new Date(dueDate);
    return date < now;
  };

  // Check if a task is in progress 
  const isInProgress = (startDate, dueDate) => {
    const now = new Date();
    const start = new Date(startDate)
    const end = new Date(dueDate)
    return (start <= now && now <= end);
  }

  // Group the tasks by date
  const groupTasksByDate = (tasks) => {
    const groupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      upcoming:[],
      ungrouped:[],
      inProgress: [],
    };
  
    tasks.forEach(task => {
      if(task.completedStatus === false) {
      if (task.startDate === null) {
        groupedTasks.ungrouped.push(task);
      } else if (isInProgress(task.startDate, task.dueDate)) {
        groupedTasks.inProgress.push(task);
      }else if (isOverdue(task.dueDate)) {
        groupedTasks.overdue.push(task);
      } else if (isForToday(task.startDate)) {
        groupedTasks.today.push(task);
      } else if (isForTomorrow(task.startDate)) {
        groupedTasks.tomorrow.push(task);
      } else if (isForThisWeek(task.startDate)) {
        groupedTasks.thisWeek.push(task);
      } else if (isForThisMonth(task.startDate)) {
        groupedTasks.thisMonth.push(task);
      } else if (isUpcoming(task.startDate)) {
        groupedTasks.upcoming.push(task);
      }
    }
    });
  
    return [
      { title: 'Overdue', data: groupedTasks.overdue },
      { title: 'Today', data: groupedTasks.today},
      { title: 'Tomorrow', data: groupedTasks.tomorrow },
      { title: 'This Week', data: groupedTasks.thisWeek },
      { title: 'This Month', data: groupedTasks.thisMonth },
      { title: 'Upcoming', data: groupedTasks.upcoming },
      { title: 'Ungrouped', data: groupedTasks.ungrouped },
      { title: 'In Progress', data: groupedTasks.inProgress},
    ].filter(section => section.data.length > 0);
  };

  const filteredTasks = tasks.filter(task =>
    task.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTasks = groupTasksByDate(filteredTasks);

  const renderItem = ({ item }) => (
    <List.Item
    title = {item.task}
    description={() => <TaskDescription startDate={item.startDate} dueDate={item.dueDate} category={item.category} />}
    onPress = {() => handleTaskClick(item)}
    right = {() => (
      <Checkbox
      status={item.completedStatus ? 'checked' : 'unchecked'}
      onPress={() => handleCompleteTask(item.id)}
      />
    )}
    style = {styles.listItem}
    />
  );

  return(
    <PaperProvider>
    
    <SafeAreaView style = {styles.container}>

      <ScrollView>

      <List.Section>
        <List.Subheader style = {styles.headerText} >My Active Tasks</List.Subheader>
        <Searchbar
            placeholder="Search"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <SectionList
          sections={groupedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <List.Subheader style={title === 'Overdue' ? styles.overdueText : styles.subheaderText}>{title}</List.Subheader>
          )}
          contentContainerStyle={styles.sectionList}
        />
        
      </List.Section>
      </ScrollView>

    <FAB style = {styles.fab}
    small
    icon = "plus"
    onPress={() => setModalVisible(true)}/>

      <TaskInputModal visible = {modalVisible} 
      onClose = {() => setModalVisible(false)}
      saveTask={handleAddTask}></TaskInputModal>

      {selectedTask && (
        <TaskDetailModal 
        visible = {taskDetailModalVisible}
        task = {selectedTask}
        onClose = {() => setTaskDetailModalVisible(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        />
      )}
      
      </SafeAreaView>
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
  searchBar: {
    backgroundColor: 'transparent'
  }
})

export default TodoList