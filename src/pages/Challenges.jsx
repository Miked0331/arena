import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

export default function Challenges() {
  const { currentUser } = useAuth();
  const [clans, setClans] = useState([]);
  const [myClan, setMyClan] = useState(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    fetchClansAndChallenges();
  }, []);

  async function fetchClansAndChallenges() {
    // Get all clans
    const clanSnap = await getDocs(collection(db, 'clans'));
    const allClans = clanSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setClans(allClans);

    // Get user's clan
    const userClan = allClans.find(clan => clan.members.includes(currentUser.uid));
    setMyClan(userClan);

    // Get challenges involving user’s clan
    if (userClan) {
      const q = query(collection(db, 'challenges'), where('challengerClanId', '==', userClan.id));
      const r = query(collection(db, 'challenges'), where('opponentClanId', '==', userClan.id));

      const [sentSnap, receivedSnap] = await Promise.all([getDocs(q), getDocs(r)]);
      const challenges = [...sentSnap.docs, ...receivedSnap.docs].map(doc => ({ id: doc.id, ...doc.data() }));
      setChallenges(challenges);
    }
  }

  async function sendChallenge(opponentClanId) {
    if (!myClan || opponentClanId === myClan.id) return;

    const challenge = {
      challengerClanId: myClan.id,
      opponentClanId,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'challenges'), challenge);
    fetchClansAndChallenges();
  }

  async function respondToChallenge(id, decision) {
    const challengeRef = doc(db, 'challenges', id);
    await updateDoc(challengeRef, { status: decision });
    fetchClansAndChallenges();
  }

  return (
    <div>
      <h2>Clan Challenges</h2>

      {myClan ? (
        <>
          <h3>Send a Challenge</h3>
          <ul>
            {clans
              .filter(c => c.id !== myClan.id)
              .map(clan => (
                <li key={clan.id}>
                  {clan.name}
                  <button onClick={() => sendChallenge(clan.id)}>Challenge</button>
                </li>
              ))}
          </ul>

          <h3>All Challenges</h3>
          <ul>
            {challenges.map(ch => {
              const isReceived = ch.opponentClanId === myClan.id;
              const otherClan = clans.find(c => c.id === (isReceived ? ch.challengerClanId : ch.opponentClanId));

              return (
                <li key={ch.id}>
                  {isReceived ? 'From' : 'To'}: <strong>{otherClan?.name || 'Unknown'}</strong> - Status: <strong>{ch.status}</strong>
                  {isReceived && ch.status === 'pending' && (
                    <>
                      <button onClick={() => respondToChallenge(ch.id, 'accepted')}>Accept</button>
                      <button onClick={() => respondToChallenge(ch.id, 'declined')}>Decline</button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p>Join or create a clan first.</p>
      )}
    </div>
  );
}
