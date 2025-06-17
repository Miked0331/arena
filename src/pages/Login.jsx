// src/components/Login.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      console.error("Login error:", err.code, err.message); // ✅ Add this
      setError(err.message || 'Failed to log in'); // ✅ Show real error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Log In</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" ref={emailRef} required />
        <input type="password" placeholder="Password" ref={passwordRef} required />
        <button disabled={loading} type="submit">Log In</button>
      </form>
    </div>
  );
}
