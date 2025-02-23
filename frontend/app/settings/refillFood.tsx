import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { ref, get, update } from "firebase/database";
import { db } from "../../firebaseConfig";

function SettingsDetailScreen() {
  const [foodRefill, setFoodRefill] = useState<number>(50); // Default value
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFoodRefillLevel = async () => {
      try {
        const userRef = ref(db, "users/default/PetMaintenanceSettings");
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          if (typeof data === "object" && typeof data.foodRefill_level === "number") {
            setFoodRefill(data.foodRefill_level);
          }
        } else {
          console.log("No data found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchFoodRefillLevel();
  }, []);

  const updateFoodRefillLevel = async () => {
    try {
      const userRef = ref(db, "users/default/PetMaintenanceSettings");
      await update(userRef, { foodRefill_level: foodRefill });
      console.log("Setting changed successfully");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating data:", error);
    }
  };

  // Update header with custom title and buttons
  useEffect(() => {
    navigation.setOptions({
      title: "Set Food Level to Refill (%)",
      headerStyle: { backgroundColor: "#1e3504" },
      headerTintColor: "#fff",
      headerTitleAlign: "center",
      headerBackTitleVisible: false,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={updateFoodRefillLevel} style={{ marginRight: 10 }}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, foodRefill]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Refill Level: {foodRefill}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={foodRefill}
        onValueChange={setFoodRefill}
        minimumTrackTintColor="#1e3504"
        maximumTrackTintColor="#D3D3D3"
        thumbTintColor="#1e3504"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ede8d0",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3504",
    marginBottom: 12,
    textAlign: "center",
  },
  slider: {
    width: "90%",
    height: 40,
  },
});

export default SettingsDetailScreen;
