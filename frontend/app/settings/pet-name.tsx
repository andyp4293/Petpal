import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsDetailScreen() {
  const { route } = useLocalSearchParams(); // Get the setting type from the URL
  const [value, setValue] = useState("");
  const navigation = useNavigation();

  // Dynamically set the header title
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
    });
  }, [navigation]);
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={`Enter New Owner's Name`}
        placeholderTextColor="#5f5f5f"
        value={value}
        onChangeText={setValue}
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
