// src/firebase/getUserIdByEmail.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default async function getUserIdByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id; // UID of the user
  }
  return null;
}
