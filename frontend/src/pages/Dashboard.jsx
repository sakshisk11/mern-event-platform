import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API = `http://${window.location.hostname}:5000/api`;

// ── Check if the app is being accessed via localhost ─────────────────
// If true, the QR code will contain localhost which won't work on phones.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

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
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        Welcome, {userInfo?.name}! Show your QR code at the event entry.
      </p>

      {/* ── Warning banner: shown when on localhost ─────────────────────
          QR codes won't work on phones if the app is opened via localhost.
          The user must use the PC's IP address instead. */}
      {isLocalhost && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: '10px',
          padding: '1rem 1.2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div>
            <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.3rem' }}>
              QR codes won't scan from phones
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              You're on <code style={{ color: '#fbbf24' }}>localhost</code>. 
              To generate scannable QR codes, open this page using your PC's network IP address instead:&nbsp;
              <br />
              <code style={{ color: '#34d399', fontSize: '0.9rem' }}>
                {window.location.href.replace('localhost', 'your-pc-ip')}
              </code>
              <br />
              <span style={{ fontSize: '0.8rem' }}>
                (Run <code style={{ color: '#fbbf24' }}>ipconfig</code> in your terminal to find your IP)
              </span>
            </span>
          </div>
        </div>
      )}

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
            // ── QR value: a URL so phones show "Open link" not "Search barcode" ──
            // The URL contains the ticket ID as a query param.
            // Works when phone and PC are on the same WiFi network.
            const qrUrl = `${window.location.protocol}//${window.location.host}/verify-ticket?ref=${ticket._id}`;

            return (
              <div key={`${ticket._id}-${i}`} className="ticket-card"
                style={{ opacity: ticket.scanned ? 0.6 : 1 }}>

                {/* Already-used badge */}
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

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', width: '100%' }}>
                  <div>👤 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeName}</strong></div>
                  {ticket.attendeeId && (
                    <div>🪪 <strong style={{ color: 'var(--text)' }}>{ticket.attendeeId}</strong></div>
                  )}
                </div>

                {/* QR Code — encodes a URL so phone camera shows "Open" not "Search barcode" */}
                <div className="ticket-qr" style={{ position: 'relative' }}>
                  <QRCodeSVG
                    value={qrUrl}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    level="M"
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
