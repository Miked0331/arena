import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserIdByEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id; // UID
  }
  return null;
}
