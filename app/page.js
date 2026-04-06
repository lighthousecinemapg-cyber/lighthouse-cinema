'use client';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', 'weekly', 'special', 'screening'];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div className="animate-in">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(201,168,76,0.08) 0%, transparent 60%)',
        padding: '80px 0 48px',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>
            <span className="gold-text">Upcoming</span> Events
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 32px' }}>
            Bingo, karaoke, salsa, screenings, and more. Book your seats at Pacific Grove's most exciting venue.
          </p>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={filter === cat ? 'btn btn-gold btn-sm' : 'btn btn-dark btn-sm'}
              >
                {cat === 'all' ? 'All Events' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section" style={{ paddingTop: '32px' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.2rem' }}>No events found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filtered.map(event => (
                <a
                  key={event.id}
                  href={`/events/${event.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Card Image */}
                    <div style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, var(--dark-elevated), var(--dark-card))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--dark-border)',
                      position: 'relative',
                    }}>
                      <span style={{ fontSize: '3rem' }}>
                        {event.category === 'weekly' ? 'ð­' : event.category === 'screening' ? 'ð¬' : 'â¨'}
                      </span>
                      <span className="badge badge-gold" style={{
                        position: 'absolute', top: '12px', right: '12px',
                      }}>
                        {event.category}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{event.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>
                        {event.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '600' }}>
                            {formatDate(event.date)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formatTime(event.time)} &middot; {event.venue}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>
                            ${event.ticketPrice}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per ticket</div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 0 0',
                        borderTop: '1px solid var(--dark-border)',
                      }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {event.totalSeats - event.bookedSeats} seats left
                        </span>
                        <span className="btn btn-gold btn-sm" style={{ pointerEvents: 'none' }}>
                          Book Now &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
