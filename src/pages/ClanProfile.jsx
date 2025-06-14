import { useParams, Link } from 'react-router-dom';

const clanList = [
  { id: '1', name: 'Red Raptors', members: 12, description: 'Fearless Gears warriors!' },
  { id: '2', name: 'Steel Storm', members: 8, description: 'Unstoppable team of strategists.' },
  { id: '3', name: 'Shadow Wolves', members: 15, description: 'Silent but deadly.' },
];

export default function ClanProfile() {
  const { id } = useParams();
  const clan = clanList.find(c => c.id === id);

  if (!clan) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold">Clan not found</h2>
        <Link to="/clans" className="text-blue-500 underline">Back to Clans</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded shadow">
      <h1 className="text-4xl font-bold mb-2">{clan.name}</h1>
      <p className="mb-4 text-gray-700">{clan.description}</p>
      <p className="mb-4"><strong>Members:</strong> {clan.members}</p>
      <Link to="/clans" className="text-blue-600 hover:underline">← Back to Clans</Link>
    </div>
  );
}
