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
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function ClanProfile() {
  const { clanId } = useParams();
  const { currentUser } = useAuth();
  const userId = currentUser?.uid;

  const [clan, setClan] = useState(null);
  const [requests, setRequests] = useState([]);
  const [userEmails, setUserEmails] = useState({}); // UID → Email lookup

  // Live update of clan + requests
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

  // Fetch emails for members + requesters
  useEffect(() => {
    const fetchEmails = async () => {
      if (!clan) return;
      const uids = [...(clan.members || []), ...(requests.map(r => r.userId))];
      const uniqueUids = [...new Set(uids)];

      let newMap = {};
      for (let uid of uniqueUids) {
        try {
          const snap = await getDocs(collection(db, "users"));
          snap.forEach((doc) => {
            if (doc.id === uid) {
              newMap[uid] = doc.data().email || uid;
            }
          });
        } catch (e) {
          console.error("Error fetching user emails", e);
        }
      }
      setUserEmails(newMap);
    };

    fetchEmails();
  }, [clan, requests]);

  if (!clan) return <p className="p-4">Clan not found</p>;

  const requestToJoin = async () => {
    await addDoc(collection(db, "clans", clan.id, "joinRequests"), {
      userId,
    });
  };

  const approveRequest = async (reqId, requesterId) => {
    await updateDoc(doc(db, "clans", clan.id), {
      members: arrayUnion(requesterId),
    });
    await deleteDoc(doc(db, "clans", clan.id, "joinRequests", reqId));
  };

  const rejectRequest = async (reqId) => {
    await deleteDoc(doc(db, "clans", clan.id, "joinRequests", reqId));
  };

  const removeMember = async (memberId) => {
    await updateDoc(doc(db, "clans", clan.id), {
      members: arrayRemove(memberId),
    });
  };

  const inviteMember = async () => {
    const email = prompt("Enter email to invite:");
    if (!email) return;

    const snap = await getDocs(collection(db, "users"));
    let userFound = null;
    snap.forEach((doc) => {
      if (doc.data().email === email) {
        userFound = doc.id;
      }
    });

    if (userFound) {
      await updateDoc(doc(db, "clans", clan.id), {
        members: arrayUnion(userFound),
      });
    } else {
      alert("User not found");
    }
  };

  const deleteClan = async () => {
    if (window.confirm("Are you sure you want to delete this clan?")) {
      await deleteDoc(doc(db, "clans", clan.id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{clan.name}</h1>
      <p className="text-gray-700">{clan.description}</p>

      {/* Request to Join */}
      {clan.ownerId !== userId && !clan.members?.includes(userId) && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-3"
          onClick={requestToJoin}
        >
          Request to Join
        </button>
      )}

      {/* Leave Clan */}
      {clan.ownerId !== userId && clan.members?.includes(userId) && (
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition mt-3"
          onClick={() => removeMember(userId)}
        >
          Leave Clan
        </button>
      )}

      {/* Owner Controls */}
      {clan.ownerId === userId && (
        <>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-3"
            onClick={inviteMember}
          >
            Invite Member
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition mt-3 ml-3"
            onClick={deleteClan}
          >
            Delete Clan
          </button>
        </>
      )}

      {/* Members */}
      <h2 className="text-xl font-semibold mt-6">Members</h2>
      <ul className="space-y-2 mt-2">
        {clan.members?.map((m) => (
          <li
            key={m}
            className="flex justify-between items-center bg-gray-100 p-2 rounded"
          >
            <span>{userEmails[m] || m}</span>
            {clan.ownerId === userId && m !== userId && (
              <button
                className="text-red-600 hover:underline"
                onClick={() => removeMember(m)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Join Requests */}
      {clan.ownerId === userId && (
        <>
          <h2 className="text-xl font-semibold mt-6">Join Requests</h2>
          <ul className="space-y-2 mt-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>{userEmails[r.userId] || r.userId}</span>
                <div>
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
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
