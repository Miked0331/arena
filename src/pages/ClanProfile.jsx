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
import { getUserIdByEmail } from "../firebase/userUtils";

export default function ClanProfile() {
  const { clanId } = useParams();
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);

    const clanRef = doc(db, "clans", clanId);
    const unsubscribe = onSnapshot(clanRef, docSnap => {
      if (docSnap.exists()) setClan({ id: docSnap.id, ...docSnap.data() });
      else setClan(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [clanId]);

  async function inviteMember() {
    if (!inviteEmail.trim()) return alert("Enter email to invite");
    const invitedUserId = await getUserIdByEmail(inviteEmail.trim());
    if (!invitedUserId) return alert("User not found");

    try {
      await updateDoc(doc(db, "clans", clan.id), { members: arrayUnion(invitedUserId) });
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      alert("Failed to invite user");
    }
  }

  async function removeMember(memberId) {
    if (!window.confirm("Remove this member?")) return;
    try {
      await updateDoc(doc(db, "clans", clan.id), { members: arrayRemove(memberId) });
    } catch (err) {
      console.error(err);
      alert("Failed to remove member");
    }
  }

  async function requestToJoin() {
    if (!userId) return alert("You must be logged in");
    try {
      await addDoc(collection(db, "clans", clan.id, "joinRequests"), { userId, requestedAt: new Date() });
      alert("Join request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send join request");
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!clan) return <p className="text-center mt-10">Clan not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-3">{clan.name}</h1>
      <p className="text-gray-700 mb-3">{clan.description || "No description"}</p>
      <p className="mb-3"><strong>Members:</strong> {clan.members?.length || 0}</p>

      {clan.ownerId === userId && (
        <div className="mb-4 p-4 bg-gray-50 rounded shadow">
          <h2 className="font-semibold mb-2">Invite Members</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="Email to invite"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={inviteMember}>
              Invite
            </button>
          </div>
        </div>
      )}

      {clan.members?.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Members</h2>
          <ul>
            {clan.members.map(memberId => (
              <li key={memberId} className="flex justify-between py-1">
                <span>{memberId}</span>
                {clan.ownerId === userId && memberId !== userId && (
                  <button className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onClick={() => removeMember(memberId)}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {clan.ownerId !== userId && !clan.members?.includes(userId) && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={requestToJoin}>
          Request to Join
        </button>
      )}
    </div>
  );
}
