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
