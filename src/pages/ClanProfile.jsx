import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

export default function ClanProfile() {
  const { clanId } = useParams();
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);
    
    async function fetchClan() {
      const docRef = doc(db, "clans", clanId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setClan({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Clan not found");
        navigate("/");
      }
      setLoading(false);
    }

    fetchClan();
  }, [clanId]);

  async function inviteMember() {
    if (!inviteEmail.trim()) return alert("Enter email to invite");
    const invitedUserId = await getUserIdByEmail(inviteEmail);
    if (!invitedUserId) return alert("User not found");

    try {
      await updateDoc(doc(db, "clans", clan.id), {
        members: arrayUnion(invitedUserId)
      });
      setClan(prev => ({
        ...prev,
        members: [...(prev.members || []), invitedUserId]
      }));
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert("Error inviting user");
    }
  }

  async function removeMember(memberId) {
    if (!window.confirm("Remove this member?")) return;

    try {
      await updateDoc(doc(db, "clans", clan.id), {
        members: arrayRemove(memberId)
      });
      setClan(prev => ({
        ...prev,
        members: prev.members.filter(id => id !== memberId)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to remove member");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h1>{clan.name}</h1>
      <p>{clan.description}</p>
      <p><strong>Members:</strong> {clan.members?.length || 0}</p>

      {clan.ownerId === userId && (
        <>
          <h3>Invite Members</h3>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="User email"
          />
          <button onClick={inviteMember}>Invite</button>

          <h3>Current Members</h3>
          <ul>
            {clan.members.map(memberId => (
              <li key={memberId}>
                {memberId}
                {memberId !== userId && (
                  <button onClick={() => removeMember(memberId)} style={{ marginLeft: 10 }}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Placeholder - replace with your own implementation
async function getUserIdByEmail(email) {
  return null; // You’ll need to query a "users" collection
}
