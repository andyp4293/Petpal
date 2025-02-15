import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBF7MZ5PcFwaIHrnPuNfFc7HmKDEF-F0Js",
  authDomain: "petpal-17cc8.firebaseapp.com",
  databaseURL: "https://petpal-17cc8-default-rtdb.firebaseio.com/",
  projectId: "petpal-17cc8",
  storageBucket: "petpal-17cc8.appspot.com",
  messagingSenderId: "116876744174",
  appId: "1:116876744174:web:6e5c426184390b7fb06aff",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const testFirebase = async () => {
  try {
    console.log("Testing Firebase connection...");
    const snapshot = await get(ref(db, "users/default"));
    if (snapshot.exists()) {
      console.log("✅ Firebase Connection Successful:", snapshot.val());
    } else {
      console.log("❌ No Data Found.");
    }
  } catch (error) {
    console.error("❌ Firebase Connection Error:", error);
  }
};

testFirebase();
