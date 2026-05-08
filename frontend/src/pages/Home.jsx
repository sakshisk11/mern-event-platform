import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = `http://${window.location.hostname}:5000/api`;

// ── Category config: icon and color per category ───────────────────
const CATEGORY = {
  Tech:      { icon: '💻', color: '#6366f1' },
  Cultural:  { icon: '🎭', color: '#ec4899' },
  Sports:    { icon: '⚽', color: '#22c55e' },
  Music:     { icon: '🎵', color: '#f59e0b' },
  Seminar:   { icon: '📚', color: '#06b6d4' },
  Workshop:  { icon: '🔧', color: '#8b5cf6' },
  Concert:   { icon: '🎸', color: '#ef4444' },
  default:   { icon: '📅', color: '#6366f1' },
};

function getCfg(category) {
  return CATEGORY[category] || CATEGORY.default;
}

// ── Toast: small popup message at bottom-right ─────────────────────
function Toast({ message, type, onClose }) {
  // Auto-close after 3.5 seconds
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

// ── Booking Modal: shown when user clicks "Book Ticket" ────────────
function BookingModal({ event, userInfo, onClose, onConfirm }) {
  const [attendeeName, setAttendeeName] = useState(userInfo?.name || '');
  const [attendeeId, setAttendeeId]     = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(event._id, attendeeName, attendeeId);
    setLoading(false);
  };

  // How full is this event? Used to color the progress bar
  const fillPct = event.totalSpots > 0
    ? Math.round(((event.totalSpots - event.spots) / event.totalSpots) * 100)
    : 100;

  const barColor = fillPct >= 90 ? '#ef4444' : fillPct >= 60 ? '#f59e0b' : '#22c55e';

  return (
    // Clicking the dark overlay closes the modal
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Event info */}
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="badge">{event.category}</span>
            <h2 style={{ marginTop: '0.5rem', fontSize: '1.3rem' }}>{event.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Spots remaining + progress bar */}
        <div style={{ marginBottom: '1.2rem' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>
            <span className="text-muted">Spots filled</span>
            <span style={{ color: barColor, fontWeight: 600 }}>{event.spots} remaining</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${fillPct}%`, background: barColor }} />
          </div>
        </div>

        <div className="divider" />

        {/* Attendee form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Attendee Name</label>
            <input className="form-input" type="text" value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Attendee ID <span className="text-muted">(optional)</span></label>
            <input className="form-input" type="text" value={attendeeId}
              onChange={(e) => setAttendeeId(e.target.value)} placeholder="Student ID / Employee ID" />
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ℹ️ A unique ticket code will appear on your Dashboard.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Booking...' : '🎟 Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Home Page ─────────────────────────────────────────────────
function Home() {
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingEvent, setBookingEvent] = useState(null); // which event is being booked
  const [toast, setToast]               = useState(null);
  const navigate = useNavigate();

  // Read logged-in user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

  // Show a toast notification
  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Fetch all events from backend ────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/events`);
      setEvents(data);
    } catch {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Book a ticket ─────────────────────────────────────────────────
  const handleBookConfirm = async (eventId, attendeeName, attendeeId) => {
    const token = localStorage.getItem('userToken');
    try {
      await axios.put(
        `${API}/events/${eventId}/book`,
        { attendeeName, attendeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update spots count locally (no need to refetch)
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, spots: e.spots - 1 } : e));
      setBookingEvent(null);
      showToast('🎉 Ticket booked! Check your Dashboard.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error');
    }
  };

  // ── Handle Book button click ──────────────────────────────────────
  const handleBookClick = (event) => {
    if (!localStorage.getItem('userToken')) {
      showToast('Please login to book a ticket', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    setBookingEvent(event);
  };

  // ── Delete an event (admin only) ──────────────────────────────────
  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    const token = localStorage.getItem('userToken');
    try {
      await axios.delete(`${API}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(prev => prev.filter(e => e._id !== eventId));
      showToast('Event deleted');
    } catch {
      showToast('Failed to delete event', 'error');
    }
  };

  // ── Build category filter list from actual events ─────────────────
  const categories = ['All', ...new Set(events.map(e => e.category))];

  // ── Filter events by selected category ───────────────────────────
  const filtered = activeCategory === 'All'
    ? events
    : events.filter(e => e.category === activeCategory);

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
        Loading events...
      </div>
    );
  }

  return (
    <div className="page">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Discover Events
        </h1>
        <p className="text-muted">Browse and book tickets for upcoming events</p>

        {/* Show login/register buttons if user is not logged in */}
        {!userInfo && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.2rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        )}
      </div>

      {/* ── Category filter pills ─────────────────────────────────── */}
      <div className="filter-pills">
        {categories.map(cat => (
          <button
            key={cat}
            className={`pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat !== 'All' && getCfg(cat).icon + ' '}{cat}
          </button>
        ))}
      </div>

      {/* ── "Create Event" button for admins ─────────────────────── */}
      {userInfo?.role === 'admin' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
            + Create Event
          </button>
        </div>
      )}

      {/* ── Events Grid ──────────────────────────────────────────── */}
      <div className="events-grid">
        {filtered.map(event => {
          const cfg = getCfg(event.category);
          const isSoldOut = event.spots <= 0;
          const isLow = event.spots > 0 && event.spots <= 5;
          const fillPct = event.totalSpots > 0
            ? Math.round(((event.totalSpots - event.spots) / event.totalSpots) * 100)
            : (isSoldOut ? 100 : 0);

          return (
            <div key={event._id} className="event-card" style={{ borderTop: `3px solid ${cfg.color}` }}>

              {/* Banner with emoji icon */}
              <div className="event-card-banner" style={{ background: `${cfg.color}18`, position: 'relative' }}>
                <span>{cfg.icon}</span>
                {isSoldOut && (
                  <div className="sold-out-overlay">
                    <span className="sold-out-label">SOLD OUT</span>
                  </div>
                )}
              </div>

              <div className="event-card-body">
                {/* Category + spots count */}
                <div className="flex-between">
                  <span className="badge" style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}15` }}>
                    {event.category}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600,
                    color: isSoldOut ? '#f87171' : isLow ? '#fbbf24' : '#4ade80' }}>
                    {isSoldOut ? '🔴 Full' : isLow ? `⚠️ ${event.spots} left` : `✅ ${event.spots} spots`}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{event.title}</h3>

                {/* Description (clamped to 3 lines) */}
                <p className="text-muted" style={{
                  fontSize: '0.88rem', lineHeight: 1.6, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {event.desc}
                </p>

                {/* Date and location (if set) */}
                {(event.date || event.location) && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {event.date && <div>📅 {event.date}</div>}
                    {event.location && <div>📍 {event.location}</div>}
                  </div>
                )}

                {/* Spots progress bar */}
                <div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${fillPct}%`,
                      background: fillPct >= 90 ? '#ef4444' : fillPct >= 60 ? '#f59e0b' : '#22c55e'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem' }}>
                    {fillPct}% filled
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {userInfo?.role === 'admin' ? (
                    // Admin sees Edit and Delete buttons
                    <>
                      <button className="btn btn-ghost" style={{ flex: 1 }}
                        onClick={() => navigate(`/edit-event/${event._id}`)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger" style={{ flex: 1 }}
                        onClick={() => handleDelete(event._id)}>
                        🗑 Delete
                      </button>
                    </>
                  ) : (
                    // Regular user sees Book Ticket button
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', opacity: isSoldOut ? 0.6 : 1,
                        background: isSoldOut ? 'rgba(255,255,255,0.05)' : cfg.color }}
                      disabled={isSoldOut}
                      onClick={() => handleBookClick(event)}
                    >
                      {isSoldOut ? '🔒 Fully Booked' : '🎟 Book Ticket'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3>No events in this category</h3>
          </div>
        )}
      </div>

      {/* ── Booking Modal (shown when user clicks Book Ticket) ────── */}
      {bookingEvent && (
        <BookingModal
          event={bookingEvent}
          userInfo={userInfo}
          onClose={() => setBookingEvent(null)}
          onConfirm={handleBookConfirm}
        />
      )}

      {/* ── Toast Notification ────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Home;
