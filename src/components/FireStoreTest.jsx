import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

function FirestoreTest() {
  const [clans, setClans] = useState([]);

  useEffect(() => {
    async function fetchClans() {
      const clansCol = collection(db, 'clans');
      const clansSnapshot = await getDocs(clansCol);
      const clansList = clansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClans(clansList);
    }

    fetchClans();
  }, []);

  return (
    <div>
      <h2>Clans from Firestore:</h2>
      <ul>
        {clans.map(clan => (
          <li key={clan.id}>{clan.name || 'Unnamed Clan'}</li>
        ))}
      </ul>
    </div>
  );
}

export default FirestoreTest;
