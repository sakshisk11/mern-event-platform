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
        Welcome, {userInfo?.name}! Show your QR code at the event entry.
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
            <div key={`${ticket._id}-${i}`} className="ticket-card"
              style={{ opacity: ticket.scanned ? 0.65 : 1 }}>

              {/* "Entry Used" badge — shown if ticket has already been scanned at entry */}
              {ticket.scanned && (
                <div style={{
                  background: '#7f1d1d', color: '#fca5a5',
                  padding: '0.3rem 0.8rem', borderRadius: '20px',
                  fontSize: '0.75rem', fontWeight: 700
                }}>
                  🔒 Entry Used — {new Date(ticket.scannedAt).toLocaleString()}
                </div>
              )}

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

              {/* QR Code — encodes human-readable ticket info.
                  When scanned, phone shows the text directly.
                  Admin copies the Ticket Ref (last line) into the Verify page. */}
              <div className="ticket-qr" style={{ position: 'relative' }}>
                <QRCodeSVG
                  value={
                    `EventMaster Ticket\n` +
                    `Name: ${ticket.attendeeName}\n` +
                    `ID: ${ticket.attendeeId || 'N/A'}\n` +
                    `Event: ${ticket.event?.title || 'Unknown'}\n` +
                    `Ref: ${ticket._id}`
                  }
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                  level="Q"
                />
                {/* Dark overlay + lock icon on already-used tickets */}
                {ticket.scanned && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>🔒</span>
                  </div>
                )}
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
