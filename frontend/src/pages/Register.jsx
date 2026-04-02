import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration attempt:', name, email, password);
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh'}}>
      <div className="glass" style={{padding: '3rem', width: '100%', maxWidth: '420px', borderRadius: 'var(--radius-lg)'}}>
        
        <h2 style={{textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2rem'}}>Create Account</h2>
        <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>Join your campus event network</p>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              style={{padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none'}}
            />
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <label style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>College Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
              style={{padding: '0.8rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none'}}
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
            Sign Up
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600}}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
