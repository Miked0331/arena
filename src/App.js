
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <div className="p-8 text-center"><h1 className="text-4xl font-bold">Welcome to Arena</h1><p>Start your Gears of War tournaments!</p></div>;
}

function Login() {
  return <div className="p-8 text-center"><h2 className="text-2xl font-semibold">Login Page (mock)</h2></div>;
}

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold text-lg">Arena</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/login" className="hover:underline">Login</Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
