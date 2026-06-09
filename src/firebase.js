import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ CORRECT API KEY - Firebase Console se copy kiya hua
const firebaseConfig = {
  apiKey: "AIzaSyDvoT265Lz1xOWA9gpnkdE0FzNOfTBbcHU",
  authDomain: "ibraaj-fitness.firebaseapp.com",
  projectId: "ibraaj-fitness",
  storageBucket: "ibraaj-fitness.firebasestorage.app",
  messagingSenderId: "740276495973",
  appId: "1:740276495973:web:f703dfbe9db62a9f81888c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);