import React, { useState } from 'react';
import axios from 'axios';

const API = `http://${window.location.hostname}:5000/api`;

function VerifyTicket() {
  const [ticketId, setTicketId]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState('idle'); // 'idle' | 'valid' | 'used' | 'invalid'

  // ── Verify by short ticket code (e.g. "AX7K2P") ──────────────────
  const verifyByCode = async (code) => {
    if (!code?.trim()) return;
    setLoading(true); setResult(null); setStatus('idle');
    try {
      const { data } = await axios.post(`${API}/events/verify-code/${code.trim().toUpperCase()}`);
      setResult(data);
      setStatus(data.alreadyUsed ? 'used' : data.valid ? 'valid' : 'invalid');
    } catch (err) {
      setStatus('invalid');
      setResult({ message: err.response?.data?.message || 'Code not found' });
    } finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = ticketId.trim().toUpperCase();
    if (!val) return;
    verifyByCode(val);
  };

  const handleReset = () => { setTicketId(''); setResult(null); setStatus('idle'); };

  const statusConfig = {
    valid:   { color: '#22c55e', icon: '✅', label: 'VALID — ALLOW ENTRY' },
    used:    { color: '#f59e0b', icon: '⚠️', label: 'ALREADY USED — DENY ENTRY' },
    invalid: { color: '#ef4444', icon: '❌', label: 'INVALID TICKET' },
  };
  const cfg = statusConfig[status];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
          🎫 Ticket Verification
        </h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Enter the attendee's <strong style={{ color: '#a5b4fc' }}>unique ticket code</strong> shown
          on their Dashboard. Each ticket can only be used once.
        </p>

        {/* ── PRIMARY: Ticket Code Entry ─────────────────────────── */}
        {status === 'idle' && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Ticket Code (e.g. <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>69FD4DC4</span>)
              </label>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                  placeholder="Type code here..."
                  maxLength={12}
                  autoFocus
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.3rem', letterSpacing: '0.2em' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0 1.5rem', fontSize: '1rem' }}
                  disabled={loading || !ticketId.trim()}
                >
                  {loading ? '...' : '✓ Verify'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Result Card ────────────────────────────────────────── */}
        {status !== 'idle' && cfg && (
          <div style={{
            border: `2px solid ${cfg.color}`,
            borderRadius: '16px',
            padding: '2rem',
            background: `${cfg.color}12`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{cfg.icon}</div>
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
                {result.event        && <InfoRow label="Event Title"   value={result.event} />}
                {status === 'used' && result.scannedAt && (
                  <InfoRow label="⚠️ Previously scanned at" value={new Date(result.scannedAt).toLocaleString()} highlight />
                )}
                {status === 'valid' && result.scannedAt && (
                  <InfoRow label="✅ Scanned at" value={new Date(result.scannedAt).toLocaleString()} highlight />
                )}
              </div>
            )}

            {status === 'invalid' && (
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                {result?.message || 'Ticket not found in the system.'}
              </p>
            )}

            {/* Next ticket */}
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
              onClick={handleReset}
            >
              Verify Another Ticket
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{label}</div>
      <div style={{ fontWeight: 600, color: highlight ? '#f59e0b' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

export default VerifyTicket;
