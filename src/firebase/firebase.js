// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase config object (get it from your Firebase console)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsVSyEza0XHKiTl5dEuR0U5aPvi6FlXZc",
  authDomain: "arena-c260d.firebaseapp.com",
  projectId: "arena-c260d",
  storageBucket: "arena-c260d.firebasestorage.app",
  messagingSenderId: "457088191428",
  appId: "1:457088191428:web:74eb0f9162174eaca43291"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
