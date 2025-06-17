// src/components/Login.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../components/Login.css';



export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/'); // Redirect after login
    } catch {
      setError('Failed to log in');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/'); // Redirect after login
    } catch {
      setError('Failed to log in with Google');
    }
    setLoading(false);
  }

  return (
  <div className="login-container">
    <h2>Log In</h2>
    {error && <p className="error-message">{error}</p>}
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" ref={emailRef} required />
      <input type="password" placeholder="Password" ref={passwordRef} required />
      <button disabled={loading} type="submit">Log In</button>
    </form>
    <hr />
    <button onClick={handleGoogleLogin} disabled={loading}>
      Log In with Google
    </button>
  </div>
);

}
