// top same as before
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!clan) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{clan.name}</h1>
      <p className="text-gray-600 mb-4">{clan.description}</p>
      <p className="text-sm text-gray-500 mb-6">Members: {clan.members?.length || 0}</p>

      {!isOwner && !isMember && (
        <button
          onClick={handleJoinRequest}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Request to Join
        </button>
      )}

      {isOwner && (
        <>
          {/* Invite Section */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h3 className="text-xl font-semibold mb-2">Invite Members</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="User email"
                className="border px-3 py-2 rounded w-full"
              />
              <button
                onClick={inviteMember}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Invite
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h3 className="text-xl font-semibold mb-2">Current Members</h3>
            <ul className="space-y-2">
              {clan.members?.map(memberId => (
                <li key={memberId} className="flex justify-between items-center border-b pb-1">
                  <span>{memberId}</span>
                  {memberId !== userId && (
                    <button
                      onClick={() => removeMember(memberId)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Join Requests */}
          {clan.joinRequests?.length > 0 && (
            <div className="bg-white shadow rounded p-4 mb-6">
              <h3 className="text-xl font-semibold mb-2">Join Requests</h3>
              <ul className="space-y-2">
                {clan.joinRequests.map((uid) => (
                  <li key={uid} className="flex justify-between items-center border-b pb-1">
                    <span>{uid}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(uid)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineRequest(uid)}
                        className="bg-gray-300 text-black px-2 py-1 rounded text-sm hover:bg-gray-400"
                      >
                        Decline
                      </button>
                    </div>
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

// Still stubbed
async function getUserIdByEmail(email) {
  return null;
}
