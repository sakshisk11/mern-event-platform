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

  // ── Fetch the logged-in user's profile (includes their tickets) ───
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) { navigate('/login'); return; }

      try {
        const { data } = await axios.get(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTickets(data.bookedTickets || []);
      } catch {
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
    return <div className="loader"><div className="spinner" /> Loading tickets...</div>;
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>My Tickets</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Welcome, {userInfo?.name}! Show your QR code at the event entry.
      </p>

      {tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟</div>
          <h3>No tickets yet</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Browse events and book your first ticket!</p>
          <button className="btn btn-primary" style={{ marginTop: '1.2rem' }} onClick={() => navigate('/')}>
            Explore Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
          {tickets.map((ticket, i) => {
            // ── Build the QR text ─────────────────────────────────────
            // Short, clean plain text — any phone camera displays this directly.
            // The Ref line is what the admin's scanner uses for verification.
            const qrText =
              `TICKET\n` +
              `Name: ${ticket.attendeeName}\n` +
              `ID:   ${ticket.attendeeId || 'N/A'}\n` +
              `Ref:  ${ticket._id}`;

            return (
              <div key={`${ticket._id}-${i}`} className="ticket-card"
                style={{ opacity: ticket.scanned ? 0.6 : 1 }}>

                {/* "Already Used" badge */}
                {ticket.scanned && (
                  <div style={{
                    background: '#7f1d1d', color: '#fca5a5',
                    padding: '0.3rem 0.8rem', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 700
                  }}>
                    🔒 Used — {new Date(ticket.scannedAt).toLocaleString()}
                  </div>
                )}

                <span className="badge">{ticket.event?.category}</span>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {ticket.event?.title || 'Unknown Event'}
                </h3>

                {/* Attendee info */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', width: '100%' }}>
                  <div>👤 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeName}</strong></div>
                  {ticket.attendeeId && (
                    <div>🪪 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeId}</strong></div>
                  )}
                </div>

                {/* QR Code — shows ticket info as plain text when scanned by any camera */}
                <div className="ticket-qr" style={{ position: 'relative' }}>
                  <QRCodeSVG
                    value={qrText}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"   // Medium error correction — good balance of density vs readability
                  />
                  {ticket.scanned && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.55)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '2.5rem' }}>🔒</span>
                    </div>
                  )}
                </div>

                <p style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  REF: {ticket._id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
