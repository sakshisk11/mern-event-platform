import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API = `http://${window.location.hostname}:5000/api`;

function EditEvent() {
  // Form state
  const [form, setForm] = useState({ title: '', category: '', desc: '', spots: 10 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // event ID from the URL

  // ── Fetch existing event details when the page loads ────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${API}/events/${id}`);
        setForm({
          title:    data.title,
          category: data.category,
          desc:     data.desc,
          spots:    data.spots,
        });
        setLoading(false);
      } catch {
        alert('Error fetching event');
        navigate('/');
      }
    };
    fetchEvent();
  }, [id, navigate]);

  // Update a single field in the form object
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Submit updated event to backend ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('userToken');

    try {
      await axios.put(
        `${API}/events/${id}`,
        { ...form, spots: Number(form.spots) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" /> Loading event...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>

        {/* Back button */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
          ← Back
        </button>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>Edit Event</h1>

        <div className="card">
          <div className="card-body">

            {/* Error message */}
            {error && <div className="alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input className="form-input" name="title" type="text"
                  value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" name="category" type="text"
                  value={form.category} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Available Spots</label>
                <input className="form-input" name="spots" type="number"
                  value={form.spots} onChange={handleChange} min="0" required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" name="desc"
                  value={form.desc} onChange={handleChange} required rows={4}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;
