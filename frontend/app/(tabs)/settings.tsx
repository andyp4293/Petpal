import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ref, get } from "firebase/database"; // Add this
import { db } from "../../constants/firebase/firebaseconfig";



const SettingItem = ({ label, value, route }: { label: string; value: string; route: string }) => {
  const router = useRouter();
  console.log(process.env.EXPO_PUBLIC_FIREBASE_API_KEY)

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => router.push(`/settings/${route}` as const)} 
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value || "Set value"}</Text>
        <Ionicons name="chevron-forward" size={20} color="#555" />
      </View>
    </TouchableOpacity>
  );
};

export default function TabSettingsScreen(): JSX.Element {
  const [ownerName, setOwnerName] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const defaultImage = require("../../assets/images/default1.png"); // default profile image

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos to upload a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // load data from Firestore when the component mounts
  useEffect(() => {
    console.log("🔥 Firebase DB instance:", db); // Log database instance
  
    const fetchData = async () => {
      try {
        const snapshot = await get(ref(db, "users/default"));
        if (snapshot.exists()) {
          console.log("✅ Data fetched:", snapshot.val());
        } else {
          console.log("❌ No data found in Firebase.");
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  



  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* profile picture section */}
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={profileImage ? { uri: profileImage } : defaultImage}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Text style={styles.profileText}>Edit picture or avatar</Text>
        </View>

        {/* account details editing */}
        <SettingItem label="Your Name" value={ownerName} route="name" />
        <SettingItem label="Pet's Name" value="Buddy" route="pet-name" />
        <SettingItem label="Email" value="john@example.com" route="email" />
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
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#1e3504",
  },
  profileText: {
    marginTop: 8,
    fontSize: 14,
    color: "#1e3504",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: "#555",
    marginRight: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3504",
  },
});
