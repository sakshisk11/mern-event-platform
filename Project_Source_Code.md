# MERN Event Platform - Complete Source Code

## frontend/src/App.jsx
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* We moved the navigation logic into its own component! */}
        <Navbar />
        
        {/* Route Configuration */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;

```

## frontend/src/index.css
```css
:root {
  --bg-color: #0f172a; /* Slate 900 for modern dark mode */
  --surface-color: #1e293b; /* Slate 800 */
  --primary-color: #6366f1; /* Indigo 500 */
  --primary-hover: #4f46e5; /* Indigo 600 */
  --text-primary: #f8fafc; /* Slate 50 */
  --text-secondary: #94a3b8; /* Slate 400 */
  --accent-color: #ec4899; /* Pink 500 */
  
  --radius-md: 8px;
  --radius-lg: 16px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

/* Glassmorphism utility */
.glass {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
}

/* Basic utility for a consistent app container */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

```

## frontend/src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## frontend/src/components/Navbar.css
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 2rem;
}

.navbar-brand a {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navbar-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.navbar-links a:hover, .navbar-links a.active {
  color: var(--text-primary);
}

.btn-login {
  padding: 0.5rem 1.5rem;
  background-color: rgba(99, 102, 241, 0.1); /* Primary color light */
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  color: var(--primary-color) !important;
}

.btn-login:hover {
  background-color: var(--primary-hover);
  color: white !important;
}

```

## frontend/src/components/Navbar.jsx
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">EventMaster Pro</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Explore Events</Link>
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>My Tickets</Link>
        <Link to="/login" className={`btn-login ${location.pathname === '/login' ? 'active' : ''}`}>Login / Auth</Link>
      </div>
    </nav>
  );
}

export default Navbar;

```

## frontend/src/pages/Dashboard.jsx
```jsx
import React from 'react';

function Dashboard() {
  return (
    <div className="glass" style={{ padding: '3rem', marginTop: '2rem' }}>
      <h2>My Digital Tickets</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Once you book a ticket, your personal scanable QR code will appear right here.</p>
    </div>
  );
}

export default Dashboard;

```

## frontend/src/pages/Home.jsx
```jsx
import React, { useState } from 'react';

// Temporary placeholder data until we build our MongoDB backend!
const DUMMY_EVENTS = [
  { id: 1, title: 'Annual Tech Hackathon', category: 'Tech', desc: 'A 48-hour coding marathon. Build amazing things with your college peers!', spots: 5 },
  { id: 2, title: 'Inter-College Badminton', category: 'Sports', desc: 'Show off your smashes and win the gold medal this Friday!', spots: 20 },
  { id: 3, title: 'Campus Music Fest', category: 'Cultural', desc: 'Live bands all night. Bring your student ID.', spots: 150 },
  { id: 4, title: 'AI & Machine Learning Workshop', category: 'Tech', desc: 'Learn the basics of Neural Networks from industry experts.', spots: 0 }
];

function Home() {
  // Using React State to remember which tab is currently clicked!
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter our dummy events array. If 'All', show everything. Otherwise, only show events matching activeCategory.
  const filteredEvents = activeCategory === 'All' 
    ? DUMMY_EVENTS 
    : DUMMY_EVENTS.filter(event => event.category === activeCategory);

  return (
    <div className="home-page">
      <header className="home-header" style={{textAlign: 'center', marginBottom: '2rem', padding: '2rem 0'}}>
        <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>Discover Amazing Events</h1>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto'}}>
          Join the hottest tech, cultural, and sports events happening around campus. Book your digital ticket instantly.
        </p>
      </header>

      {/* Category Filter Buttons */}
      <div className="filters" style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap'}}>
        {['All', 'Tech', 'Cultural', 'Sports'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              border: `1px solid ${activeCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'rgba(30, 41, 59, 0.5)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'var(--transition)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Dynamic Grid of Events */}
      <section className="events-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem'}}>
        {filteredEvents.map(event => (
          <div key={event.id} className="glass event-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid var(--${event.category === 'Tech' ? 'primary-color' : event.category === 'Cultural' ? 'accent-color' : 'text-secondary'})`}}>
            
            <div style={{height: '160px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--text-secondary)'}}>
              Image Placeholder
            </div>
            
            <h3 style={{fontSize: '1.3rem'}}>{event.title}</h3>
            
            <p style={{color: 'var(--text-secondary)', fontSize:'0.9rem', flexGrow: 1}}>
              {event.desc}
            </p>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
              <span style={{color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem'}}>{event.category}</span>
              
              <span style={{fontSize: '0.9rem', color: event.spots === 0 ? '#ef4444' : event.spots <= 5 ? 'var(--accent-color)' : 'var(--text-secondary)'}}>
                {event.spots === 0 ? 'Sold Out' : `Only ${event.spots} left`}
              </span>
            </div>
            
            <button 
              disabled={event.spots === 0}
              style={{
                padding: '0.8rem', 
                backgroundColor: event.spots === 0 ? 'rgba(255,255,255,0.1)' : 'var(--primary-color)', 
                color: event.spots === 0 ? 'var(--text-secondary)' : 'white', 
                border:'none', 
                borderRadius: 'var(--radius-md)', 
                cursor: event.spots === 0 ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                transition: 'var(--transition)',
                marginTop: '0.5rem'
              }}>
              {event.spots === 0 ? 'Fully Booked' : 'Book Ticket'}
            </button>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
            <h3>No events found for this category.</h3>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

```

## frontend/src/pages/Login.jsx
```jsx
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

```

## frontend/src/pages/Register.jsx
```jsx
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

```

