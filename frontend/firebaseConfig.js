// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBF7MZ5PcFwaIHrnPuNfFc7HmKDEF-F0Js",
    authDomain: "petpal-17cc8.firebaseapp.com",
    databaseURL: "https://petpal-17cc8-default-rtdb.firebaseio.com",
    projectId: "petpal-17cc8",
    storageBucket: "petpal-17cc8.firebasestorage.app",
    messagingSenderId: "116876744174",
    appId: "1:116876744174:web:6e5c426184390b7fb06aff",
    measurementId: "G-S1L8WSRXEF"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getDatabase(app);