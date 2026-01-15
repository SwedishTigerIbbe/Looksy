import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDM8-Gx4l6usXgu-EAgoRu7XF4w4HZz4rA",
  authDomain: "looksy-c99f8.firebaseapp.com",
  projectId: "looksy-c99f8",
  storageBucket: "looksy-c99f8.firebasestorage.app",
  messagingSenderId: "862809295288",
  appId: "1:862809295288:web:ddbeb086f541632506674d",
  measurementId: "G-3EFJJ6MH1W",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

let auth;
try {
  auth = getAuth(app);
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth();
}

export { app, auth, db };
