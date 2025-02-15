import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBF7MZ5PcFwaIHrnPuNfFc7HmKDEF-F0Js",
  authDomain: "petpal-17cc8.firebaseapp.com",
  databaseURL: "https://petpal-17cc8-default-rtdb.firebaseio.com", // Ensure this is correct
  projectId: "petpal-17cc8",
  storageBucket: "petpal-17cc8.appspot.com",
  messagingSenderId: "116876744174",
  appId: "1:116876744174:web:6e5c426184390b7fb06aff",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
