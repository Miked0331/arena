import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clans from './pages/Clans';
import CreateClan from './pages/CreateClan';
import ClanProfile from './pages/ClanProfile';
import ClanDetails from './pages/ClanDetails';
import Challenges from './pages/Challenges';
import { useAuth } from './context/AuthContext';

// Protects private routes
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Login />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/clans" element={<PrivateRoute><Clans /></PrivateRoute>} />
        <Route path="/clans/create" element={<PrivateRoute><CreateClan /></PrivateRoute>} />
        <Route path="/clan/:id" element={<PrivateRoute><ClanProfile /></PrivateRoute>} />
        <Route path="/clans/:id" element={<PrivateRoute><ClanDetails /></PrivateRoute>} />
        <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
