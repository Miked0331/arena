// src/components/Signup.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate('/'); // Redirect to homepage or dashboard after signup
    } catch {
      setError('Failed to create an account');
    }
    setLoading(false);
  }

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" ref={emailRef} required />
        <input type="password" placeholder="Password" ref={passwordRef} required />
        <input type="password" placeholder="Confirm Password" ref={passwordConfirmRef} required />
        <button disabled={loading} type="submit">Sign Up</button>
      </form>
    </div>
  );
}
