import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read logged-in user from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  // Helper: returns 'active' class if the path matches current URL
  const active = (path) => (location.pathname === path ? 'active' : '');

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-brand">⚡ EventMaster</Link>

      {/* Navigation Links */}
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${active('/')}`}>Events</Link>

        {/* Show "My Tickets" only for regular users */}
        {userInfo && userInfo.role !== 'admin' && (
          <Link to="/dashboard" className={`nav-link ${active('/dashboard')}`}>🎟 My Tickets</Link>
        )}

        {/* Show "Create Event" only for admins */}
        {userInfo?.role === 'admin' && (
          <Link to="/create-event" className={`nav-link ${active('/create-event')}`}>+ Create Event</Link>
        )}

        {/* Show user info and logout if logged in, else show login button */}
        {userInfo ? (
          <>
            <span className="nav-user">
              {userInfo.role === 'admin' ? '👑' : '👤'} {userInfo.name}
            </span>
            <button onClick={handleLogout} className="btn btn-sm btn-danger">Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-sm btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
