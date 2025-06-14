import { useClans } from '../context/ClanContext';
import { Link } from 'react-router-dom';

export default function Clans() {
  const { clans } = useClans();  // <-- use clans from context here

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clans</h1>
        <Link
          to="/clans/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Create New Clan
        </Link>
      </div>
      <ul>
        {clans.map((clan) => (
          <li
            key={clan.id}
            className="mb-4 p-4 border rounded hover:bg-gray-50 transition"
          >
            <Link
              to={`/clan/${clan.id}`}
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {clan.name}
            </Link>
            <Link to={`/clans/${clan.id}`} className="block p-4 border-b hover:bg-gray-100">
  <h2 className="text-xl font-semibold">{clan.name}</h2>
  <p>{clan.description}</p>
  <p>Members: {clan.members}</p>
</Link>
            <p className="text-gray-600">Members: {clan.members}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
