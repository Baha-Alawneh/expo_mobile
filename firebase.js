import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBWvqcBkT2c2oLiRkqzHAJFLI7-tKZ-BI",
  authDomain: "expochatapp-3af72.firebaseapp.com",
  projectId: "expochatapp-3af72",
  storageBucket: "expochatapp-3af72.firebasestorage.app",
  messagingSenderId: "602205486402",
  appId: "1:602205486402:web:cc3b27096cc1aad2a89cdb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
