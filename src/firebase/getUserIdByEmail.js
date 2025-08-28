// src/firebase/getUserIdByEmail.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default async function getUserIdByEmail(email) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data().uid;
    }
    return null;
  } catch (err) {
    console.error("Error fetching user by email:", err);
    return null;
  }
}
