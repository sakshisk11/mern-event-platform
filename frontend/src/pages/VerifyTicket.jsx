import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { useLocation } from 'react-router-dom';

const API = `http://${window.location.hostname}:5000/api`;

function VerifyTicket() {
  const [ticketId, setTicketId]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState('idle'); // 'idle' | 'valid' | 'used' | 'invalid'
  const [scanning, setScanning]   = useState(false);
  const [scanError, setScanError] = useState('');

  const scannerRef = useRef(null);
  const location = useLocation();

  // ── Auto-verify if the page was opened via QR link (?ref=ID) ─────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setTicketId(ref);
      verifyById(ref);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Extract ticket _id from whatever the QR contains ─────────────
  // Handles:
  //   1. URL format:  http://host/verify-ticket?ref=<24hex>
  //   2. Raw 24-char hex ID
  const extractRef = (text) => {
    const urlMatch = text.match(/[?&]ref=([a-f0-9]{24})/i);
    if (urlMatch) return urlMatch[1];
    if (/^[a-f0-9]{24}$/i.test(text.trim())) return text.trim();
    return null;
  };

  // ── Start camera scanner ──────────────────────────────────────────
  const startScanner = async () => {
    setScanError('');
    setScanning(true);
    setStatus('idle');
    setResult(null);
    setTicketId('');

    await new Promise(r => setTimeout(r, 200)); // wait for #qr-reader to render

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },             // back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);

          const ref = extractRef(decodedText);
          if (ref) {
            setTicketId(ref);
            await verifyById(ref); // auto-verify on successful scan
          } else {
            setScanError('QR not recognized. Try manual entry below.');
          }
        },
        () => {} // ignore per-frame errors
      );
    } catch {
      setScanning(false);
      setScanError('Camera access denied. Allow camera permission and try again, or use manual entry.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) await scannerRef.current.stop().catch(() => {});
    setScanning(false);
  };

  // ── Call backend: POST /verify/:id ───────────────────────────────
  // First call → marks ticket scanned=true in DB → returns valid
  // Second call → ticket already marked → returns alreadyUsed
  const verifyById = async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setResult(null);
    setStatus('idle');

    try {
      const { data } = await axios.post(`${API}/events/verify/${id.trim()}`);
      setResult(data);
      setStatus(data.alreadyUsed ? 'used' : data.valid ? 'valid' : 'invalid');
    } catch (err) {
      setStatus('invalid');
      setResult({ message: err.response?.data?.message || 'Ticket not found' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyById(ticketId);
  };

  const handleReset = () => {
    setTicketId('');
    setResult(null);
    setStatus('idle');
    setScanError('');
  };

  const statusConfig = {
    valid:   { color: '#22c55e', icon: '✅', label: 'VALID — ALLOW ENTRY' },
    used:    { color: '#f59e0b', icon: '⚠️', label: 'ALREADY USED — DENY ENTRY' },
    invalid: { color: '#ef4444', icon: '❌', label: 'INVALID TICKET' },
  };
  const cfg = statusConfig[status];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>

        {/* Header */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>
          🎫 Ticket Verification
        </h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Scan the attendee's QR code with the button below. Each ticket can only be used once.
        </p>

        {/* ── Big Scan Button ─────────────────────────────────────── */}
        {!scanning && status === 'idle' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', fontSize: '1.1rem', marginBottom: '1rem' }}
            onClick={startScanner}
          >
            📷 Tap to Scan QR Code
          </button>
        )}

        {/* ── Camera Viewfinder ────────────────────────────────────── */}
        {scanning && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Point camera at the attendee's QR code...
            </p>
            <div
              id="qr-reader"
              style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)' }}
            />
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
              onClick={stopScanner}>
              Cancel
            </button>
          </div>
        )}

        {/* Camera error */}
        {scanError && <div className="alert-error" style={{ marginBottom: '1rem' }}>⚠️ {scanError}</div>}

        {/* ── Manual Entry Fallback ────────────────────────────────── */}
        {!scanning && (
          <details style={{ marginBottom: '1.5rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              ✏️ Enter Ref manually instead
            </summary>
            <div className="card" style={{ marginTop: '0.75rem' }}>
              <div className="card-body">
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="form-input"
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="Paste the Ref value here..."
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading || !ticketId.trim()}>
                    {loading ? '...' : 'Verify'}
                  </button>
                </form>
              </div>
            </div>
          </details>
        )}

        {/* ── Result ──────────────────────────────────────────────── */}
        {status !== 'idle' && cfg && (
          <div style={{
            border: `2px solid ${cfg.color}`,
            borderRadius: '16px',
            padding: '2rem',
            background: `${cfg.color}12`,
            textAlign: 'center',
            animation: 'scaleIn 0.2s ease'
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
                {result.attendeeName && <InfoRow label="Name"  value={result.attendeeName} />}
                {result.attendeeId   && <InfoRow label="ID"    value={result.attendeeId} />}
                {result.event        && <InfoRow label="Event" value={result.event} />}
                {status === 'used'  && result.scannedAt && (
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

            {/* Scan next */}
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
              onClick={() => { handleReset(); startScanner(); }}
            >
              📷 Scan Next Ticket
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
