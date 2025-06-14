import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClans } from '../context/ClanContext';
import { useState } from 'react';

export default function ClanDetails() {
  const { id } = useParams();
  const { clans, updateClan, deleteClan } = useClans();
  const navigate = useNavigate();

  const clan = clans.find(c => c.id === id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(clan?.name || '');
  const [description, setDescription] = useState(clan?.description || '');

  if (!clan) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Clan Not Found</h2>
        <Link to="/clans" className="text-blue-600 hover:underline">Back to Clans</Link>
      </div>
    );
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    updateClan(clan.id, { ...clan, name, description });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this clan?')) {
      deleteClan(clan.id);
      navigate('/clans');
    }
  };

  const handleJoin = () => {
    updateClan(clan.id, { ...clan, members: clan.members + 1 });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Clan Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" type="submit">Save</button>
            <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">{clan.name}</h1>
          <p className="mb-4">{clan.description}</p>
          <p><strong>Members:</strong> {clan.members}</p>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={handleJoin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Join Clan
            </button>

            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </>
      )}

      <Link to="/clans" className="inline-block mt-6 text-blue-600 hover:underline">
        Back to Clans
      </Link>
    </div>
  );
}
