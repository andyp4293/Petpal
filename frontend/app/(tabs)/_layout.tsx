import React, { useState } from "react";
import { Tabs } from "expo-router";
import { FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { StyleSheet, View } from "react-native";
import HomeHeader from "../components/HomeHeader";



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
        }}
      >
        {/* home tab */}
        <Tabs.Screen
          name="index" // corresponds to /(tabs)/index.tsx
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
            header: () => (
              <HomeHeader // custom header for home tab
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            ), 
          }}
        />

        {/* explore tab */}
        <Tabs.Screen
          name="explore" // corresponds to /(tabs)/explore.tsx
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="grid" color={color} />
            ),
          }}
        />

        {/* chat tab */}
        <Tabs.Screen
          name="chat" // corresponds to /(tabs)/chat.tsx
          options={{
            title: "Chat",
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="chatbubble" color={color} />
            ),
          }}
        />

        {/* settings tab */}
        <Tabs.Screen
          name="settings" // corresponds to /(tabs)/settigs.tsx
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={28} name="user-gear" color={color} />
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

