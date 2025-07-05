// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBbNp2_M8KU852udjQlaf3Cd9Pjn25c95o",
  authDomain: "ytfcs-shg.firebaseapp.com",
  projectId: "ytfcs-shg",
  storageBucket: "ytfcs-shg.firebasestorage.app",
  messagingSenderId: "103277711232",
  appId: "1:103277711232:web:ba346e5f37696f07f1bb65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
