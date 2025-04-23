import React, {useEffect, useState, } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { ref, get, onValue } from "firebase/database"
import { db } from "../../firebaseConfig"
import StatusCardComponent from "../components/StatusCardComponent";

// mock data for pet status
const petStatus = {
  potty: "55%", // logging potty capacity
  food: "20%", // logging food level
  water_level: "90%", // logging water_level levels
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
  const [cardWidth, setCardWidth] = useState(0); 


  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace("%", ""));

  const progressBarWidth = Math.min(cardWidth, Math.round((numericValue / 100) * cardWidth));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <FontAwesome5 name={icon} size={18} color="#1e3504" />
      </View>
      <View style={styles.progressBarContainer} onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}>
        <View style={[styles.progressBar, { width: progressBarWidth }]} />
      </View>
      <Text style={styles.cardValue}>{`${numericValue}%`}</Text>
    </View>
  );
};

export default function TabHomeScreen(): JSX.Element {
    const [water_level, setWater] = useState<string>("");
    const [food_level, setFood] = useState<string>(""); 
    const [potty_level, setPotty] = useState<string>(""); 
    const [notifications, setNotifications] = useState<
    Array<{ id: string; type: string; message: string }>>([]);
  
    


      useEffect(() => {
        const newNotifications = [];
      
        // Potty level check
        const pottyLevel = parseFloat(potty_level);
        if (!isNaN(pottyLevel) && pottyLevel <= 20) {
          newNotifications.push({
            id: 'potty-low',
            type: 'Potty',
            message: `Potty level is low (${pottyLevel}%). Replace soon!`,
          });
        }
      
        // Food level check
        const foodLevel = parseFloat(food_level);
        if (!isNaN(foodLevel) && foodLevel <= 34) {
          newNotifications.push({
            id: 'food-low',
            type: 'Food',
            message: `Food level is low (${foodLevel}%). Refill soon!`,
          });
        }
      
        // Water level check
        const waterLevel = parseFloat(water_level);
        if (!isNaN(waterLevel) && waterLevel <= 34) {
          newNotifications.push({
            id: 'water-low',
            type: 'Water',
            message: `Water level is low (${waterLevel}%). Refill soon!`,
          });
        }
      
        setNotifications(newNotifications);
      }, [water_level, food_level, potty_level]);

      useEffect(() => {
        const userRef = ref(db, 'users/default/PetStatus');
        const unsubscribe = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Real-time update:", data);
            
            // Update all states directly from snapshot
            setWater(data.water_level?.toString() || "N/A");
            setFood(data.food_level?.toString() || "N/A");
            setPotty(data.potty_level?.toString() || "N/A");
          }
        });
    
        // Cleanup function
        return () => unsubscribe();
      }, []); 

  return (
    <ScrollView style={styles.container}>
      {/* Pet Status Overview */}
      <Text style={styles.sectionTitle}>PetPal Overview</Text>
      <StatusCardComponent water_level = {water_level} food_level = {food_level} potty_level = {potty_level} showReset = {false} />


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
    width: "100%",
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

