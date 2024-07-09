import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter} from 'expo-router'
import { supabase } from '@/app/(auth)/client'

const sections = [
    {
    header: 'General',
    items: [
        { id: 'language', icon: 'globe', label: 'Language'},
        { id: 'notification', icon: 'bell', label: 'Notifications'},
    ],
   },

   {
    header: 'Privacy',
    items: [
        { id: 'acc', icon: 'user', label: 'Account Details'},
        { id: 'account', icon: 'lock', label: 'Account Privacy'},
    ],
   },
   {
    header: 'Help',
    items: [
        { id: 'bug', icon: 'flag', label: 'Report Bugs'},
        { id: 'contact', icon: 'mail', label: 'Contact Us'}
    ]
   },

   {
    header: 'Log Out',
    items: [
        { id: 'logout', icon: 'lock', label: 'Log Out'}
    ]
   }
]

export default function Settings() {

    const router = useRouter();
    const handleLogout = async () => {
        Alert.alert(
            "Log out of HocusFocus?",
            "Are you sure you want to log out?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Yes",
                onPress: async () => {
                    try{
                        const { error } = await supabase.auth.signOut()
                        router.push("/login");
                    }catch (error){
                        console.log(error);
                    } 
                }
              }
            ]
          );
    }

    return(
        <SafeAreaView style = {styles.container}>
            <View style = {styles.header}>
        <Text style = {styles.headerText}>Settings</Text>
        </View> 
        {sections.map(({ header, items }) => (
            <View style = {styles.sectionContainer} key = {header}>
                <View>
                    <Text style = {styles.subheaderText}>{header}</Text>
                </View>

                <View style = {styles.sectionBody}>
                    {items.map(({ id, icon, label }) => (
                        <TouchableOpacity
                        key={id}
                        onPress={id === 'logout' ? handleLogout : () => {}}>
                        <View style = {styles.listItem}>
                        <View style = {styles.itemWrapper} key ={id}>
                            <Feather name = {icon} color = '#616161' size = {20} style = {styles.iconStyle} ></Feather>
                        <Text style = {styles.itemText}>{label}</Text>
                        </View>
                        </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        ))}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    header: {
        paddingVertical: 24,
    },
    headerText: {
        paddingHorizontal: 24,
        fontWeight: 'bold',
        fontSize: 32,
        marginBottom: 5,
    },
    subheaderText: {
        fontWeight: '500',
        fontSize: 14,
        color: '#929292',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 24
    }, 
    sectionContainer: {
        paddingTop: 12
    },
    listItem: {
        borderTopWidth: 1,
        borderColor: '#e3e3e3',
        backgroundColor: '#fff',
        paddingHorizontal: 12
    },
    itemWrapper: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderColor: '#e3e3e3',
        paddingHorizontal: 12
    },
    sectionBody: {
        paddingTop: 12
    },
    iconStyle: {
        marginRight: 12
    },
    itemText: {
        fontSize: 18
    }
})