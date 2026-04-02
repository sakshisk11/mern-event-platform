import React from 'react';

function Dashboard() {
  return (
    <div className="glass" style={{ padding: '3rem', marginTop: '2rem' }}>
      <h2>My Digital Tickets</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Once you book a ticket, your personal scanable QR code will appear right here.</p>
    </div>
  );
}

export default Dashboard;
