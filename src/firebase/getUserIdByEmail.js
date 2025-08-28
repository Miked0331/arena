// src/firebase/getUserIdByEmail.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default async function getUserIdByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return userDoc.id; // this is the uid
  }
  return null; // user not found
}
