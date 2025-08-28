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
import { getUserIdByEmail } from "../firebase/userUtils";

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
      const clanList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClans(clanList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleCreateClan(e) {
    e.preventDefault();
    if (!newClanName.trim()) return alert("Clan name is required");
    if (!userId) return alert("You must be logged in to create a clan.");

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
      console.error("Error creating clan:", error);
      alert("Failed to create clan.");
    }
  }

  async function inviteMember(clanId) {
    if (!inviteEmail.trim()) return alert("Enter email to invite");

    try {
      const invitedUserId = await getUserIdByEmail(inviteEmail.trim());
      if (!invitedUserId) return alert("User not found.");

      const clanRef = doc(db, "clans", clanId);
      await updateDoc(clanRef, {
        members: arrayUnion(invitedUserId)
      });
      setInviteEmail("");
    } catch (error) {
      console.error("Invite error:", error);
      alert("Failed to invite user.");
    }
  }

  async function removeMember(clanId, memberId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      const clanRef = doc(db, "clans", clanId);
      await updateDoc(clanRef, { members: arrayRemove(memberId) });
    } catch (error) {
      console.error("Remove member error:", error);
      alert("Failed to remove member.");
    }
  }

  async function deleteClan(clanId) {
    if (!window.confirm("Are you sure you want to delete this clan?")) return;
    try {
      await deleteDoc(doc(db, "clans", clanId));
    } catch (error) {
      console.error("Delete clan error:", error);
      alert("Failed to delete clan.");
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>Clans</h1>
      <form onSubmit={handleCreateClan} style={{ marginBottom: 30 }}>
        <h2>Create a New Clan</h2>
        <input
          type="text"
          placeholder="Clan Name"
          value={newClanName}
          onChange={e => setNewClanName(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <textarea
          placeholder="Description (optional)"
          value={newClanDescription}
          onChange={e => setNewClanDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />
        <button type="submit">Create Clan</button>
      </form>

      <h2>All Clans</h2>
      {loading && <p>Loading clans...</p>}
      {!loading && clans.length === 0 && <p>No clans yet</p>}

      {clans.map(clan => (
        <div key={clan.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 15 }}>
          <h3>{clan.name}</h3>
          <p>{clan.description || "No description"}</p>
          <p><strong>Members:</strong> {clan.members?.length || 0}</p>

          {clan.ownerId === userId && (
            <div>
              <button style={{ background: "red", color: "white", marginBottom: 10 }} onClick={() => deleteClan(clan.id)}>Delete Clan</button>
              <input
                type="email"
                placeholder="Email to invite"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
              <button onClick={() => inviteMember(clan.id)}>Invite</button>
            </div>
          )}

          <Link to={`/clan/${clan.id}`} style={{ color: "blue", textDecoration: "underline", marginTop: 10, display: "inline-block" }}>
            View Clan
          </Link>
        </div>
      ))}
    </div>
  );
}
