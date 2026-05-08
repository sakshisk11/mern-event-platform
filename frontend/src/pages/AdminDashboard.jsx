import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = `http://${window.location.hostname}:5000/api`;

function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(`${API}/events/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return <div className="loader"><div className="spinner" /> Loading dashboard...</div>;
  }

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>📊 Admin Dashboard</h1>
        <p className="text-muted">Real-time overview of event bookings and attendee details.</p>
      </header>

      {error && <div className="alert-error" style={{ marginBottom: '2rem' }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gap: '2.5rem' }}>
        {stats.map((event) => (
          <div key={event._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '1.5rem 2rem', 
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{event.category}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{event.title}</h2>
                <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  📅 {event.date || 'No Date'} | 📍 {event.location || 'No Location'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{event.bookedCount}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Booked</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: event.remainingSpots < 5 ? '#ef4444' : '#22c55e' }}>{event.remainingSpots}</div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Remaining</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-muted)' }}>
                👥 Attendees ({event.attendees.length})
              </h3>
              
              {event.attendees.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', borderRadius: '10px' }}>
                  No one has booked this event yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>ID / Roll No</th>
                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.attendees.map((attendee, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '1rem 0', fontWeight: 600 }}>{attendee.name}</td>
                          <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{attendee.email}</td>
                          <td style={{ padding: '1rem 0', fontFamily: 'monospace' }}>{attendee.id}</td>
                          <td style={{ padding: '1rem 0' }}>
                            {attendee.scanned ? (
                              <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                ✅ CHECKED IN
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                ⏳ PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {stats.length === 0 && !error && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3>No events found</h3>
            <p className="text-muted">You haven't created any events yet.</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/create-event')}>
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
