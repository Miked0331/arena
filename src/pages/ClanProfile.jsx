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
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function ClanProfile() {
  const { clanId } = useParams();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  const [clan, setClan] = useState(null);
  const [requests, setRequests] = useState([]);
  const [userEmails, setUserEmails] = useState({}); // UID → email map

  // Listen to clan & join requests
  useEffect(() => {
    if (!clanId) return;

    const unsubClan = onSnapshot(doc(db, "clans", clanId), (snap) => {
      setClan(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });

    const unsubRequests = onSnapshot(
      collection(db, "clans", clanId, "joinRequests"),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubClan();
      unsubRequests();
    };
  }, [clanId]);

  // Fetch emails for members + join requests efficiently
  useEffect(() => {
    const fetchEmails = async () => {
      if (!clan) return;
      const uids = [...(clan.members || []), ...requests.map(r => r.userId)];
      const uniqueUids = [...new Set(uids)];
      if (uniqueUids.length === 0) return;

      let emailsMap = {};

      // Firestore allows max 10 'in' filters, so batch if needed
      const batches = [];
      while (uniqueUids.length) {
        batches.push(uniqueUids.splice(0, 10));
      }

      for (let batch of batches) {
        const q = query(collection(db, "users"), where("__name__", "in", batch));
        const snap = await getDocs(q);
        snap.forEach(doc => {
          emailsMap[doc.id] = doc.data().email || doc.id;
        });
      }

      setUserEmails(emailsMap);
    };

    fetchEmails();
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

  const inviteMember = async () => {
    const email = prompt("Enter email to invite:");
    if (!email) return;

    const usersSnap = await getDocs(collection(db, "users"));
    let foundId = null;
    usersSnap.forEach((doc) => {
      if (doc.data().email === email) foundId = doc.id;
    });

    if (foundId) {
      await updateDoc(doc(db, "clans", clan.id), { members: arrayUnion(foundId) });
    } else {
      alert("User not found");
    }
  };

  const deleteClan = async () => {
    if (window.confirm("Delete this clan?")) {
      await deleteDoc(doc(db, "clans", clan.id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{clan.name}</h1>
      <p className="text-gray-700">{clan.description}</p>

      {clan.ownerId !== userId && !clan.members?.includes(userId) && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700" onClick={requestToJoin}>
          Request to Join
        </button>
      )}

      {clan.ownerId !== userId && clan.members?.includes(userId) && (
        <button className="bg-yellow-500 text-white px-4 py-2 rounded mt-3 hover:bg-yellow-600" onClick={() => removeMember(userId)}>
          Leave Clan
        </button>
      )}

      {clan.ownerId === userId && (
        <>
          <button className="bg-green-600 text-white px-4 py-2 rounded mt-3 hover:bg-green-700" onClick={inviteMember}>
            Invite Member
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded mt-3 ml-3 hover:bg-red-700" onClick={deleteClan}>
            Delete Clan
          </button>
        </>
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
                  <button className="bg-green-500 text-white px-3 py-1 mr-2 rounded hover:bg-green-600" onClick={() => approveRequest(r.id, r.userId)}>Approve</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => rejectRequest(r.id)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
