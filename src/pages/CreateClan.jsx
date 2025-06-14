import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateClan() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now, we'll just log it and go back
    const newClan = {
      id: Date.now().toString(),
      name,
      members: 1,
      description,
    };

    console.log('New clan created:', newClan);

    // TODO: Save to global or backend later

    // Redirect to clans page
    navigate('/clans');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create a Clan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Clan Name</label>
          <input
            type="text"
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
          ></textarea>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Clan
        </button>
      </form>
    </div>
  );
}
