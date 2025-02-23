import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { ref, get, update } from "firebase/database";
import { db } from "../../firebaseConfig";

function SettingsDetailScreen() {
  const [waterRefill, setWaterRefill] = useState<number>(50); // Default value
  const navigation = useNavigation();

  useEffect(() => {
    const fetchWaterRefillLevel = async () => {
      try {
        const userRef = ref(db, "users/default/PetMaintenanceSettings");
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          if (typeof data === "object" && typeof data.waterRefill_level === "number") {
            setWaterRefill(data.waterRefill_level);
          }
        } else {
          console.log("No data found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchWaterRefillLevel();
  }, []);

  const updateWaterRefillLevel = async () => {
    try {
      const userRef = ref(db, "users/default/PetMaintenanceSettings");
      await update(userRef, { waterRefill_level: waterRefill });
      console.log("Setting changed successfully");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating data:", error);
    }
  };

  // Update header with custom title and buttons
  useEffect(() => {
    navigation.setOptions({
      title: "Set Water Level to Refill (%)",
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
        <TouchableOpacity onPress={updateWaterRefillLevel} style={{ marginRight: 10 }}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, waterRefill]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Refill Level: {waterRefill}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={waterRefill}
        onValueChange={setWaterRefill}
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
