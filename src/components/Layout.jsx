import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { currentUser, logout } = useAuth();

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {!currentUser && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
        {currentUser && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/clans">Clans</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
