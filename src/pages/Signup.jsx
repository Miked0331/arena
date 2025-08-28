// src/components/Signup.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

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

      // Create user in Firebase Auth
      const userCredential = await signup(
        emailRef.current.value,
        passwordRef.current.value
      );
      const user = userCredential.user;

      // Add user to Firestore `users` collection
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date()
      });

      navigate('/'); // Redirect after signup
    } catch (err) {
      console.error(err);
      setError('Failed to create an account');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          ref={emailRef}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          ref={passwordRef}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          ref={passwordConfirmRef}
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
