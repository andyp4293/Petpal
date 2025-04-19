import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { ref, get, update} from "firebase/database"
import { db } from "../../firebaseConfig"

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
    showReset: boolean
  }


export default function StatusCardComponent(props: StatusCardComponentProps): JSX.Element {
    const { water_level, food_level, potty_level, showReset } = props;
    const [water_counter, setWater_counter] = useState<number>(NaN);
    const [food_counter, setFood_counter] = useState<number>(NaN);
    const [potty_counter, setPotty_counter] = useState<number>(NaN); 

     useEffect(() => {
    
              const fetchPetStatuses = async () => {
                try {
                  const userRef = ref(db, 'users/default/PetStatus');
                  const snapshot = await get(userRef)
          
                  if(snapshot.exists()){
                    const data = snapshot.val();
                    

                    if(typeof data === "object" && data.water_counter ){
                      setWater_counter(data.water_counter);
                    }
                    else{
                      setWater_counter(NaN);
                    }

                    if(typeof data === "object" && data.food_counter ){
                      setFood_counter(data.food_counter);
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
                }
                catch(error){
                  console.error(error)
                }
              };
    

              fetchPetStatuses();
            }, []);

    return (
        <View style={styles.statusGrid}>
              <StatusCard title="Potty Capacity" value={`${potty_level}%`} icon="toilet" />
              {showReset && (
              <TouchableOpacity style={styles.button} onPress={() => resetCount("potty", 5)}>
                <Text style={styles.buttonText}>Potty Material Replaced</Text>
              </TouchableOpacity>)}


              <StatusCard title="Water Level" value={`${water_level}%`} icon="tint" />
              <StatusCard title="Food Level" value={`${food_level}%`} icon="pizza-slice" />
              {showReset && (
                <TouchableOpacity style={styles.button} onPress={() => resetCount("water", 3)}>
                <Text style={styles.buttonText}>Water Container Refilled</Text>
              </TouchableOpacity>)}

              
              {showReset && (<TouchableOpacity style={styles.button} onPress={() => resetCount("food", 6)}>
                <Text style={styles.buttonText}>Food Container Refilled</Text>
              </TouchableOpacity>)}

            
        </View>
        


    );
  };
  

  const styles = StyleSheet.create({
    statusGrid: {
        marginBottom: 20,
        width: "100%",
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
        padding: 20,
        borderRadius: 5,
        width: "10%",
        alignItems: "center",
        justifyContent: "flex-end",
      },
      buttonText: {
        color: "#fff",
        fontWeight: "bold",
      },

  });
  


