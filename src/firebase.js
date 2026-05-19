import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBh-odo9OCq3317frA7usGzYiwm0nqBsnA",
  authDomain: "primeplots-ind.firebaseapp.com",
  projectId: "primeplots-ind",
  storageBucket: "primeplots-ind.firebasestorage.app",
  messagingSenderId: "311476170540",
  appId: "1:311476170540:web:b9736c566fd6c98ebd0689",
  measurementId: "G-0451EP9MEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
