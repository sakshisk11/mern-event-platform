import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = `http://${window.location.hostname}:5000/api`;

function CreateEvent() {
  // Form state - one object for all fields
  const [form, setForm] = useState({
    title:     '',
    category:  '',
    spots:     50,
    date:      '',
    location:  '',
    organizer: '',
    desc:      '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  // Update a single field in the form object
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('userToken');

    setLoading(true);
    try {
      // POST event to backend (convert spots to a number)
      await axios.post(
        `${API}/events`,
        { ...form, spots: Number(form.spots) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/'); // go back to home after creating
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>

        {/* Back button */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
          ← Back
        </button>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Create New Event</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Fill in the details to publish your event.</p>

        {/* Form card */}
        <div className="card">
          <div className="card-body">

            {/* Error message */}
            {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-input" name="title" type="text"
                  value={form.title} onChange={handleChange}
                  placeholder="e.g. Annual Hackathon 2026" required />
              </div>

              {/* Category + Spots on same row */}
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input className="form-input" name="category" type="text"
                    value={form.category} onChange={handleChange}
                    placeholder="e.g. Tech, Sports..." required />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Spots *</label>
                  <input className="form-input" name="spots" type="number"
                    value={form.spots} onChange={handleChange} min="1" required />
                </div>
              </div>

              {/* Date + Location on same row */}
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input className="form-input" name="date" type="date"
                    value={form.date} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Venue</label>
                  <input className="form-input" name="location" type="text"
                    value={form.location} onChange={handleChange}
                    placeholder="e.g. Main Auditorium" />
                </div>
              </div>

              {/* Organizer */}
              <div className="form-group">
                <label className="form-label">Organizer Name</label>
                <input className="form-input" name="organizer" type="text"
                  value={form.organizer} onChange={handleChange}
                  placeholder="e.g. CS Department" />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" name="desc"
                  value={form.desc} onChange={handleChange}
                  placeholder="Describe your event..." required rows={4}
                  style={{ resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              {/* Submit buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Publishing...' : '🚀 Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
