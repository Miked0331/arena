import { createContext, useContext, useEffect, useState } from 'react';
// In src/context/ClanContext.js or wherever you import firebase
import { db } from '../firebase/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from 'firebase/firestore';

const ClanContext = createContext();

export const useClans = () => useContext(ClanContext);

export function ClanProvider({ children }) {
  const [clans, setClans] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'clans'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clansData = [];
      querySnapshot.forEach((doc) => {
        clansData.push({ id: doc.id, ...doc.data() });
      });
      setClans(clansData);
    });

    return () => unsubscribe();
  }, []);

  const addClan = async (clan) => {
    await addDoc(collection(db, 'clans'), clan);
  };

  const updateClan = async (id, updatedClan) => {
    const clanRef = doc(db, 'clans', id);
    await updateDoc(clanRef, updatedClan);
  };

  const deleteClan = async (id) => {
    const clanRef = doc(db, 'clans', id);
    await deleteDoc(clanRef);
  };

  return (
    <ClanContext.Provider value={{ clans, addClan, updateClan, deleteClan }}>
      {children}
    </ClanContext.Provider>
  );
}
