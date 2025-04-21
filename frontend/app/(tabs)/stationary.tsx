import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch
} from "react-native";
import { ref, get, set, update } from "firebase/database"
import { db } from "../../firebaseConfig"
import { TimerPickerModal } from "react-native-timer-picker"
import StatusCardComponent from "../components/StatusCardComponent";

const RASPBERRY_PI_IP = "192.168.48.240";


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
  const [water_counter, setWater_counter] = useState<number>(NaN);
  const [food_counter, setFood_counter] = useState<number>(NaN); 
  const [potty_counter, setPotty_counter] = useState<number>(NaN); 
  const [water_level, setWater_level] = useState<string>("0");
  const [food_level, setFood_level] = useState<string>("0");
  const [potty_level, setPotty_level] = useState<string>("0");
  const [toggleScheduling, setToggleScheduling] = useState<boolean>(false);

  const [showFoodTimePicker, setShowFoodTimePicker] = useState<boolean>(false);
  const [showWaterTimePicker, setShowWaterTimePicker] = useState<boolean>(false);
  const [showPottyTimePicker, setShowPottyTimePicker] = useState<boolean>(false);
  const [waterRefillTimes, setWater_counterRefillTimes] = useState<string[]>([]);
  const [foodRefillTimes, setFood_counterRefillTimes] = useState<string[]>([]);
  const [pottyRefillTimes, setPotty_counterRefillTimes] = useState<string[]>([]);

  
  const [isInitialLoad] = useState<boolean>(true);

  const triggerMotor = async (type: "water" | "food" | "potty", counter: number) => {
    await set(ref(db, "users/default/commands"), {
      motor_command: type.toUpperCase(),
    });
    
  
  
  
    if (!Number.isNaN(counter) && counter >0){
      const newCount = counter - 1;
    
      await update(ref(db, "users/default/PetStatus"), {
        [`${type}_counter`]: newCount
      });
  
      if (type === "water") {
          setWater_counter(newCount);  // Update water_counter
          const roundedValue = Math.ceil((newCount / 3) * 100); // Round up to nearest whole number
          await update(ref(db, "users/default/PetStatus"), {
            [`${type}_level`]: roundedValue.toString(), // Ensure it's a string
          });
        } else if (type === "food") {
          setFood_counter(newCount);   // Update food_counter
          const roundedValue = Math.ceil((newCount / 6) * 100); // Round up to nearest whole number
          await update(ref(db, "users/default/PetStatus"), {
            [`${type}_level`]: roundedValue.toString(), // Ensure it's a string
          });
        } else if (type === "potty") {
          setPotty_counter(newCount);  // Update potty_counter
          const roundedValue = Math.ceil((newCount / 5) * 100); // Round up to nearest whole number
          await update(ref(db, "users/default/PetStatus"), {
            [`${type}_level`]: roundedValue.toString(), // Ensure it's a string
          });
        }
  
      
    }
    
  }
  
  
 
  const toggleSchedulingSwitch = () => setToggleScheduling(previousState => !previousState);

  const handleAddFoodTime = (pickedDuration: {hours?: number; minutes?: number}) => {
    const formattedTime = formatTime(pickedDuration);
    setFood_counterRefillTimes(prevTimes => [...prevTimes, formattedTime]);
  }

  const handleAddWaterTime = (pickedDuration: {hours?: number; minutes?: number}) => {
    const formattedTime = formatTime(pickedDuration);
    setWater_counterRefillTimes(prevTimes => [...prevTimes, formattedTime]);
  }

  const handleAddPottyTime = (pickedDuration: {hours?: number; minutes?: number}) => {
    const formattedTime = formatTime(pickedDuration);
    setPotty_counterRefillTimes(prevTimes => [...prevTimes, formattedTime]);
  }

  const handleRemoveFoodTime = (index: number) => {
    setFood_counterRefillTimes(prevTimes => prevTimes.filter((_, i) => i !== index));
  }
  const handleRemoveWaterTime = (index: number) => {
    setWater_counterRefillTimes(prevTimes => prevTimes.filter((_, i) => i !== index));
  }
  const handleRemovePottyTime = (index: number) => {
    setPotty_counterRefillTimes(prevTimes => prevTimes.filter((_, i) => i !== index));
  }

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

   useEffect(() => {
    const sendSchedulingToDatabase = async () => {
      const scheduleRef = ref(db, "users/default/scheduling");
      const schedulingData = {
        toggleScheduling,
        foodRefillTimes,
        waterRefillTimes,
        pottyRefillTimes,
      };
      try {
        await set(scheduleRef, schedulingData);
        console.log("Scheduling data sent!", schedulingData);
      } catch (error) {
        console.log("Error sending scheduling data", error);
      }
    };
    if(!isInitialLoad){
      sendSchedulingToDatabase();
    }
  }, [foodRefillTimes, waterRefillTimes, pottyRefillTimes, isInitialLoad, toggleScheduling]);

  useEffect(() => {
          const scheduleRef = ref(db, "users/default/scheduling");
          
          const fetchPetStatuses = async () => {
            try {
              const userRef = ref(db, 'users/default/PetStatus');
              const snapshot = await get(userRef)
      
              if(snapshot.exists()){
                const data = snapshot.val();
                

                if(typeof data === "object" && data.water_level ){
                  setWater_level(data.water_level);
                }
                else{
                  setWater_level("NaN");
                }

                if(typeof data === "object" && data.food_level ){
                  setFood_level(data.food_level);
                }
                else{
                  setFood_level("NaN");
                }

                if(typeof data === "object" && data.potty_level ){
                  setPotty_level(data.potty_level);
                }
                else{
                  setPotty_level("NaN");
                }
              }
            }
            catch(error){
              console.error(error)
            }
          };

          const fetchPetCounts = async () => {
                    try {
                      const userRef = ref(db, 'users/default/PetStatus');
                      const snapshot = await get(userRef)
              
                      if(snapshot.exists()){
                        const data = snapshot.val();
                        console.log(data);
                        
                        if(typeof data === "object" && data.water_counter ){
                          setWater_counter((data.water_counter));
                        }
                        else{
                          setWater_counter(NaN);
                        }
          
                        if(typeof data === "object" && data.food_counter ){
                          setFood_counter((data.food_counter));
                        }
                        else{
                          setFood_counter(NaN);
                        }
          
                        if(typeof data === "object" && data.potty_counter ){
                          setPotty_counter(data.potty_counter);
                        }
                        else{
                          setPotty_counter(NaN);
                        }
                      }
                      else{
                        console.log('No data found');
                      }
                    }
                    catch(error){
                      console.error(error)
                    }
                  };



          const fetchSchedulingData = async () => {
            try{
              const snapshot = await get(scheduleRef);
              if(snapshot.exists()){
                const data = snapshot.val();
                setToggleScheduling(data.toggleScheduling)
                setFood_counterRefillTimes(data.foodRefillTimes || [])
                setWater_counterRefillTimes(data.waterRefillTimes || []);
                setPotty_counterRefillTimes(data.pottyRefillTimes || []);
                console.log("Retrieved data:", data);
              } else {
                console.log("No data found");
              }
            } catch(error) {
              console.log("Error:", error);
            }
          }

          fetchPetStatuses();
          fetchPetCounts();
          fetchSchedulingData();
        }, [water_counter, food_counter, potty_counter]);
  

  return (
    <ScrollView style={styles.container}>
      {/* Pet Status Overview */}
      <Text style={styles.sectionTitle}>PetPal Station Statuses</Text>

      <StatusCardComponent water_level = {water_level} food_level = {food_level} potty_level = {potty_level} showReset = {true} onReset = {() => {setFood_counter(6); setWater_counter(3); setPotty_counter(5)}}/>

        {/* Refill Water and Food */}
      <View style={styles.refillButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => triggerMotor("water", water_counter)}>
          <Text style={styles.buttonText}>Refill Water</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => triggerMotor("food", food_counter)}>
          <Text style={styles.buttonText}>Refill Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => triggerMotor("potty", potty_counter)}>
          <Text style={styles.buttonText}>Refill Potty</Text>
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
            {/* Food Scheduling */}
            <View style={styles.schedulingItem}>
              <Text style={[{color: toggleScheduling ? 'black' : '#555', justifyContent: 'center'}]}>Refill Food</Text>
              <View style={{flexDirection: 'column'}}>
                {foodRefillTimes.length > 0 ? (
                  foodRefillTimes.map((time, index) => (
                      <TouchableOpacity key={index} style={[styles.scheduleButton, {flexDirection: 'row', width: '100%', marginBottom: 2}]}>
                        <Text style={{color: 'white'}}>{time}</Text>
                        <TouchableOpacity onPress={() => handleRemoveFoodTime(index)}>
                          <Text style={{fontSize: 24, color: 'white', fontWeight: 'bold', marginHorizontal: 10}}>-</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                  ))
                ): <View />}

                <TouchableOpacity
                  style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButton, {width: '100%'}]}
                  onPress={() => setShowFoodTimePicker(true)}
                  disabled = {!toggleScheduling}
                >
                  <Text style={{color: 'white', fontWeight: 'bold', paddingHorizontal: 35}}>+</Text>
                </TouchableOpacity>
              </View>
              <TimerPickerModal
                visible={showFoodTimePicker}
                setIsVisible={setShowFoodTimePicker}
                onConfirm={(pickedDuration) => {
                  handleAddFoodTime(pickedDuration);
                  setShowFoodTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Food Refill Time"
                onCancel = {() => setShowFoodTimePicker(false)}
                closeOnOverlayPress
                use12HourPicker
              />
            </View>
            {/* Schedule Water Refill */}
            <View style={styles.schedulingItem}>
              <Text style={[{color: toggleScheduling ? 'black' : '#555', justifyContent: 'center'}]}>Refill Water</Text>
              <View style={{flexDirection: 'column'}}>
                {waterRefillTimes.length > 0 ? (
                  waterRefillTimes.map((time, index) => (
                      <TouchableOpacity key={index} style={[styles.scheduleButton, {flexDirection: 'row', width: '100%', marginBottom: 2}]}>
                        <Text style={{color: 'white'}}>{time}</Text>
                        <TouchableOpacity onPress={() => handleRemoveWaterTime(index)}>
                          <Text style={{fontSize: 24, color: 'white', fontWeight: 'bold', marginHorizontal: 10}}>-</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                  ))
                ): <View />}

                <TouchableOpacity
                  style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButton, {width: '100%'}]}
                  onPress={() => setShowWaterTimePicker(true)}
                  disabled = {!toggleScheduling}
                >
                  <Text style={{color: 'white', fontWeight: 'bold', paddingHorizontal: 35}}>+</Text>
                </TouchableOpacity>
              </View>
              <TimerPickerModal
                visible={showWaterTimePicker}
                setIsVisible={setShowWaterTimePicker}
                onConfirm={(pickedDuration) => {
                  handleAddWaterTime(pickedDuration);
                  setShowWaterTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Water Refill Time"
                onCancel = {() => setShowWaterTimePicker(false)}
                closeOnOverlayPress
                use12HourPicker
              />
            </View>
            {/* Schedule Potty Refill */}
            <View style={styles.schedulingItem}>
              <Text style={[{color: toggleScheduling ? 'black' : '#555', justifyContent: 'center'}]}>Refill Potty</Text>
              <View style={{flexDirection: 'column'}}>
                {pottyRefillTimes.length > 0 ? (
                  pottyRefillTimes.map((time, index) => (
                      <TouchableOpacity key={index} style={[styles.scheduleButton, {flexDirection: 'row', width: '100%', marginBottom: 2}]}>
                        <Text style={{color: 'white'}}>{time}</Text>
                        <TouchableOpacity onPress={() => handleRemovePottyTime(index)}>
                          <Text style={{fontSize: 24, color: 'white', fontWeight: 'bold', marginHorizontal: 10}}>-</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                  ))
                ): <View />}

                <TouchableOpacity
                  style={[styles.scheduleButton, !toggleScheduling && styles.disabledScheduleButton, {width: '100%'}]}
                  onPress={() => setShowPottyTimePicker(true)}
                  disabled = {!toggleScheduling}
                >
                  <Text style={{color: 'white', fontWeight: 'bold', paddingHorizontal: 35}}>+</Text>
                </TouchableOpacity>
              </View>
              <TimerPickerModal
                visible={showPottyTimePicker}
                setIsVisible={setShowPottyTimePicker}
                onConfirm={(pickedDuration) => {
                  handleAddPottyTime(pickedDuration);
                  setShowPottyTimePicker(false);
                }}
                hideSeconds
                modalTitle="Set Potty Refill Time"
                onCancel = {() => setShowPottyTimePicker(false)}
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
  disabledScheduleText: {
    color: '#555'
  },
  disabledScheduleButton: {
    backgroundColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    width: "20%",
    alignItems: "center",
  },
  scheduleButton: {
    color: 'white',
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
    marginBottom: 10,
    justifyContent: 'space-between'
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
    padding: 20,
    borderRadius: 5,
    width: "auto",
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