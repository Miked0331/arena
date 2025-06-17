import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clans from './pages/Clans';
import Challenges from './pages/Challenges';
import { useAuth } from './context/AuthContext';
import { auth } from '../src/firebase/firebase'; 
// adjust path as needed depending on your file structure


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

        <Route path="/clans/:id" element={<PrivateRoute><Clans /></PrivateRoute>} />
        <Route path="/challenges" element={<PrivateRoute><Challenges /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
