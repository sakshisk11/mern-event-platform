import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `http://${window.location.hostname}:5000/api`;

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // POST to backend login route
      const { data } = await axios.post(`${API}/auth/login`, { email, password });

      // Save token and user info so other pages can read it
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redirect: admin goes to home, regular user goes to dashboard
      navigate(data.role === 'admin' ? '/' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Header */}
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your EventMaster account</p>

        {/* Error message */}
        {error && <div className="alert-error mb-2">⚠️ {error}</div>}

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" />

        {/* Link to register */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </p>

        {/* Admin hint */}
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          👑 Organizer? Use <code style={{ color: '#818cf8' }}>admin@eventpro.com</code>
        </p>
      </div>
    </div>
  );
}

export default Login;
