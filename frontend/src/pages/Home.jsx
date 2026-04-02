import React, { useState } from 'react';

// Temporary placeholder data until we build our MongoDB backend!
const DUMMY_EVENTS = [
  { id: 1, title: 'Annual Tech Hackathon', category: 'Tech', desc: 'A 48-hour coding marathon. Build amazing things with your college peers!', spots: 5 },
  { id: 2, title: 'Inter-College Badminton', category: 'Sports', desc: 'Show off your smashes and win the gold medal this Friday!', spots: 20 },
  { id: 3, title: 'Campus Music Fest', category: 'Cultural', desc: 'Live bands all night. Bring your student ID.', spots: 150 },
  { id: 4, title: 'AI & Machine Learning Workshop', category: 'Tech', desc: 'Learn the basics of Neural Networks from industry experts.', spots: 0 }
];

function Home() {
  // Using React State to remember which tab is currently clicked!
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter our dummy events array. If 'All', show everything. Otherwise, only show events matching activeCategory.
  const filteredEvents = activeCategory === 'All' 
    ? DUMMY_EVENTS 
    : DUMMY_EVENTS.filter(event => event.category === activeCategory);

  return (
    <div className="home-page">
      <header className="home-header" style={{textAlign: 'center', marginBottom: '2rem', padding: '2rem 0'}}>
        <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>Discover Amazing Events</h1>
        <p style={{color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto'}}>
          Join the hottest tech, cultural, and sports events happening around campus. Book your digital ticket instantly.
        </p>
      </header>

      {/* Category Filter Buttons */}
      <div className="filters" style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap'}}>
        {['All', 'Tech', 'Cultural', 'Sports'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              border: `1px solid ${activeCategory === cat ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'rgba(30, 41, 59, 0.5)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'var(--transition)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Dynamic Grid of Events */}
      <section className="events-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem'}}>
        {filteredEvents.map(event => (
          <div key={event.id} className="glass event-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid var(--${event.category === 'Tech' ? 'primary-color' : event.category === 'Cultural' ? 'accent-color' : 'text-secondary'})`}}>
            
            <div style={{height: '160px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--text-secondary)'}}>
              Image Placeholder
            </div>
            
            <h3 style={{fontSize: '1.3rem'}}>{event.title}</h3>
            
            <p style={{color: 'var(--text-secondary)', fontSize:'0.9rem', flexGrow: 1}}>
              {event.desc}
            </p>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
              <span style={{color: 'var(--text-primary)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem'}}>{event.category}</span>
              
              <span style={{fontSize: '0.9rem', color: event.spots === 0 ? '#ef4444' : event.spots <= 5 ? 'var(--accent-color)' : 'var(--text-secondary)'}}>
                {event.spots === 0 ? 'Sold Out' : `Only ${event.spots} left`}
              </span>
            </div>
            
            <button 
              disabled={event.spots === 0}
              style={{
                padding: '0.8rem', 
                backgroundColor: event.spots === 0 ? 'rgba(255,255,255,0.1)' : 'var(--primary-color)', 
                color: event.spots === 0 ? 'var(--text-secondary)' : 'white', 
                border:'none', 
                borderRadius: 'var(--radius-md)', 
                cursor: event.spots === 0 ? 'not-allowed' : 'pointer', 
                fontWeight: 600,
                transition: 'var(--transition)',
                marginTop: '0.5rem'
              }}>
              {event.spots === 0 ? 'Fully Booked' : 'Book Ticket'}
            </button>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>
            <h3>No events found for this category.</h3>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
