import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const API = `http://${window.location.hostname}:5000/api`;

function VerifyTicket() {
  const [ticketId, setTicketId]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [status, setStatus]       = useState('idle'); // 'idle' | 'valid' | 'used' | 'invalid'
  const [scanning, setScanning]   = useState(false);  // true when camera is open
  const [scanError, setScanError] = useState('');

  // We use a ref to hold the Html5Qrcode instance so we can stop it later
  const scannerRef = useRef(null);

  // ── Clean up scanner when component unmounts ─────────────────────
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ── Extract the Ref (ticket _id) from the scanned QR text ────────
  // QR format:
  //   EventMaster Ticket
  //   Name: Sakshi
  //   ID: 1234
  //   Event: Campus Music Fest
  //   Ref: <ticketId>
  const extractRefFromText = (text) => {
    const match = text.match(/Ref:\s*([a-f0-9]{24})/i);
    return match ? match[1] : null;
  };

  // ── Start the camera scanner ──────────────────────────────────────
  const startScanner = async () => {
    setScanError('');
    setScanning(true);
    setStatus('idle');
    setResult(null);
    setTicketId('');

    // Small delay so the #qr-reader div renders before we mount the scanner
    await new Promise(r => setTimeout(r, 200));

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' }, // use back camera on phones
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR detected — stop camera first, then verify
          await scanner.stop();
          setScanning(false);

          const ref = extractRefFromText(decodedText);
          if (ref) {
            setTicketId(ref);
            await verifyById(ref); // auto-verify immediately
          } else {
            setScanError('QR code not recognized. Please try manual entry.');
          }
        },
        () => {} // ignore individual frame scan errors
      );
    } catch (err) {
      setScanning(false);
      setScanError('Could not access camera. Please allow camera permission or use manual entry.');
    }
  };

  // ── Stop the camera scanner ───────────────────────────────────────
  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  // ── Call backend to verify ticket by ID ──────────────────────────
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

  // ── Manual form submit ────────────────────────────────────────────
  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyById(ticketId);
  };

  // ── Reset everything to scan another ticket ───────────────────────
  const handleReset = () => {
    setTicketId('');
    setResult(null);
    setStatus('idle');
    setScanError('');
  };

  // ── Status display config ─────────────────────────────────────────
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
          Scan a ticket QR code with the camera or enter the Ref manually.
          Each ticket can only be used once.
        </p>

        {/* ── Camera Scanner ─────────────────────────────────────── */}
        {!scanning && status === 'idle' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', marginBottom: '1rem' }}
            onClick={startScanner}
          >
            📷 Scan QR Code with Camera
          </button>
        )}

        {/* Camera viewfinder — html5-qrcode mounts into this div */}
        {scanning && (
          <div style={{ marginBottom: '1rem' }}>
            <div
              id="qr-reader"
              style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)' }}
            />
            <button
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
              onClick={stopScanner}
            >
              Cancel Scan
            </button>
          </div>
        )}

        {/* Camera error message */}
        {scanError && (
          <div className="alert-error" style={{ marginBottom: '1rem' }}>⚠️ {scanError}</div>
        )}

        {/* ── Manual Entry (fallback) ────────────────────────────── */}
        {!scanning && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                Or enter the <strong>Ref</strong> value manually:
              </p>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Paste Ref value here..."
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !ticketId.trim()}>
                  {loading ? '...' : 'Verify'}
                </button>
                {status !== 'idle' && (
                  <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
                )}
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
            animation: 'scaleIn 0.2s ease'
          }}>
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

                {status === 'used' && result.scannedAt && (
                  <InfoRow label="⚠️ Previously scanned at" value={new Date(result.scannedAt).toLocaleString()} highlight />
                )}
                {status === 'valid' && result.scannedAt && (
                  <InfoRow label="✅ Scanned at" value={new Date(result.scannedAt).toLocaleString()} highlight />
                )}
              </div>
            )}

            {status === 'invalid' && result?.message && (
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>{result.message}</p>
            )}

            {/* Button to scan the next ticket */}
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
