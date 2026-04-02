import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  // We use state to track what the user types in the boxes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing when you hit enter
    console.log('Login attempt with:', email, password);
    // In Phase 3, we will send this to our Node.js Backend!
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh'}}>
      <div className="glass" style={{padding: '3rem', width: '100%', maxWidth: '420px', borderRadius: 'var(--radius-lg)'}}>
        
        <h2 style={{textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2rem'}}>Welcome Back</h2>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>Sign in to manage your digital tickets</p>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>College Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
              style={{padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', transition: ' border-color 0.3s'}}
            />
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none'}}
            />
          </div>
          
          <button type="submit" style={{padding: '1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem'}}>
            Sign In
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600}}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
