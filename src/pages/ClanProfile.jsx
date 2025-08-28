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
  addDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

// Utility to find user ID by email
async function getUserIdByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

export default function ClanProfile() {
  const { clanId } = useParams();
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);
  }, []);

  useEffect(() => {
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
    if (!inviteEmail.trim()) return alert("Enter email to invite");

    const invitedUserId = await getUserIdByEmail(inviteEmail.trim());
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
      alert("User invited successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to invite user");
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

  async function requestToJoin() {
    if (!userId) return alert("You must be logged in");
    try {
      const joinRef = collection(db, "clans", clan.id, "joinRequests");
      await addDoc(joinRef, { userId, requestedAt: new Date() });
      alert("Join request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send join request");
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!clan) return <p className="text-center mt-10 text-gray-600">Clan not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-3">{clan.name}</h1>
      <p className="text-gray-700 mb-3">{clan.description || "No description"}</p>
      <p className="mb-3 font-medium">
        Members: {clan.members?.length || 0}
      </p>

      {/* Owner Section */}
      {clan.ownerId === userId && (
        <div className="mb-6 p-4 bg-gray-50 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Invite Members</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="Email to invite"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
              onClick={inviteMember}
            >
              Invite
            </button>
          </div>
          <JoinRequests clanId={clan.id} />
        </div>
      )}

      {/* Members List */}
      {clan.members?.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Members</h2>
          <ul>
            {clan.members.map(memberId => (
              <li key={memberId} className="flex justify-between items-center py-1 border-b">
                <span>{memberId}</span>
                {clan.ownerId === userId && memberId !== userId && (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    onClick={() => removeMember(memberId)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Request to Join */}
      {clan.ownerId !== userId && !clan.members?.includes(userId) && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={requestToJoin}
        >
          Request to Join
        </button>
      )}
    </div>
  );
}

// Join Requests Component
function JoinRequests({ clanId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = collection(db, "clans", clanId, "joinRequests");
    const unsubscribe = onSnapshot(q, snapshot => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [clanId]);

  async function approveRequest(requestId, joinUserId) {
    try {
      const clanRef = doc(db, "clans", clanId);
      await updateDoc(clanRef, { members: arrayUnion(joinUserId) });
      await deleteDoc(doc(db, "clans", clanId, "joinRequests", requestId));
    } catch (err) {
      console.error(err);
      alert("Failed to approve request");
    }
  }

  async function rejectRequest(requestId) {
    try {
      await deleteDoc(doc(db, "clans", clanId, "joinRequests", requestId));
    } catch (err) {
      console.error(err);
      alert("Failed to reject request");
    }
  }

  if (!requests.length) return <p className="mt-2 text-gray-600">No pending requests.</p>;

  return (
    <ul className="mt-2 space-y-2">
      {requests.map(req => (
        <li key={req.id} className="flex items-center gap-2 justify-between p-2 border rounded">
          <span>{req.userId}</span>
          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
              onClick={() => approveRequest(req.id, req.userId)}
            >
              Approve
            </button>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
              onClick={() => rejectRequest(req.id)}
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
