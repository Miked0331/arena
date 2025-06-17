import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

export default function ClanProfile() {
  const { clanId } = useParams();
  const [clan, setClan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserId(user.uid);

    async function fetchClan() {
      try {
        const docRef = doc(db, "clans", clanId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClan({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Clan not found");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching clan:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClan();
  }, [clanId, navigate]);

  const isMember = clan?.members?.includes(userId);
  const isOwner = clan?.ownerId === userId;
  const hasRequested = clan?.requests?.includes(userId);

  async function handleJoinRequest() {
    try {
      await updateDoc(doc(db, "clans", clan.id), {
        requests: arrayUnion(userId)
      });
      setClan(prev => ({
        ...prev,
        requests: [...(prev.requests || []), userId]
      }));
    } catch (err) {
      console.error("Join request failed", err);
    }
  }

  async function approveRequest(requestId) {
    const ref = doc(db, "clans", clan.id);
    await updateDoc(ref, {
      members: arrayUnion(requestId),
      requests: arrayRemove(requestId)
    });
    setClan(prev => ({
      ...prev,
      members: [...(prev.members || []), requestId],
      requests: prev.requests?.filter(id => id !== requestId)
    }));
  }

  async function denyRequest(requestId) {
    const ref = doc(db, "clans", clan.id);
    await updateDoc(ref, {
      requests: arrayRemove(requestId)
    });
    setClan(prev => ({
      ...prev,
      requests: prev.requests?.filter(id => id !== requestId)
    }));
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-2">{clan.name}</h1>
      <p className="text-gray-600 mb-4">{clan.description || "No description provided"}</p>
      <p className="text-sm text-gray-400 mb-4">Members: {clan.members?.length || 0}</p>

      {isOwner && <p className="text-green-600 font-semibold mb-2">You are the owner of this clan.</p>}
      {!isOwner && isMember && <p className="text-green-600 font-semibold mb-2">You are a member of this clan.</p>}

      {!isOwner && !isMember && !hasRequested && (
        <button
          onClick={handleJoinRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Request to Join
        </button>
      )}

      {!isOwner && !isMember && hasRequested && (
        <p className="text-yellow-600 font-medium">Join request sent</p>
      )}

      {isOwner && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Join Requests</h2>
          {clan.requests?.length > 0 ? (
            <ul className="space-y-2">
              {clan.requests.map(reqId => (
                <li key={reqId} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm">{reqId}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => approveRequest(reqId)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => denyRequest(reqId)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No join requests</p>
          )}
        </div>
      )}

      {isOwner && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Members</h2>
          <ul className="space-y-1">
            {clan.members.map(id => (
              <li key={id} className="text-sm bg-gray-50 rounded px-2 py-1">{id}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
