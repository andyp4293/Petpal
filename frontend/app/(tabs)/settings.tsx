import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ref, onValue, get, update} from "firebase/database"; 
import { db } from "../../firebaseConfig"; 
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../firebaseConfig";



const SettingItem = ({ label, value, route }: { label: string; value: string; route: string }) => {
  const router = useRouter();

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
  const [email, setEmail] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const defaultImage = require("../../assets/images/default1.png"); // default profile image
  const [refillWater, setRefillWater] = useState<string>("");
  const [replacePotty, setReplacePotty] = useState<string>("");
  const [refillFood, setRefillFood ] = useState<string>("");

  useEffect(() => {
    const userRef = ref(db, "users/default"); // reference to the database path
  
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setOwnerName(data.ownerName || ""); // set ownerName from Firebase
        setPetName(data.petName || ""); // set petName from Firebase
        setEmail(data.email || ""); // set email from Firebase
        if (data.profileImage){
          setProfileImage(data.profileImage);
        }
      } else {
        console.log("No data found at 'users/default'");
      }
    });
  }, []);


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      await uploadProfileImage(result.assets[0].uri); 
    }
  };
  


  useEffect(() => {
  
    const fetchData = async () => {
      try {
        const snapshot = await get(ref(db, "users/default"));
        if (snapshot.exists()) {
          console.log("Data fetched:", snapshot.val());
        } else {
          console.log("No data found in Firebase.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  const uploadProfileImage = async (imageUri: string) => {
    try {
      const userRef = ref(db, "users/default");
      const response = await fetch(imageUri);
      const blob = await response.blob();
  
      const imageRef = storageRef(storage, "profile_pictures/default_profile.jpg");
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
  
      // Log download URL to ensure it's retrieved correctly
      console.log("Download URL:", downloadUrl);
  
      // Update profile image URL in Firebase Realtime Database
      await update(userRef, { profileImage: downloadUrl });
  
      // Confirm update
      const snapshot = await get(userRef);
      console.log("Updated data:", snapshot.val());
  
      // Update local state
      setProfileImage(downloadUrl);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      Alert.alert("Upload Failed", "Failed to upload the image.");
    }
  };
  

  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile Settings</Text>
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
        <SettingItem label="Pet's Name" value={petName} route="pet-name" />
        <SettingItem label="Email" value={email} route="email" />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Maintainenance Settings</Text>

        {/* settings for refill/replacement on the mobile and stationary robots */}
        <SettingItem label="Refill Water" value={refillWater} route="name" />
        <SettingItem label="Replace Potty" value={replacePotty} route="pet-name" />
        <SettingItem label="Refill Food" value={refillFood} route="email" />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
