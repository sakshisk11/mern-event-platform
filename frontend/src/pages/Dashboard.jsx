import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API = `http://${window.location.hostname}:5000/api`;

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  // ── Fetch the logged-in user's profile (which includes their tickets) ──
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(data.bookedTickets || []);
      } catch {
        // Token is invalid or expired → log the user out
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" /> Loading tickets...
      </div>
    );
  }

  return (
    <div className="page">
      {/* Page header */}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
        My Tickets
      </h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Welcome, {userInfo?.name}! Here are your booked event tickets with QR codes.
      </p>

      {/* If no tickets yet */}
      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟</div>
          <h3>No tickets yet</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Browse events and book your first ticket!
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.2rem' }} onClick={() => navigate('/')}>
            Explore Events
          </button>
        </div>
      ) : (
        // Grid of ticket cards
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {tickets.map((ticket, i) => (
            <div key={`${ticket._id}-${i}`} className="ticket-card">

              {/* Event category badge */}
              <span className="badge">{ticket.event?.category}</span>

              {/* Event title */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {ticket.event?.title || 'Unknown Event'}
              </h3>

              {/* Attendee info */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', width: '100%' }}>
                <div>👤 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeName}</strong></div>
                {ticket.attendeeId && (
                  <div>🪪 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeId}</strong></div>
                )}
              </div>

              {/* QR Code — encodes the verify URL with the ticket's ID */}
              <div className="ticket-qr">
                <QRCodeSVG
                  value={`${window.location.protocol}//${window.location.host}/verify-ticket/${ticket._id}`}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="Q"
                />
              </div>

              {/* Short reference ID */}
              <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>
                REF: {ticket._id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
