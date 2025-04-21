import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { ref, get, update} from "firebase/database"
import { db } from "../../firebaseConfig"

type PetStatusType = "potty" | "water" | "food";
type StatusCardProps = {
    title: string;
    value: number | string;
    icon: string;
    showReset: boolean;
    type: PetStatusType; 
    onReset?: () => void;
  };
  const resetLabels: Record<PetStatusType, string> = {
    potty: "Potty Replaced",
    water: "Water Container Refilled",
    food: "Food Container Refilled",
  };
  

const StatusCard = ({ title, value, icon, showReset, type, onReset }: StatusCardProps) => {
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
        {showReset && (
          <View style={styles.resetButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={onReset}>
              <Text style={styles.buttonText}>{resetLabels[type]}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  
  function resetCount(type: string, count: number) {
    const userRef = ref(db, 'users/default/PetStatus');
    get(userRef).then(() => {

        update(userRef, { [type + "_counter"]: count });
        update(userRef, { [type + "_level"]: "100" });
    }).catch((error) => {
        console.error("Error fetching data:", error);
    });
  }

  interface StatusCardComponentProps {
    water_level: string;
    food_level: string;
    potty_level: string;
    showReset: boolean; 
    onReset: () => void;
  }


export default function StatusCardComponent(props: StatusCardComponentProps): JSX.Element {
    const { water_level, food_level, potty_level, showReset, onReset } = props;

    return (
        <View style={styles.statusGrid}>
              <StatusCard title="Potty Capacity" value={`${potty_level}%`} icon="toilet" type = "potty" showReset = {showReset} onReset = {() => {resetCount("potty", 5); onReset()}} />


              <StatusCard title="Water Level" value={`${water_level}%`} icon="tint" type = "water" showReset = {showReset} onReset = {() => {resetCount("water", 3); onReset()}}/>
              <StatusCard title="Food Level" value={`${food_level}%`} icon="pizza-slice" type = "food" showReset = {showReset} onReset = {() => {resetCount("food", 6); onReset()}}/>

              


            
        </View>
        


    );
  };
  

  const styles = StyleSheet.create({
    statusGrid: {
        marginBottom: 20,
        width: "100%",
        justifyContent: "flex-end",
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
      card: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
        width: "100%",
      },
      button: {
        backgroundColor: "#1e3504",
        padding: 10,
        borderRadius: 5,
        width: "30%",
        alignItems: "center",
        justifyContent: "flex-end",
      },
      buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 9, 
        textAlign: "center"
      },
      resetButtonContainer: {
        width: "100%",
        alignItems: "flex-end",
        justifyContent: "center",
      },

  });
  


