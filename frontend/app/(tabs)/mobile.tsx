import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity
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
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Robot not connected");

  // const ipAddress = "192.168.4.1"; // use this for when we connect directly to robot
  const ipAddress = "192.168.137.213" // use this for when we use the hotspot

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addonSocketRef = useRef<WebSocket | null>(null);

  const socketUrl = `ws://${ipAddress}:100/ws`; // adjust as needed

  // Function to create a new WebSocket connection.
  const connectWebSocket = useCallback(() => {
    console.log("Attempting to connect to", socketUrl);
    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("Robot connected");
      socketRef.current = socket;
    };

    socket.onmessage = (event) => {
      console.log("Message received:", event.data);
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
      setConnectionStatus("error");
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus("Robot not connected");
      socketRef.current = null;
      // reconnect after 3 seconds
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
          reconnectTimeoutRef.current = null;
        }, 3000);
      }
    };
  }, [socketUrl]);

  // establish websocket on mount
  useEffect(() => {
    addonSocketRef.current = new WebSocket("ws://192.168.137.59:81");

    addonSocketRef.current.onopen = () => {
      console.log("WebSocket for (bubbles and food) connected");
    }
    addonSocketRef.current.onmessage = (event) => {
      console.log("Bubbles and Food Received from ESP: ", event.data);
    }
    addonSocketRef.current.onerror = (error) => {
      console.log("Bubbles and Food WebSocket error: ", error);
    }
    addonSocketRef.current.onclose = () => {
      console.log("Bubbles and Food WebSocket closed");
    }

    return () => {
      addonSocketRef.current?.close();
    }
  }, [])

  // helper function for commmand handling with bubble and food dispenser
  const sendCommand = (command: number, value: number) => {
    if (addonSocketRef.current?.readyState === WebSocket.OPEN) {
      console.log("Hello I am sending!!!");
      addonSocketRef.current.send(JSON.stringify({
        N: command,
        D1: value
      }));
    }
    else {
      console.log("Not connected - can not send commands");
    }
  };

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
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Live Camera Feed</Text>
        <Text
          style={[
            styles.connectionStatusText,
            {
              color:
                connectionStatus === 'Robot connected'
                  ? '#28a745'
                  : connectionStatus === 'Robot not connected'
                  ? '#dc3545'
                  : '#007AFF',
            },
          ]}
        >
          {connectionStatus}
        </Text>

      </View>
      <View style={styles.statusGrid}>
        {isFocused && <LiveCameraFeed uri= {`http://${ipAddress}:81/stream`} />}
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

      <View style={styles.controlContainer}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isRunning && styles.activeButton]}
            onPress={() => {
              const newState = !isRunning;
              setIsRunning(newState);
              sendCommand(100, newState ? 1 : 0);
            }}
          >
            <Text style={styles.buttonText}>{isRunning ? "Bubbles" : "Bubbles"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => sendCommand(101, 0)}
          >
            <Text style={styles.buttonText}>Treat</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between'
  },
  button: {
    backgroundColor: "#1e3504",
    padding: 20,
    borderRadius: 5,
    width: "auto",
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff"
  },
  controlContainer: {
    marginBottom: 20
  },
  activeButton: {
    backgroundColor: '#28a745',
  },
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
