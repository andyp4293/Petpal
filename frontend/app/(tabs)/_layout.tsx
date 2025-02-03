import React, { useState } from "react";
import { Tabs } from "expo-router";
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import CustomHeader from "../components/CustomHeader";



export default function TabLayout() {
  const colorScheme = "dark"; // color scheme = dark mode

  // state for the selected date of the calendar
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] // default state = today's date
  );


  return (
    <View style={{ flex: 1 }}>
      {/* tabs */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarStyle: { backgroundColor: "#1e3504" }, // background color of the tab bar
        }}
      >
        {/* home tab */}
        <Tabs.Screen
          name="index" // corresponds to /(tabs)/index.tsx
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={26} name="home" color={color} />
            ),
            header: () => (
              <CustomHeader title = "Home"/> // custom colored header
            ), 
          }}
        />

        {/* mobile control tab */}
        <Tabs.Screen
          name="mobile" // corresponds to /(tabs)/mobile.tsx
          options={{
            title: "Mobile",
            tabBarIcon: ({ color }) => (
              <Ionicons size={26} name="grid" color={color} />
            ),
            header: () => (
              <CustomHeader title = "Mobile Control"/> // custom colored header
            ), 
          }}
        />

        {/* chat tab */}
        <Tabs.Screen
          name="stationary" // corresponds to /(tabs)/stationary.tsx
          options={{
            title: "Stationary ",
            tabBarIcon: ({ color }) => (
              <Ionicons size={26} name="chatbubble" color={color} />
            ),
            header: () => (
              <CustomHeader title = "Stationary Control"/> // custom colored header
            ), 
          }}
        />

        {/* settings tab */}
        <Tabs.Screen
          name="settings" // corresponds to /(tabs)/settigs.tsx
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={26} name="user-gear" color={color} />
            ),
            header: () => (
              <CustomHeader title = "Settings"/> // custom colored header
            ), 
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#C8102E",
    padding: 15,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  calendarContainer: {
    backgroundColor: "#1C1C1C",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
    zIndex: 1,
  },
});

