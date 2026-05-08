import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `http://${window.location.hostname}:5000/api`;

function VerifyTicket() {
  const { ticketId } = useParams(); // ticket ID from the URL (e.g. /verify-ticket/abc123)
  const navigate = useNavigate();

  // status: 'loading' | 'valid' | 'invalid'
  const [status, setStatus]     = useState('loading');
  const [ticketData, setTicketData] = useState(null);

  // ── Call backend to verify the ticket ───────────────────────────
  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axios.get(`${API}/events/verify/${ticketId}`);
        if (data.valid) {
          setTicketData(data);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    };
    verify();
  }, [ticketId]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="loader">
        <div className="spinner" /> Verifying ticket...
      </div>
    );
  }

  const isValid = status === 'valid';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="card" style={{
        width: '100%', maxWidth: '460px', textAlign: 'center', padding: '2.5rem',
        borderColor: isValid ? '#22c55e' : '#ef4444',
        borderWidth: '2px'
      }}>
        {/* Big status icon */}
        <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>
          {isValid ? '✅' : '❌'}
        </div>

        {/* Status heading */}
        <h1 style={{
          fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem',
          color: isValid ? '#22c55e' : '#ef4444'
        }}>
          {isValid ? 'VALID TICKET' : 'INVALID TICKET'}
        </h1>

        {/* Ticket details (only shown if valid) */}
        {isValid && ticketData && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius)',
            padding: '1.2rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <InfoRow label="Attendee Name" value={ticketData.user} />
            <InfoRow label="Attendee ID"   value={ticketData.attendeeId} />
            <InfoRow label="Event"         value={ticketData.event} />
            {ticketData.date &&     <InfoRow label="Date"     value={ticketData.date} />}
            {ticketData.location && <InfoRow label="Location" value={ticketData.location} />}

            <div className="divider" />

            <InfoRow label="Purchased By" value={ticketData.buyerName} highlight />
          </div>
        )}

        {/* Invalid message */}
        {!isValid && (
          <p className="text-muted">
            This ticket could not be found or is not valid.
          </p>
        )}

        {/* Back to home button */}
        <button className="btn btn-ghost" style={{ marginTop: '2rem', width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/')}>
          Return Home
        </button>
      </div>
    </div>
  );
}

// ── Small helper component for a label + value row ─────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontWeight: 600, color: highlight ? '#818cf8' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

export default VerifyTicket;
