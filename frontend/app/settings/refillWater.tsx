import { View, TextInput, StyleSheet } from "react-native";
import { useState, useEffect, useRef} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback} from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ref, get, update } from "firebase/database"
import { db } from "../../firebaseConfig"

export default function SettingsDetailScreen() {
  const [waterRefill, setWaterRefill] = useState("");
  const navigation = useNavigation();
    const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const userRef = ref(db, 'users/default/PetMaintenanceSettings');
        const snapshot = await get(userRef)

        if(snapshot.exists()){
          const data = snapshot.val();
          
          if(typeof data === "object" && data.waterRefill_level){
            setWaterRefill(String(data.waterRefill_level));
          }
          else{
            setWaterRefill("");
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

    useFocusEffect(
      useCallback(() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 1); // Small delay ensures focus works properly
      }, [])
    );

  const updateName = async () => {
    try {
      if(waterRefill.trim() === ""){
        console.log(waterRefill);
        console.log("Value can not be empty");
        return;
      }

      const userRef = ref(db, "users/default/PetMaintenanceSettings");
      await update(userRef, { waterRefill_level: waterRefill })
      console.log("Setting changed successfully");
      navigation.goBack();
      
    }
    catch(error){
      console.log("Error!");
    }
  }

  // Dynamically set the header title and add name from db as placeholder
  useEffect(() => {
    navigation.setOptions({
      title: "Update At What Water Level to Refill",
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
  }, [navigation, waterRefill]);
  

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={`Enter New Level to Refill Water`}
        placeholderTextColor="#5f5f5f"
        value={waterRefill}
        onChangeText={setWaterRefill}
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
