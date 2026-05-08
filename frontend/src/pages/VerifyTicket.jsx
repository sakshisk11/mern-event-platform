import React, { useState } from 'react';
import axios from 'axios';

const API = `http://${window.location.hostname}:5000/api`;

function VerifyTicket() {
  const [ticketId, setTicketId]   = useState('');
  const [result, setResult]       = useState(null);   // response from backend
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState('idle'); // 'idle' | 'valid' | 'used' | 'invalid'

  // ── Submit ticket ID to backend for verification ─────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setResult(null);
    setStatus('idle');

    try {
      // POST request — backend marks ticket as scanned on first call
      const { data } = await axios.post(`${API}/events/verify/${ticketId.trim()}`);

      setResult(data);

      if (data.alreadyUsed) {
        setStatus('used');    // ⚠️ already scanned before
      } else if (data.valid) {
        setStatus('valid');   // ✅ first scan — let them in
      } else {
        setStatus('invalid'); // ❌ something wrong
      }
    } catch (err) {
      // 404 = ticket not found
      setStatus('invalid');
      setResult({ message: err.response?.data?.message || 'Ticket not found' });
    } finally {
      setLoading(false);
    }
  };

  // Reset to scan another ticket
  const handleReset = () => {
    setTicketId('');
    setResult(null);
    setStatus('idle');
  };

  // Color and icon based on status
  const statusConfig = {
    valid:   { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: '#22c55e', icon: '✅', label: 'VALID — ALLOW ENTRY' },
    used:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: '#f59e0b', icon: '⚠️', label: 'ALREADY USED — DENY ENTRY' },
    invalid: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: '#ef4444', icon: '❌', label: 'INVALID TICKET' },
  };

  const cfg = statusConfig[status];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Header */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
          🎫 Ticket Verification
        </h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Admin only — scan QR or enter Ticket ID to verify entry. Each ticket can only be used once.
        </p>

        {/* Ticket ID input form */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Ticket ID</label>
                <input
                  className="form-input"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Paste or type ticket ID from QR scan..."
                  autoFocus
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  💡 Scan the QR code with your camera → copy the ID → paste it here
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                  disabled={loading || !ticketId.trim()}>
                  {loading ? 'Verifying...' : '🔍 Verify Ticket'}
                </button>
                {status !== 'idle' && (
                  <button type="button" className="btn btn-ghost" onClick={handleReset}>
                    Reset
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Result card — only shown after a verify attempt */}
        {status !== 'idle' && cfg && (
          <div style={{
            border: `2px solid ${cfg.border}`,
            borderRadius: '16px',
            padding: '2rem',
            background: cfg.bg,
            textAlign: 'center',
            animation: 'scaleIn 0.2s ease'
          }}>
            {/* Status icon + label */}
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{cfg.icon}</div>
            <h2 style={{ color: cfg.color, fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              {cfg.label}
            </h2>

            {/* Ticket details */}
            {result && (result.attendeeName || result.event) && (
              <div style={{
                background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
                padding: '1.2rem', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '0.7rem'
              }}>
                {result.attendeeName && <InfoRow label="Attendee Name" value={result.attendeeName} />}
                {result.attendeeId   && <InfoRow label="Attendee ID"   value={result.attendeeId} />}
                {result.event        && <InfoRow label="Event"         value={result.event} />}

                {/* Show when it was previously scanned (for "already used" case) */}
                {status === 'used' && result.scannedAt && (
                  <InfoRow
                    label="Previously scanned at"
                    value={new Date(result.scannedAt).toLocaleString()}
                    highlight
                  />
                )}

                {/* Show when it was just scanned now (for "valid" case) */}
                {status === 'valid' && result.scannedAt && (
                  <InfoRow
                    label="Scanned at"
                    value={new Date(result.scannedAt).toLocaleString()}
                    highlight
                  />
                )}
              </div>
            )}

            {/* Error message for invalid */}
            {status === 'invalid' && result?.message && (
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>{result.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helper: label + value row ────────────────────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{label}</div>
      <div style={{ fontWeight: 600, color: highlight ? '#f59e0b' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

export default VerifyTicket;
