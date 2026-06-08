import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvoT265Lz1xOWA9gpnkdE0FzN0fTBbcHU",
  authDomain: "ibraaj-fitness.firebaseapp.com",
  projectId: "ibraaj-fitness",
  storageBucket: "ibraaj-fitness.firebasestorage.app",
  messagingSenderId: "740276495973",
  appId: "1:740276495973:web:f703dfbe9db62a9f81888c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);