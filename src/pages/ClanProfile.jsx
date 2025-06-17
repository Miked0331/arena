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

  const isOwner = clan?.ownerId === userId;
  const isMember = clan?.members?.includes(userId);

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

  async function handleJoinRequest() {
    try {
      await updateDoc(doc(db, "clans", clan.id), {
        joinRequests: arrayUnion(userId)
      });
      alert("Request sent!");
      setClan(prev => ({
        ...prev,
        joinRequests: [...(prev.joinRequests || []), userId]
      }));
    } catch (error) {
      console.error("Join request error:", error);
      alert("Could not send join request");
    }
  }

  async function acceptRequest(uid) {
    try {
      await updateDoc(doc(db, "clans", clan.id), {
        members: arrayUnion(uid),
        joinRequests: arrayRemove(uid)
      });
      setClan(prev => ({
        ...prev,
        members: [...(prev.members || []), uid],
        joinRequests: prev.joinRequests.filter(id => id !== uid)
      }));
    } catch (error) {
      console.error("Accept request error:", error);
      alert("Failed to accept");
    }
  }

  async function declineRequest(uid) {
    try {
      await updateDoc(doc(db, "clans", clan.id), {
        joinRequests: arrayRemove(uid)
      });
      setClan(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(id => id !== uid)
      }));
    } catch (error) {
      console.error("Decline request error:", error);
      alert("Failed to decline");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!clan) return null;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h1>{clan.name}</h1>
      <p>{clan.description}</p>
      <p><strong>Members:</strong> {clan.members?.length || 0}</p>

      {/* Request to join if not owner or member */}
      {!isOwner && !isMember && (
        <button onClick={handleJoinRequest}>Request to Join</button>
      )}

      {/* Show invite, member list, and join requests for owner */}
      {isOwner && (
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
            {clan.members?.map(memberId => (
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

          {/* New: join requests */}
          {clan.joinRequests?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Join Requests</h3>
              <ul>
                {clan.joinRequests.map((uid) => (
                  <li key={uid}>
                    {uid}
                    <button onClick={() => acceptRequest(uid)} style={{ marginLeft: 10 }}>Accept</button>
                    <button onClick={() => declineRequest(uid)} style={{ marginLeft: 10 }}>Decline</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 🔧 Replace with your own logic or Firestore "users" collection query
async function getUserIdByEmail(email) {
  return null;
}
