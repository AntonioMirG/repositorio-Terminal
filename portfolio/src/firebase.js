import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB11MNB7N-DGADk3LBJK74GoFsom7zFPF4",
  authDomain: "porfolio-terminal.firebaseapp.com",
  projectId: "porfolio-terminal",
  storageBucket: "porfolio-terminal.firebasestorage.app",
  messagingSenderId: "1083565465743",
  appId: "1:1083565465743:web:94f23692e868c89c7450fa",
  measurementId: "G-W4P6VW1JDL"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
