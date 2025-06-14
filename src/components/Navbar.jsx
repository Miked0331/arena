// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="font-bold text-xl">Arena</div>
      <div className="space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? 'underline' : 'hover:underline'
          }
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/clans"
          className={({ isActive }) =>
            isActive ? 'underline' : 'hover:underline'
          }
        >
          Clans
        </NavLink>
        <NavLink
          to="/challenges"
          className={({ isActive }) =>
            isActive ? 'underline' : 'hover:underline'
          }
        >
          Challenges
        </NavLink>
      </div>
    </nav>
  );
}
