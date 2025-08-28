import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from '../firebase/firebase';
import getUserIdByEmail from "../firebase/getUserIdByEmail";

export default function Clans() {
  const [clans, setClans] = useState([]);
  const [newClanName, setNewClanName] = useState("");
  const [newClanDescription, setNewClanDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);

    const q = query(collection(db, "clans"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleCreateClan(e) {
    e.preventDefault();
    if (!newClanName.trim()) return alert("Clan name is required");
    if (!userId) return alert("You must be logged in");

    try {
      await addDoc(collection(db, "clans"), {
        name: newClanName.trim(),
        description: newClanDescription.trim(),
        ownerId: userId,
        members: [userId],
        createdAt: new Date()
      });
      setNewClanName("");
      setNewClanDescription("");
    } catch (error) {
      console.error(error);
      alert("Failed to create clan");
    }
  }

  async function inviteMember(clanId) {
    if (!inviteEmail.trim()) return alert("Enter email");
    const invitedUid = await getUserIdByEmail(inviteEmail.trim());
    if (!invitedUid) return alert("User not found");

    try {
      await updateDoc(doc(db, "clans", clanId), { members: arrayUnion(invitedUid) });
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to invite user");
    }
  }

  async function removeMember(clanId, memberId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      await updateDoc(doc(db, "clans", clanId), { members: arrayRemove(memberId) });
    } catch (err) {
      console.error(err);
      alert("Failed to remove member");
    }
  }

  async function deleteClan(clanId) {
    if (!window.confirm("Delete clan?")) return;
    try {
      await deleteDoc(doc(db, "clans", clanId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete clan");
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>Clans</h1>
      <form onSubmit={handleCreateClan}>
        <input type="text" placeholder="Clan Name" value={newClanName} onChange={e => setNewClanName(e.target.value)} required />
        <textarea placeholder="Description" value={newClanDescription} onChange={e => setNewClanDescription(e.target.value)} />
        <button type="submit">Create Clan</button>
      </form>

      {loading && <p>Loading...</p>}
      {!loading && clans.length === 0 && <p>No clans yet</p>}

      {clans.map(clan => (
        <div key={clan.id} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
          <h3>{clan.name}</h3>
          <p>{clan.description || "No description"}</p>
          <p>Members: {clan.members?.length || 0}</p>

          {clan.ownerId === userId && (
            <>
              <button onClick={() => deleteClan(clan.id)}>Delete</button>
              <input placeholder="Email to invite" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <button onClick={() => inviteMember(clan.id)}>Invite</button>
              <ul>
                {clan.members?.map(m => <li key={m}>{m} <button onClick={() => removeMember(clan.id, m)}>Remove</button></li>)}
              </ul>
            </>
          )}

          <Link to={`/clan/${clan.id}`}>View Clan</Link>
        </div>
      ))}
    </div>
  );
}
