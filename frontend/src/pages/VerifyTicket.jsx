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
  const location   = useLocation();

  // ── Clean up camera on unmount ────────────────────────────────────
  useEffect(() => {
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}); };
  }, []);

  // ── Auto-verify if page opened via QR URL (?ref=ID) ──────────────
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) { setTicketId(ref); verifyById(ref); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Extract ticket _id from a scanned URL or raw hex ─────────────
  const extractRef = (text) => {
    const urlMatch = text.match(/[?&]ref=([a-f0-9]{24})/i);
    if (urlMatch) return urlMatch[1];
    if (/^[a-f0-9]{24}$/i.test(text.trim())) return text.trim();
    return null;
  };

  // ── Start camera scanner ──────────────────────────────────────────
  const startScanner = async () => {
    setScanError(''); setScanning(true); setStatus('idle'); setResult(null); setTicketId('');
    await new Promise(r => setTimeout(r, 200));
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop(); setScanning(false);
          const ref = extractRef(decodedText);
          if (ref) { setTicketId(ref); await verifyById(ref); }
          else setScanError('QR not recognized. Try entering the code below.');
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setScanError('Camera access denied. Allow camera permission or enter the code manually.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) await scannerRef.current.stop().catch(() => {});
    setScanning(false);
  };

  // ── Verify by MongoDB _id (QR scan) ──────────────────────────────
  const verifyById = async (id) => {
    if (!id?.trim()) return;
    setLoading(true); setResult(null); setStatus('idle');
    try {
      const { data } = await axios.post(`${API}/events/verify/${id.trim()}`);
      setResult(data);
      setStatus(data.alreadyUsed ? 'used' : data.valid ? 'valid' : 'invalid');
    } catch (err) {
      setStatus('invalid');
      setResult({ message: err.response?.data?.message || 'Ticket not found' });
    } finally { setLoading(false); }
  };

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

  // ── Form submit ──────────────────────────────────────────────────
  // 24-char hex = full MongoDB _id (from QR scan) → verifyById
  // Anything else (8-char _id prefix shown on dashboard) → verifyByCode
  const handleSubmit = (e) => {
    e.preventDefault();
    const val = ticketId.trim().toUpperCase();
    if (!val) return;
    if (/^[a-f0-9]{24}$/i.test(val)) verifyById(val);
    else verifyByCode(val);
  };


  const handleReset = () => { setTicketId(''); setResult(null); setStatus('idle'); setScanError(''); };

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
          Enter the attendee's <strong style={{ color: '#a5b4fc' }}>6-letter ticket code</strong> shown
          on their Dashboard. Each ticket can only be used once.
        </p>

        {/* ── PRIMARY: Ticket Code Entry ─────────────────────────── */}
        {!scanning && status === 'idle' && (
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
                  placeholder="Type 8-char code..."
                  maxLength={8}
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

        {/* ── SECONDARY: QR Camera Scanner ──────────────────────── */}
        {!scanning && status === 'idle' && (
          <details style={{ marginBottom: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.4rem 0' }}>
              📷 Or scan QR code with camera instead
            </summary>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.6rem' }}
              onClick={startScanner}
            >
              Open Camera Scanner
            </button>
          </details>
        )}

        {/* ── Camera Viewfinder ──────────────────────────────────── */}
        {scanning && (
          <div style={{ marginBottom: '1rem' }}>
            <p className="text-muted" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Point camera at the attendee's QR code...
            </p>
            <div
              id="qr-reader"
              style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)' }}
            />
            <button
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
              onClick={stopScanner}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Camera / scan error */}
        {scanError && (
          <div className="alert-error" style={{ marginBottom: '1rem' }}>⚠️ {scanError}</div>
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
                {result.attendeeName && <InfoRow label="Name"  value={result.attendeeName} />}
                {result.attendeeId   && <InfoRow label="ID"    value={result.attendeeId} />}
                {result.ticketCode   && <InfoRow label="Code"  value={result.ticketCode} />}
                {result.event        && <InfoRow label="Event" value={result.event} />}
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
