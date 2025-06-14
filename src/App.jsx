import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Clans from './pages/Clans';
import Challenges from './pages/Challenges';
import Dashboard from './pages/Dashboard';
import ClanProfile from './pages/ClanProfile';
import CreateClan from './pages/CreateClan';
import ClanDetails from './pages/ClanDetails';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clans" element={<Clans />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clan/:id" element={<ClanProfile />} />
        <Route path="/clans/create" element={<CreateClan />} />
        <Route path="/clans/:id" element={<ClanDetails />} />
      </Routes>
    </Layout>
  );
}
