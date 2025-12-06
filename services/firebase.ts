import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Konfigurimi i Firebase me çelësat tuaj realë
const firebaseConfig = {
  apiKey: "AIzaSyDt_ZPAlVH4of4SkKgdpg_n-Vfb9nH2yMo",
  authDomain: "qr-menu-95ec0.firebaseapp.com",
  projectId: "qr-menu-95ec0",
  storageBucket: "qr-menu-95ec0.firebasestorage.app",
  messagingSenderId: "1019734473944",
  appId: "1:1019734473944:web:7091856aff1b56c50dabad",
  measurementId: "G-7GCG16EKJH"
};

// Inicializimi i Firebase
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase u lidh me sukses!");
} catch (error) {
    console.error("Gabim gjatë inicializimit të Firebase:", error);
}

export { auth, db };