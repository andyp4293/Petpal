import React, { useState } from "react";
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

const SettingInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      placeholderTextColor="#888"
    />
  </View>
);

export default function TabSettingsScreen(): JSX.Element {
  const [ownerName, setOwnerName] = useState<string>("");
  const [petName, setPetName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const defaulImage = "../../assets/images/default1.png"; // default profile image

  const pickImage = async () => {
    // this asks for permission for the app to open the users' photo library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos to upload a profile picture.");
      return;
    }

    // launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // crop image square
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style = {styles.card}>
      {/* profile picture section */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require(defaulImage)}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.profileText}>Edit picture or avatar</Text>
      </View>
      

      {/* account details editing*/}
      <SettingInput label="Your Name" value={ownerName} onChange={setOwnerName} />
      <SettingInput label="Pet's Name" value={petName} onChange={setPetName} />
      <SettingInput label="Your Email" value={petName} onChange={setPetName} />
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
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e3504",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    color: "#333",
    width: "100%",
  },
});
