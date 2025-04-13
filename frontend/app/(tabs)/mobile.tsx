import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import TcpSocket from "react-native-tcp-socket";
import LiveCameraFeed from "../components/LiveCameraFeed";
import Joystick from "../components/Joystick";
import { useIsFocused } from "@react-navigation/native";

const recentLogs = [
  { id: "1", type: "Feeding", details: "12:30 PM - 1 cup of kibble" },
  { id: "2", type: "Exercise", details: "10:00 AM - 20 mins" },
];

const notifications = [
  { id: "1", type: "Potty", message: "11:24 AM - Pet used potty" },
  { id: "3", type: "Connectivity", message: "Device offline - check connection" },
];

type LogItemProps = {
  id: string;
  type: string;
  details?: string;
  message?: string;
};

const ListItem = ({ type, details, message }: LogItemProps) => (
  <View style={styles.listItem}>
    <Text style={styles.itemType}>{type}</Text>
    <Text style={styles.itemText}>{details || message}</Text>
  </View>
);

export default function TabMobileScreen(): JSX.Element {
  const isFocused = useIsFocused();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [socket, setSocket] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");

  const connectToRobotTCP = () => {
    const options = {
      port: 100, // Make sure this matches the port used in your ESP32 code.
      host: "192.168.137.178", // Use your ESP32's IP address.
      tls: false,
      // Optional: you can set a connection timeout and other options here.
    };

    // Create a TCP socket connection.
    const client = TcpSocket.createConnection(options, () => {
      console.log("[TCP] Connected to robot");
      setConnectionStatus("client connected");
    });

    client.on("data", (data: any) => {
      console.log("[TCP] Received data:", data.toString());
      // Process incoming data as needed.
    });

    client.on("error", (error: any) => {
      console.log("[TCP] Error:", error);
      setConnectionStatus("error");
    });

    client.on("close", () => {
      console.log("[TCP] Connection closed");
      setConnectionStatus("disconnected");
      // Optionally, attempt to reconnect after a delay:
      setTimeout(connectToRobotTCP, 3000);
    });

    setSocket(client);
  };

  useEffect(() => {
    connectToRobotTCP();
    return () => {
      if (socket) {
        socket.destroy();
      }
    };
  }, []);

  // Optional: Send a heartbeat message periodically.
  useEffect(() => {
    if (!socket) return;
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.destroyed === false) {
        socket.write("{Heartbeat}");
      }
    }, 1000); // Send every 1 second.
    return () => clearInterval(heartbeatInterval);
  }, [socket]);

  return (
    <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
      <Text style={styles.sectionTitle}>Live Camera Feed</Text>
      <View style={styles.statusGrid}>
        {isFocused && <LiveCameraFeed uri="http://192.168.137.178:81/stream" />}
      </View>

      <Joystick
        onStart={() => setScrollEnabled(false)}
        onMove={(direction, speed) => {
          if (socket && socket.destroyed === false) {
            const command = JSON.stringify({
              command: "move",
              direction,
              speed,
            });
            socket.write(command);
          } else {
            console.warn("Cannot send command: TCP socket not connected");
          }
        }}
        onEnd={() => {
          setScrollEnabled(true);
          if (socket && socket.destroyed === false) {
            const command = JSON.stringify({
              command: "stop",
              direction: 9, // '9' indicates stop per your logic.
              speed: 0,
            });
            socket.write(command);
          } else {
            console.warn("Cannot send stop command: TCP socket not connected");
          }
        }}
      />

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

      {/* Display the connection status */}
      <View style={styles.connectionStatusContainer}>
        <Text style={styles.connectionStatusText}>{connectionStatus}</Text>
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
  connectionStatusContainer: {
    padding: 10,
    alignItems: "center",
  },
  connectionStatusText: {
    fontSize: 16,
    color: "#007AFF",
  },
});
