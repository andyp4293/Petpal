import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ref, onValue, get, update } from "firebase/database"
import { db } from "../../firebaseConfig"

export default function SettingsDetailScreen() {
  const [ownersName, setOwnersName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const userRef = ref(db, 'users/default');
        const snapshot = await get(userRef)

        if(snapshot.exists()){
          const data = snapshot.val();
          console.log("Bruh ", data);
          
          if(typeof data === "object" && data.ownerName){
            setOwnersName(String(data.ownerName));
          }
          else{
            setOwnersName("");
          }
        }
        else{
          console.log('No data found');
        }
      }
      catch(error){
        console.error(error)
      }
    };

    fetchOwnerName();
  }, []);

  const updateName = async () => {
    try {
      if(ownersName.trim() === ""){
        console.log(ownersName);
        console.log("Name can not be empty");
        return;
      }

      const userRef = ref(db, "users/default");
      await update(userRef, { ownerName: ownersName })
      console.log("Name changed successfully");
      navigation.goBack();
      
    }
    catch(error){
      console.log("Error!");
    }
  }

  // Dynamically set the header title and add name from db as placeholder
  useEffect(() => {
    navigation.setOptions({
      title: "Update Owner's Name",
      headerStyle: { backgroundColor: "#1e3504" },
      headerTintColor: "#fff",
      headerTitleAlign: "center",
      headerBackTitleVisible: false, // Hides back title text on iOS
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={updateName}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )
    });
  }, [navigation, ownersName]);
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={`Enter New Owner's Name`}
        placeholderTextColor="#5f5f5f"
        value={ownersName}
        onChangeText={setOwnersName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ede8d0", // Beige background
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3504", // Dark earthy green
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#5a7748", // Muted earthy green border
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
});
