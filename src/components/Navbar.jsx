import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">ARENA</h1>
      <ul className="flex space-x-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/clans">Clans</Link></li>
        <li><Link to="/challenges">Challenges</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
}
