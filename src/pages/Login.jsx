import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/dashboard');
    } catch {
      setError('Login failed');
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" ref={emailRef} placeholder="Email" required />
        <input type="password" ref={passwordRef} placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
      <button onClick={loginWithGoogle}>Login with Google</button>
    </div>
  );
}
