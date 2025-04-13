import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
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
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");

  // Use a ref to store the active WebSocket so we always reference the latest one.
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const socketUrl = "ws://192.168.137.178:100/ws"; // adjust as needed

  // Function to create a new WebSocket connection.
  const connectWebSocket = useCallback(() => {
    console.log("Attempting to connect to", socketUrl);
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("client connected");
      socketRef.current = socket;
    };

    socket.onmessage = (event) => {
      console.log("Message received:", event.data);
      // Process incoming messages as needed.
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
      setConnectionStatus("error");
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("disconnected");
      socketRef.current = null;
      // Attempt to reconnect after 3 seconds.
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
          reconnectTimeoutRef.current = null;
        }, 3000);
      }
    };
  }, [socketUrl]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // Heartbeat to keep connection alive.
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ alive: true }));
      }
    }, 1000);
    return () => clearInterval(heartbeatInterval);
  }, []);

  return (
    <ScrollView style={styles.container} scrollEnabled={scrollEnabled}>
      <Text style={styles.sectionTitle}>Live Camera Feed</Text>
      <View style={styles.statusGrid}>
        {isFocused && <LiveCameraFeed uri="http://192.168.137.178:81/stream" />}
      </View>

      <Joystick
        onStart={() => setScrollEnabled(false)}
        onMove={(direction, speed) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Send a movement command in the expected format.
            const command = JSON.stringify({
              N: 102,
              D1: direction,
              D2: speed,
            });
            socketRef.current.send(command);
          } else {
            console.warn("Cannot send command: WebSocket not connected");
          }
        }}
        onEnd={() => {
          setScrollEnabled(true);
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Send a stop command in the expected format.
            const command = JSON.stringify({
              N: 102,
              D1: 9,  // '9' means stop per your logic.
              D2: 0,
            });
            socketRef.current.send(command);
          } else {
            console.warn("Cannot send stop command: WebSocket not connected");
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

      {/* Display connection status */}
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
