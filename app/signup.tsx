import { View, Text, StyleSheet, SafeAreaView, 
  TextInput, TouchableOpacity, KeyboardAvoidingView, 
  ActivityIndicator, ScrollView, Image } from "react-native"
import { useState } from "react"
import { supabase } from '../app/client'
import { useRouter, Link } from 'expo-router'
import BackArrow from "@/components/styles/BackArrow"

export default function signup() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
      let errors = {};
      if(!username) errors.username = "Username is required";
      if(!email) errors.email = "Email is required";
      if(!password) errors.password = "Password is required";
      if(!confirmation) errors.confirmation = "Password is required";
  
      setErrors(errors);
  
      return Object.keys(errors).length === 0;
    }

    async function handleSubmit() {
      setLoading(true);
      if(!validateForm()) {
        setLoading(false);
        return;
      }
      console.log("Submitted", username, email, password, confirmation);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmation("");
      setErrors({});

      if(password != confirmation) {
        alert("Passwords do not match")
        setLoading(false);
        return
      }

      const { data, error } = await supabase.rpc('is_email_exist', { mail: email })
      if (data) {
        alert("Email entered already exists")
        setLoading(false);
        return
      }
      
      try{
        const { data, error } = await supabase.auth.signUp(
          {
            email: email,
            password: password, //check if password match
            options: {
              data: {
                username: username,
              }
            }
          }
        )
        if(error) throw error
        alert("Confirmation email sent! Click the link in your email to activate your account.")
        router.push("/confirmation")
      } catch (error) {
        alert(error)
      }
      setLoading(false);
    }

    return (
        <SafeAreaView style = {styles.container}>

          <Link href = "/login" asChild>
            <TouchableOpacity onPress = {() => setErrors({})}>
              <BackArrow></BackArrow>
          </TouchableOpacity>
          </Link>
          
          <ScrollView> 

            <Text style = {styles.titleText}>HocusFocus</Text>
            <Text style = {styles.WelcomeText}>Tis' the beginning of your journey...</Text>

            <KeyboardAvoidingView behavior="padding" style = {styles.bodyContainer}>

            <Text style = {styles.createAccountText}>Sign up</Text>

            <Text style = {styles.Label}>Username</Text>
            <TextInput 
             style = {styles.form} 
             placeholder = "Enter your username" 
             value = {username} 
             onChangeText = {setUsername}/>

             {
             errors.username ? <Text style = {styles.errorText}>{errors.username}</Text> : null // display the error message
             // if nothing is typed in
             }

             <Text style = {styles.Label}>Email</Text>
             <TextInput 
             style = {styles.form} 
             placeholder = "Enter your email" 
             value = {email} 
             onChangeText = {setEmail}/>

             {
             errors.email ? <Text style = {styles.errorText}>{errors.email}</Text> : null // display the error message
             // if nothing is typed in
             }

             <Text style = {styles.Label}>Password</Text>
             <TextInput 
             style = {styles.form} 
             placeholder = "Create a new password" 
             value = {password} 
             onChangeText = {setPassword}
             secureTextEntry
             />

             {
             errors.password ? <Text style = {styles.errorText}>{errors.password}</Text> : null // display the error message
             // if nothing is typed in
             }

             <Text style = {styles.Label}>Confirm Password</Text>
             <TextInput 
             style = {styles.form} 
             placeholder = "Confirm your password" 
             value = {confirmation} 
             onChangeText = {setConfirmation}
             secureTextEntry
             />

             {
             errors.confirmation ? <Text style = {styles.errorText}>{errors.confirmation}</Text> : null // display the error
             // message if nothing is typed in
             }

             </KeyboardAvoidingView>

             {
             loading ? (<ActivityIndicator size = "large" color = "#0000ff"></ActivityIndicator>) : (
            <TouchableOpacity style = {styles.authButton} onPress = {() => handleSubmit()}>
            <Text style = {styles.authText}>SIGN UP</Text>
            </TouchableOpacity>
             )}
             </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor:"#4D3548" 
    },
    titleText: {
        fontFamily: 'Bigelow',
        fontSize: 52,
        color: "white",
        textAlign: "center",
        paddingTop: 20
    },
    WelcomeText: {
        color : "white", 
        fontStyle: 'italic', 
        fontSize: 15,
        textAlign: "center"
      },
      createAccountText: {
        color : "white",
        paddingTop: 20,
        fontSize: 20,
        fontWeight: "500"
      },
      bodyContainer: {
        paddingHorizontal: 40
      },
      Label: {
        color: "#BFBFBF",
        paddingTop: 10,
      },
      placeholderText: {
        color: "#828282",
      },
      form: {
        backgroundColor: "white",
        padding: 8,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      authButton: {
        backgroundColor: "#F9DFAD",
        marginTop: 35,
        padding: 10,
        alignSelf: "center",
        width: "80%",
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      authText: {
        color: "#828282",
        textAlign: "center",
        fontWeight: "bold"
      },
      errorText: {
        color: "red",
      },
      backArrow: {
        height: 30,
        width: 30,
        marginTop: 20,
        marginHorizontal: 10
      }
     
})