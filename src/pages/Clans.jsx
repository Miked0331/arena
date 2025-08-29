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
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db, auth } from '../firebase/firebase';
import getUserIdByEmail from "../firebase/getUserIdByEmail";

export default function Clans() {
  const [clans, setClans] = useState([]);
  const [newClanName, setNewClanName] = useState("");
  const [newClanDescription, setNewClanDescription] = useState("");
  const [userId, setUserId] = useState(null);
  const [inviteEmails, setInviteEmails] = useState({}); // map: clanId -> email
  const [userEmails, setUserEmails] = useState({}); // UID -> email map
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);

    const q = query(collection(db, "clans"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClans(clansData);
      setLoading(false);

      // Fetch emails for all members
      const allMemberIds = [...new Set(clansData.flatMap(c => c.members || []))];
      const fetchEmails = async () => {
        const emailsMap = {};
        for (let uid of allMemberIds) {
          try {
            const userSnap = await getDoc(doc(db, "users", uid));
            emailsMap[uid] = userSnap.exists() ? userSnap.data().email || uid : uid;
          } catch (err) {
            console.error("Failed to fetch user email:", err);
            emailsMap[uid] = uid;
          }
        }
        setUserEmails(emailsMap);
      };
      fetchEmails();
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
    const email = inviteEmails[clanId]?.trim();
    if (!email) return alert("Enter email");
    const invitedUid = await getUserIdByEmail(email);
    if (!invitedUid) return alert("User not found");

    try {
      await updateDoc(doc(db, "clans", clanId), { members: arrayUnion(invitedUid) });
      setInviteEmails(prev => ({ ...prev, [clanId]: "" }));
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Clans</h1>

      <form onSubmit={handleCreateClan} className="mb-8 bg-white shadow-md rounded p-4">
        <h2 className="text-2xl font-semibold mb-3">Create a New Clan</h2>
        <input
          type="text"
          placeholder="Clan Name"
          value={newClanName}
          onChange={e => setNewClanName(e.target.value)}
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={newClanDescription}
          onChange={e => setNewClanDescription(e.target.value)}
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Clan
        </button>
      </form>

      {loading && <p className="text-center text-gray-600">Loading clans...</p>}
      {!loading && clans.length === 0 && <p className="text-center text-gray-600">No clans yet</p>}

      <div className="grid gap-6">
        {clans.map(clan => (
          <div key={clan.id} className="bg-white shadow-md rounded p-4 border border-gray-200">
            <h3 className="text-xl font-bold">{clan.name}</h3>
            <p className="text-gray-700 mb-2">{clan.description || "No description"}</p>
            <p className="text-gray-600 mb-3"><strong>Members:</strong> {clan.members?.length || 0}</p>

            {clan.ownerId === userId && (
              <div className="mb-3">
                <button
                  onClick={() => deleteClan(clan.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2"
                >
                  Delete
                </button>

                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Email to invite"
                    value={inviteEmails[clan.id] || ""}
                    onChange={e => setInviteEmails(prev => ({ ...prev, [clan.id]: e.target.value }))}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    onClick={() => inviteMember(clan.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Invite
                  </button>
                </div>

                <ul className="mt-2 space-y-1">
                  {clan.members?.map(m => (
                    <li key={m} className="flex justify-between items-center border-b py-1">
                      <span>{userEmails[m] || m}</span>
                      {m !== userId && (
                        <button
                          onClick={() => removeMember(clan.id, m)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to={`/clan/${clan.id}`}
              className="text-blue-600 hover:underline"
            >
              View Clan
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
