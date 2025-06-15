import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-red-600 text-white px-4 py-3 flex justify-center space-x-6 shadow-md">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/clans" className="hover:underline">Clans</Link>
        <Link to="/clans/create" className="hover:underline">Create Clan</Link>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 px-4">
        <Outlet />
      </main>
    </div>
  );
}
