import { View, TextInput, StyleSheet, Text, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ref, get, update } from "firebase/database";
import { db } from "../../firebaseConfig";

export default function SettingsDetailScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const userRef = ref(db, "users/default");
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log(data);

          if (typeof data === "object" && data.email) {
            setEmail(String(data.email));
          } else {
            setEmail("");
          }
        } else {
          console.log("No data found");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmail();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1); // Small delay ensures focus works properly
    }, [])
  );

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateEmail = async () => {
    if (email.trim() === "") {
      setError("Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      const userRef = ref(db, "users/default");
      await update(userRef, { email });
      console.log("Email updated successfully");
      navigation.goBack();
    } catch (error) {
      console.log("Error updating email!");
      Alert.alert("Error", "Could not update email. Please try again.");
    }
  };

  // Dynamically set the header title and add email from db as placeholder
  useEffect(() => {
    navigation.setOptions({
      title: "Update Email",
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
        <TouchableOpacity onPress={updateEmail}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, email]);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Enter New Email"
        placeholderTextColor="#5f5f5f"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null); // Clear error when user types
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#ede8d0", // Beige background
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
  inputError: {
    borderColor: "#d9534f", // Red border when error
  },
  errorText: {
    color: "#d9534f",
    fontSize: 14,
    marginTop: 8,
  },
});
