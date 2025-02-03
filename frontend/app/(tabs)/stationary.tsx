import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

// mock data for pet status
const petStatus = {
  potty: "55%", // logging potty capacity
  food: "20%", // logging food level 
  water: "90%", // logging water levels
  timeLastPlay: "1 hour ago", // logs the time since pet got activity
};

const recentLogs = [
  {
    id: "1",
    type: "Feeding",
    details: "12:30 PM - 1 cup of kibble",
  },
  {
    id: "2",
    type: "Exercise",
    details: "10:00 AM - 20 mins",
  },
  
];

const notifications = [
  {
    id: "1",
    type: "Potty",
    message: "11:24 AM - Pet used potty",
  },
  {
    id: "3",
    type: "Connectivity",
    message: "Device offline - check connection",
  },
];

export default function TabStationaryScreen(): JSX.Element {
  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <Text style={styles.logType}>{item.type}</Text>
      <Text style={styles.logDetails}>{item.details}</Text>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationType}>{item.type}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Pet Status Overview */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>Pet Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Potty Capacity:</Text>
          <Text style={styles.statusValue}>{petStatus.potty}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Water Level:</Text>
          <Text style={styles.statusValue}>{petStatus.water}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Food:</Text>
          <Text style={styles.statusValue}>{petStatus.food}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Time Since Last Exercise:</Text>
          <Text style={styles.statusValue}>{petStatus.timeLastPlay}</Text>
        </View>
      </View>

      {/* Recent Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        <FlatList
          data={recentLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>


      {/* Notifications */}
      <View style={styles.notificationsContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

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
  statusContainer: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statusLabel: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#555",
  },
  statusValue: {
    color: "#333",
  },
  logsContainer: {
    marginBottom: 20,
  },
  logItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  logType: {
    fontWeight: "bold",
    color: "#333",
  },
  logDetails: {
    color: "#555",
  },
  quickAccessContainer: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  notificationsContainer: {
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  notificationType: {
    fontWeight: "bold",
    color: "#333",
  },
  notificationMessage: {
    color: "#555",
  },
});