import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import database from "@react-native-firebase/database"; // Realtime Database
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants"; // for utilizing .env variables in Expo

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_URL,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


const db = firestore();

// Export Firebase services
export { firebase, auth, database, storage, db };
