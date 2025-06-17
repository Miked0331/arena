import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // <-- add GoogleAuthProvider here

const firebaseConfig = {
  apiKey: "AIzaSyDsVSyEza0XHKiTl5dEuR0U5aPvi6FlXZc",
  authDomain: "arena-c260d.firebaseapp.com",
  projectId: "arena-c260d",
  storageBucket: "arena-c260d.firebasestorage.app",
  messagingSenderId: "457088191428",
  appId: "1:457088191428:web:74eb0f9162174eaca43291"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();  // <-- initialize provider here

export { db, auth, googleProvider };
