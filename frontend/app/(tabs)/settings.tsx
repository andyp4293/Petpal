import React, { useState } from "react";
import { StyleSheet, Switch, TextInput, Button } from "react-native";
import { Text, View } from "@/components/Themed";

export default function TabSettingsScreen() {
  // State for toggle switches and text inputs
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [username, setUsername] = useState("");

  // Handlers to toggle settings
  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);
  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Username Input */}
      <View style={styles.row}>
        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Notification Toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications:</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      {/* Theme Toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>Dark Theme:</Text>
        <Switch value={isDarkTheme} onValueChange={toggleTheme} />
      </View>

      {/* Save Button */}
      <Button title="Save Settings" onPress={() => alert("Settings saved")} />
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    flex: 1,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});
