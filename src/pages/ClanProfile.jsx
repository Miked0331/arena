import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  onSnapshot,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import getUserIdByEmail from "../firebase/getUserIdByEmail";

export default function ClanProfile() {
  const { clanId } = useParams();
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);

    const docRef = doc(db, "clans", clanId);
    const unsubscribe = onSnapshot(docRef, snapshot => {
      if (snapshot.exists()) {
        setClan({ id: snapshot.id, ...snapshot.data() });
      } else {
        setClan(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [clanId]);

  async function inviteMember() {
    if (!inviteEmail.trim()) return alert("Enter email");
    const invitedUid = await getUserIdByEmail(inviteEmail.trim());
    if (!invitedUid) return alert("User not found");

    await updateDoc(doc(db, "clans", clan.id), { members: arrayUnion(invitedUid) });
    setInviteEmail("");
  }

  async function removeMember(memberId) {
    if (!window.confirm("Remove this member?")) return;
    await updateDoc(doc(db, "clans", clan.id), { members: arrayRemove(memberId) });
  }

  async function requestToJoin() {
    if (!userId) return alert("Must be logged in");
    const joinRef = collection(db, "clans", clan.id, "joinRequests");
    await addDoc(joinRef, { userId, requestedAt: new Date() });
    alert("Join request sent");
  }

  if (loading) return <p>Loading...</p>;
  if (!clan) return <p>Clan not found</p>;

  return (
    <div>
      <h1>{clan.name}</h1>
      <p>{clan.description}</p>
      <p>Members: {clan.members?.length || 0}</p>

      {clan.ownerId === userId && (
        <div>
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email to invite" />
          <button onClick={inviteMember}>Invite</button>
          <ul>
            {clan.members.map(m => <li key={m}>{m} <button onClick={() => removeMember(m)}>Remove</button></li>)}
          </ul>
        </div>
      )}

      {clan.ownerId !== userId && !clan.members.includes(userId) && (
        <button onClick={requestToJoin}>Request to Join</button>
      )}
    </div>
  );
}
