import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Arena</h1>
      <p className="mb-6 text-lg text-gray-500">
        Compete. Dominate. Rise in the ranks.
      </p>
      <Link to="/dashboard">
        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
          Enter the Arena
        </button>
      </Link>
    </div>
  );
}
