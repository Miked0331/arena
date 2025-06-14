import { Link } from 'react-router-dom';

const clanList = [
  { id: '1', name: 'Red Raptors', members: 12 },
  { id: '2', name: 'Steel Storm', members: 8 },
  { id: '3', name: 'Shadow Wolves', members: 15 },
];

export default function Clans() {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Clans</h1>
      <div className="mb-6">
  <Link
    to="/clans/create"
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    + Create New Clan
  </Link>
</div>

      <ul>
        {clanList.map(clan => (
          <li key={clan.id} className="mb-4 p-4 border rounded hover:bg-gray-50 transition">
            <Link to={`/clan/${clan.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {clan.name}
            </Link>
            <p className="text-gray-600">Members: {clan.members}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
