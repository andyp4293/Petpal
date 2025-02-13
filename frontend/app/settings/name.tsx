import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import React from "react";


export default function SettingsDetailScreen() {
  const { route } = useLocalSearchParams(); // Get the setting type from the URL
  const [value, setValue] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Update Name</Text>
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
    justifyContent: "center",
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

