// src/pages/Clans.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

export default function Clans() {
  const { currentUser } = useAuth();
  const [clans, setClans] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userClanId, setUserClanId] = useState(null);

  useEffect(() => {
    fetchClans();
  }, []);

  async function fetchClans() {
    const snapshot = await getDocs(collection(db, 'clans'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClans(data);

    // Check if user is in a clan
    const q = query(collection(db, 'clans'), where('members', 'array-contains', currentUser.uid));
    const userClans = await getDocs(q);
    if (!userClans.empty) {
      setUserClanId(userClans.docs[0].id);
    }
  }

  async function handleCreateClan(e) {
    e.preventDefault();
    if (!currentUser || userClanId) return;

    const newClan = {
      name,
      description,
      owner: currentUser.uid,
      members: [currentUser.uid],
    };

    await addDoc(collection(db, 'clans'), newClan);
    setName('');
    setDescription('');
    fetchClans();
  }

  async function handleJoinClan(clanId) {
    const clanRef = doc(db, 'clans', clanId);
    await updateDoc(clanRef, {
      members: [...clans.find(c => c.id === clanId).members, currentUser.uid]
    });
    fetchClans();
  }

  async function handleLeaveClan() {
    const clan = clans.find(c => c.id === userClanId);
    const updatedMembers = clan.members.filter(uid => uid !== currentUser.uid);
    const clanRef = doc(db, 'clans', userClanId);
    await updateDoc(clanRef, { members: updatedMembers });
    setUserClanId(null);
    fetchClans();
  }

  return (
    <div>
      <h2>Clans</h2>

      {userClanId ? (
        <div>
          <p>You are in a clan.</p>
          <button onClick={handleLeaveClan}>Leave Clan</button>
        </div>
      ) : (
        <form onSubmit={handleCreateClan}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Clan Name" required />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <button type="submit">Create Clan</button>
        </form>
      )}

      <ul>
        {clans.map(clan => (
          <li key={clan.id}>
            <h4>{clan.name}</h4>
            <p>{clan.description}</p>
            {!userClanId && !clan.members.includes(currentUser.uid) && (
              <button onClick={() => handleJoinClan(clan.id)}>Join Clan</button>
            )}
            {userClanId === clan.id && <p>(You're a member)</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
