import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 

// mock data for pet status
const petStatus = {
  potty: "55%", // logging potty capacity
  food: "20%", // logging food level
  water: "90%", // logging water levels
  timeLastPlay: "3 hour ago", // logs the time since pet got activity
};

// Recent logs data
const recentLogs = [
  { id: "1", type: "Feeding", details: "12:30 PM - 1 cup of kibble" },
  { id: "2", type: "Exercise", details: "10:00 AM - 20 mins" },
];

// Notifications data
const notifications = [
  { id: "1", type: "Potty", message: "11:24 AM - Pet used potty" },
  { id: "3", type: "Connectivity", message: "Device offline - check connection" },
];

type LogItemProps = { id: string; type: string; details?: string; message?: string };

// reusable list item for logs & notifications
const ListItem = ({ type, details, message }: LogItemProps) => (
  <View style={styles.listItem}>
    <Text style={styles.itemType}>{type}</Text>
    <Text style={styles.itemText}>{details || message}</Text>
  </View>
);

type StatusCardProps = {
  title: string;
  value: number | string;
  icon: string;
};

const StatusCard = ({ title, value, icon }: StatusCardProps) => {
  const progressBarWidth = typeof value === 'number' ? value : parseFloat(value);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <FontAwesome5 name={icon} size={18} color="#1e3504" />
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: progressBarWidth }]} />
      </View>
      <Text style={styles.cardValue}>{typeof value === 'string' ? value : `${value}px`}</Text>
    </View>
  );
};

export default function TabHomeScreen(): JSX.Element {
  return (
    <ScrollView style={styles.container}>
      {/* Pet Status Overview */}
      <Text style={styles.sectionTitle}>Pet Status</Text>
      <View style={styles.statusGrid}>
        <StatusCard title="Potty Capacity" value={petStatus.potty} icon="toilet" />
        <StatusCard title="Water Level" value={petStatus.water} icon="tint" />
        <StatusCard title="Food Level" value={petStatus.food} icon="pizza-slice" />
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Last Exercise</Text>
            <FontAwesome5 name="dumbbell" size={18} color="#1e3504" />
          </View>
          <Text style={styles.timeValue}>{petStatus.timeLastPlay}</Text>
          <Text style={styles.timeLabel}>Time since last activity</Text>
        </View>
      </View>

      {/* Recent Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <FlatList
          data={recentLogs}
          renderItem={({ item }) => <ListItem {...item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Notifications */}
      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <FlatList
          data={notifications}
          renderItem={({ item }) => <ListItem {...item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ede8d0",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e3504",
  },
  statusGrid: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    color: "#1e3504",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginVertical: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1e3504",
    borderRadius: 3,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeLabel: {
    fontSize: 14,
    color: "#555",
  },
  logsContainer: {
    marginBottom: 20,
  },
  notificationsContainer: {
    marginBottom: 20,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
  },
  itemType: {
    fontWeight: "bold",
    color: "#333",
  },
  itemText: {
    color: "#555",
  },
});

