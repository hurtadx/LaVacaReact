// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  // Añade esta importación
import { getFirestore } from "firebase/firestore";  // Opcional, si necesitas Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5JV5pLJrQXsqD_02qKG0GlZg4-SfpUm4",
  authDomain: "lavaca-7aa04.firebaseapp.com",
  projectId: "lavaca-7aa04",
  storageBucket: "lavaca-7aa04.firebasestorage.app",
  messagingSenderId: "469040932527",
  appId: "1:469040932527:web:1011fadc6d43b602c1165a",
  measurementId: "G-Q0FRMWQCJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa y exporta los servicios de Firebase
export const auth = getAuth(app);  // Añade esta exportación
export const db = getFirestore(app);  // Opcional, si necesitas Firestore

export default app;