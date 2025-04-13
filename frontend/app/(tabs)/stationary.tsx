import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Touchable,
  Switch
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { ref, get, set } from "firebase/database"
import { db } from "../../firebaseConfig"
import { TimerPickerModal } from "react-native-timer-picker"

const RASPBERRY_PI_IP = "192.168.48.240";

const triggerMotor = async (type: "water" | "food") => {
  await set(ref(db, "users/default/commands"), {
    motor_command: type.toUpperCase(),
  })
}

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

export default function TabStationaryScreen(): JSX.Element {
  const [water_level, setWater] = useState<string>("");
  const [food_level, setFood] = useState<string>(""); 
  const [potty_level, setPotty] = useState<string>(""); 
  const [toggleScheduling, setToggleScheduling] = useState<boolean>(false);

  const [showFoodTimePicker, setShowFoodTimePicker] = useState<boolean>(false);
  const [showWaterTimePicker, setShowWaterTimePicker] = useState<boolean>(false);
  const [showPottyTimePicker, setShowPottyTimePicker] = useState<boolean>(false);
  const [waterRefillTime, setWaterRefillTime] = useState<string>("");
  const [foodRefillTime, setFoodRefillTime] = useState<string>("");
  const [pottyRefillTime, setPottyRefillTime] = useState<string>("");
 
  const toggleSchedulingSwitch = () => setToggleScheduling(previousState => !previousState);

  const formatTime = ({
    hours,
    minutes,
  }: {
    hours?: number;
    minutes?: number;
  }) => {
    const timeParts = [];
    let isAM: boolean = true;

    if(hours !== undefined){
      if(hours > 12){
        hours -= 12;
        isAM = false;
      }
      if(hours == 0) hours = 12;
      timeParts.push(hours.toString().padStart(2, "0"));
    }
    if(minutes !== undefined){
      timeParts.push(minutes.toString().padStart(2, "0"));
    }
    if(isAM) timeParts.push("AM");
    else timeParts.push("PM");
    return timeParts.join(":");
  };

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logItem}>
      <Text style={styles.logType}>{item.type}</Text>
      <Text style={styles.logDetails}>{item.details}</Text>
    </View>
  );

  // const sendRequest = async (motorType: String) => {
  //   try {
  //     const response = await axios.post(`${RASPBERRY_PI_IP}/activate`, {
  //       motor: motorType,
  //     });
  //     console.log(response.data.message);
  //   } catch(error) {
  //     console.log("FAILURE:", error);
  //   }
  // }

  useEffect(() => {
          const fetchPetStatuses = async () => {
            try {
              const userRef = ref(db, 'users/default/PetStatus');
              const snapshot = await get(userRef)
      
              if(snapshot.exists()){
                const data = snapshot.val();
                
                if(typeof data === "object" && data.water_level ){
                  setWater(String(data.water_level));
                }
                else{
                  setWater("N/A");
                }
  
                if(typeof data === "object" && data.food_level ){
                  setFood(String(data.food_level));
                }
                else{
                  setFood("N/A");
                }
  
                if(typeof data === "object" && data.potty_level ){
                  setPotty(String(data.potty_level));
                }
                else{
                  setPotty("N/A");
                }
              }
            }
            catch(error){
              console.error(error)
            }
          };
      
          fetchPetStatuses();
        }, []);
  

  return (
    <ScrollView style={styles.container}>
      {/* Pet Status Overview */}
      <Text style={styles.sectionTitle}>PetPal Station Statuses</Text>
      <View style={styles.statusGrid}>
        <StatusCard title="Potty Capacity" value={`${potty_level}%`} icon="toilet" />
        <StatusCard title="Water Level" value={`${water_level}%`} icon="tint" />
        <StatusCard title="Food Level" value={`${food_level}%`} icon="pizza-slice" />
      </View>

        {/* Refill Water and Food */}
      <View style={styles.refillButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => triggerMotor("water")}>
          <Text style={styles.buttonText}>Refill Water</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => triggerMotor("food")}>
          <Text style={styles.buttonText}>Refill Food</Text>
        </TouchableOpacity>
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
      <View style={styles.schedulingContainer}>
        <View style={styles.schedulingHeader}>
          <Text style={styles.sectionTitle}>Scheduling</Text>
          <Switch
            trackColor = {{true: "#1e3504" }}
            onValueChange = {toggleSchedulingSwitch}
            value = {toggleScheduling}
          />
        </View>
        <View style={[styles.card, !toggleScheduling && styles.disabledCard]}>
          <View style={styles.schedulingParameters}>
            <View style={styles.schedulingItem}>
              <Text>Refill Food</Text>
              <TouchableOpacity 
                style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButtom]}
                onPress={() => setShowFoodTimePicker(true)}
                disabled={!toggleScheduling}
              >
                <Text style={{color: 'white'}}>
                  {foodRefillTime}
                </Text>
              </TouchableOpacity>
              <TimerPickerModal 
                visible={showFoodTimePicker}
                setIsVisible={setShowFoodTimePicker}
                onConfirm={(pickedDuration) => {
                  setFoodRefillTime(formatTime(pickedDuration));
                  setShowFoodTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Time"
                onCancel={() => setShowFoodTimePicker(false)}
                closeOnOverlayPress
                use12HourPicker
              />
            </View>
            <View style={styles.schedulingItem}>
              <Text>Refill Water</Text>
              <TouchableOpacity 
                style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButtom]}
                onPress={() => setShowWaterTimePicker(true)}
                disabled={!toggleScheduling}
              >
                <Text style={{color: 'white'}}>
                  {waterRefillTime}
                </Text>
              </TouchableOpacity>
              <TimerPickerModal 
                visible={showWaterTimePicker}
                setIsVisible={setShowWaterTimePicker}
                onConfirm={(pickedDuration) => {
                  setWaterRefillTime(formatTime(pickedDuration));
                  setShowWaterTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Time"
                onCancel={() => setShowWaterTimePicker(false)}
                closeOnOverlayPress
                use12HourPicker
              />
            </View>
            <View style={styles.schedulingItem}>
              <Text>Refill Potty</Text>
              <TouchableOpacity 
                style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButtom]}
                onPress={() => setShowPottyTimePicker(true)}
                disabled={!toggleScheduling}
              >
                <Text style={{color: 'white'}}>
                  {pottyRefillTime}
                </Text>
              </TouchableOpacity>
              <TimerPickerModal 
                visible={showPottyTimePicker}
                setIsVisible={setShowPottyTimePicker}
                onConfirm={(pickedDuration) => {
                  setPottyRefillTime(formatTime(pickedDuration));
                  setShowPottyTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Time"
                onCancel={() => setShowPottyTimePicker(false)}
                closeOnOverlayPress
                use12HourPicker
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  disabledScheduleButtom: {
    backgroundColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    width: "20%",
    alignItems: "center",
  },
  scheduleButton: {
    backgroundColor: "#1e3504",
    padding: 5,
    borderRadius: 5,
    width: "20%",
    alignItems: "center",
  },
  schedulingParameters: {
    width: '100%',
    alignItems: 'center'
  },
  schedulingItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
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
    backgroundColor: "#1e3504",
    padding: 15,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  schedulingContainer: {
    marginBottom: 20,
  },
  schedulingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
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
  disabledCard: {
    backgroundColor: "#ddd",
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
  refillButtonsContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});