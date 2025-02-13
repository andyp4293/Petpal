import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState } from "react";

export default function SettingsDetailScreen() {
  const { route } = useLocalSearchParams(); // Get the setting type from the URL
  const [value, setValue] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Change {route}</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter new ${route}`}
        value={value}
        onChangeText={setValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});
