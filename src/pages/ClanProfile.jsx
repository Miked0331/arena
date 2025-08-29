import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function ClanProfile() {
  const { clanId } = useParams();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  const [clan, setClan] = useState(null);
  const [requests, setRequests] = useState([]);
  const [userEmails, setUserEmails] = useState({}); // cached emails

  // Firestore listeners for clan + join requests
  useEffect(() => {
    if (!clanId) return;

    const unsubClan = onSnapshot(doc(db, "clans", clanId), (snap) => {
      setClan(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });

    const unsubRequests = onSnapshot(
      collection(db, "clans", clanId, "joinRequests"),
      (snap) => {
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubClan();
      unsubRequests();
    };
  }, [clanId]);

  // Function to fetch a single user's email (cached)
  const fetchUserEmail = async (uid) => {
    if (userEmails[uid]) return userEmails[uid]; // already cached
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const email = userSnap.exists() ? userSnap.data().email : uid;
      setUserEmails(prev => ({ ...prev, [uid]: email }));
      return email;
    } catch {
      setUserEmails(prev => ({ ...prev, [uid]: uid }));
      return uid;
    }
  };

  // Pre-fetch emails for all members + requests
  useEffect(() => {
    const uids = [...(clan?.members || []), ...requests.map(r => r.userId)];
    uids.forEach(fetchUserEmail);
  }, [clan, requests]);

  if (!clan) return <p className="p-4">Clan not found</p>;

  const requestToJoin = async () => {
    if (!userId) return alert("You must be logged in");
    await addDoc(collection(db, "clans", clan.id, "joinRequests"), { userId });
  };

  const approveRequest = async (reqId, requesterId) => {
    await updateDoc(doc(db, "clans", clan.id), { members: arrayUnion(requesterId) });
    await deleteDoc(doc(db, "clans", clan.id, "joinRequests", reqId));
  };

  const rejectRequest = async (reqId) => {
    await deleteDoc(doc(db, "clans", clan.id, "joinRequests", reqId));
  };

  const removeMember = async (memberId) => {
    await updateDoc(doc(db, "clans", clan.id), { members: arrayRemove(memberId) });
  };

  const deleteClan = async () => {
    if (window.confirm("Delete this clan?")) {
      await deleteDoc(doc(db, "clans", clan.id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{clan.name}</h1>
      <p className="text-gray-700">{clan.description || "No description"}</p>

      {clan.ownerId !== userId && !clan.members?.includes(userId) && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700"
          onClick={requestToJoin}
        >
          Request to Join
        </button>
      )}

      {clan.ownerId !== userId && clan.members?.includes(userId) && (
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded mt-3 hover:bg-yellow-600"
          onClick={() => removeMember(userId)}
        >
          Leave Clan
        </button>
      )}

      {clan.ownerId === userId && (
        <button
          className="bg-red-600 text-white px-4 py-2 rounded mt-3 hover:bg-red-700"
          onClick={deleteClan}
        >
          Delete Clan
        </button>
      )}

      <h2 className="text-xl font-semibold mt-6">Members</h2>
      <ul className="space-y-2 mt-2">
        {clan.members?.map((m) => (
          <li key={m} className="flex justify-between bg-gray-100 p-2 rounded">
            <span>{userEmails[m] || m}</span>
            {clan.ownerId === userId && m !== userId && (
              <button className="text-red-600 hover:underline" onClick={() => removeMember(m)}>Remove</button>
            )}
          </li>
        ))}
      </ul>

      {clan.ownerId === userId && (
        <>
          <h2 className="text-xl font-semibold mt-6">Join Requests</h2>
          <ul className="space-y-2 mt-2">
            {requests.map((r) => (
              <li key={r.id} className="flex justify-between bg-gray-100 p-2 rounded">
                <span>{userEmails[r.userId] || r.userId}</span>
                <div>
                  <button
                    className="bg-green-500 text-white px-3 py-1 mr-2 rounded hover:bg-green-600"
                    onClick={() => approveRequest(r.id, r.userId)}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => rejectRequest(r.id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
