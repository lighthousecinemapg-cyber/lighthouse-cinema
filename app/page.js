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
      {/* HERO */}
      <section style={{
        background: 'radial-gradient(ellipse at top, rgba(201,168,76,0.18) 0%, transparent 60%), #0A0A0A',
        padding: '100px 0 60px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
      }}>
        <div className="container">
          <div style={{ fontSize: '0.85rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '16px', textTransform: 'uppercase' }}>
            Pacific Grove &middot; Since 1987
          </div>
          <h1 style={{ fontSize: '3.4rem', marginBottom: '16px', lineHeight: 1.1 }}>
            The <span className="gold-text">Crown Jewel</span> of the Peninsula
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto 32px' }}>
            Movies, bingo, karaoke, salsa, comedy, and community nights. A beloved neighborhood cinema where first dates happen, friendships grow, and families come together.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#events" className="btn btn-gold">Book an Event</a>
            <a href="https://messages.squareup.com/" target="_blank" rel="noopener noreferrer" className="btn btn-dark">Message Us</a>
          </div>
        </div>
      </section>

      {/* LIVE SCHEDULE — TODAY / TOMORROW / THIS WEEK */}
      <section id="schedule" style={{ padding: '56px 0', background: 'linear-gradient(180deg, #0c0c0c, #0a0a0a)', borderTop: '1px solid rgba(201,168,76,0.18)', borderBottom: '1px solid rgba(201,168,76,0.18)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>
            🎬 What&apos;s <span className="gold-text">Playing Now</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '40px' }}>
            Tonight, tomorrow, and the week ahead — at a glance
          </p>

          <div className="grid grid-2" style={{ marginBottom: '24px' }}>
            <div className="card" style={{ padding: '28px', border: '1px solid rgba(201,168,76,0.35)' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '8px' }}>📅 TODAY — APRIL 8</div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>Tonight at Lighthouse</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>🎥 <strong>Movie:</strong> Feature Film — 6:30 PM</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>🎤 <strong>Event:</strong> Karaoke Night — 6:30–9:00 PM</p>
              <a href="sms:+18317173124?body=Coming%20tonight" className="btn btn-gold">Come Tonight &rarr;</a>
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '8px' }}>📅 TOMORROW — APRIL 9</div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>Plan Your Visit</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>🎥 <strong>Movie:</strong> Feature Film — 7:00 PM</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>🮲 <strong>Event:</strong> Bingo Night — 6:30–8:30 PM</p>
              <a href="#events" className="btn btn-dark">Plan Your Visit &rarr;</a>
            </div>
          </div>

          <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', textAlign: 'center' }}>🔥 This Week at a Glance</h3>
            <div className="grid grid-4" style={{ gap: '12px' }}>
              <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(201,168,76,0.06)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '1.5px' }}>THURSDAY</div>
                <div style={{ fontSize: '1.5rem', margin: '6px 0' }}>🎲</div>
                <div style={{ fontWeight: 600 }}>Bingo Night</div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(201,168,76,0.06)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '1.5px' }}>FRIDAY</div>
                <div style={{ fontSize: '1.5rem', margin: '6px 0' }}>🎤</div>
                <div style={{ fontWeight: 600 }}>Karaoke</div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(201,168,76,0.06)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '1.5px' }}>SATURDAY</div>
                <div style={{ fontSize: '1.5rem', margin: '6px 0' }}>💃</div>
                <div style={{ fontWeight: 600 }}>Salsa Night</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>8 PM–1 AM</div>
              </div>
              <div style={{ textAlign: 'center', padding: '14px', background: 'rgba(201,168,76,0.06)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '1.5px' }}>SUNDAY</div>
                <div style={{ fontSize: '1.5rem', margin: '6px 0' }}>🍳</div>
                <div style={{ fontWeight: 600 }}>Brunch + Movie</div>
              </div>
            </div>
          </div>

          {/* FULL GOOGLE CALENDAR EMBED */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>📆 Full Schedule</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click any day to see showtimes and events</p>
          </div>
          <div className="card" style={{ padding: '8px', overflow: 'hidden' }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles&bgcolor=%230a0a0a&color=%23c9a84c&showTitle=0&showPrint=0&showCalendars=0&mode=MONTH"
              style={{ border: 0, width: '100%', height: '520px', borderRadius: '8px', background: '#0a0a0a' }}
              frameBorder="0"
              scrolling="no"
              title="Lighthouse Cinema Schedule"
            ></iframe>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '12px' }}>
            To show your own events: create a public Google Calendar named &quot;Lighthouse Cinema Schedule&quot;, then text us the calendar ID and we&apos;ll swap it in.
          </p>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" style={{ padding: '72px 0 32px', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
            <span className="gold-text">Upcoming</span> Events
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
            Reserve your seat at Pacific Grove's most exciting venue.
          </p>
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
                <a key={event.id} href={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, var(--dark-elevated), var(--dark-card))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderBottom: '1px solid var(--dark-border)', position: 'relative',
                    }}>
                      <span style={{ fontSize: '3rem' }}>
                        {event.category === 'weekly' ? '🎭' : event.category === 'screening' ? '🎬' : '✨'}
                      </span>
                      <span className="badge badge-gold" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        {event.category}
                      </span>
                    </div>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', borderTop: '1px solid var(--dark-border)' }}>
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

      {/* COMMUNITY NIGHTS — inspired by Parkway's free mezzanine events */}
      <section style={{ padding: '72px 0', background: '#0f0f0f', borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Free &amp; For Everyone
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '14px' }}>Community Nights</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 40px' }}>
            Drop-in gatherings in the lobby lounge. Grab a drink, meet neighbors, no cover charge.
          </p>
          <div className="grid grid-3" style={{ textAlign: 'left' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎨</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Drink &amp; Draw</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Artists of every skill level welcome. Bring a sketchbook, order a drink, make something new. Free, weekly.
              </p>
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎲</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Tabletop Night</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Drop-in tabletop and board games hosted in the lounge. All you need is your imagination. Free, weekly.
              </p>
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💛</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Karma Screenings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Pay what you want. 20% of proceeds go to a local non-profit partner each month. Good films, good cause.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT — Crown Jewel story */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', letterSpacing: '3px', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase' }}>
            About Us
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>A Neighborhood Cinema Since 1987</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '16px' }}>
            Lighthouse Cinema has been a beloved staple of Pacific Grove since July 1987, when brothers John and Sal Enea opened its doors. For nearly four decades it has been more than a movie theater &mdash; a place where first dates happen, friendships grow, and families share the magic of the big screen.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '24px' }}>
            Under new ownership by Dr. Ayman Adeeb and his family, and with the dedication of a hard-working staff, Lighthouse Cinema is shining brighter than ever. Thank you, Pacific Grove, for your continued love and support.
          </p>
          <p style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontStyle: 'italic' }}>
            See you at the theatre.
          </p>
        </div>
      </section>

      {/* VIP SMS CTA */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1505 100%)', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
            Join the <span className="gold-text">VIP List</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Text <strong style={{ color: 'var(--gold)' }}>JOIN</strong> to <strong style={{ color: 'var(--gold)' }}>(831) 747-4470</strong> for showtimes, new events, and <strong>10% off</strong> your next visit. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
          </p>
          <a href="sms:+18317474470?body=JOIN" className="btn btn-gold">Text JOIN &rarr;</a>
        </div>
      </section>

      {/* ANNOUNCEMENTS MARQUEE */}
      <section style={{ background: 'var(--gold)', color: '#0a0a0a', padding: '12px 0', overflow: 'hidden', fontWeight: 600, fontSize: '0.9rem' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          BINGO THURSDAYS 6PM-8:30PM &nbsp;&middot;&nbsp; BAR &amp; GRILL OPEN &nbsp;&middot;&nbsp; MOVIE &amp; A MEAL IS BACK APRIL 5TH &nbsp;&middot;&nbsp; KARAOKE FRIDAYS 6:00PM-12:00AM &nbsp;&middot;&nbsp; SALSA DANCE NIGHT SATURDAYS 8:00PM-12:00AM &nbsp;&middot;&nbsp; MURDER MYSTERY NIGHT &mdash; EASTER WEEKEND PREMIERE
        </div>
      </section>

      {/* NOW PLAYING */}
      <section style={{ padding: '72px 0', background: '#0c0c0c' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>
            What's <span className="gold-text">Playing</span> at Lighthouse Cinema
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Now showing &middot; Coming soon</p>
          <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '28px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-gold">G</span>
              <span className="badge badge-gold">56 MIN</span>
              <span className="badge badge-gold">APR 04, 2026</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Best of Both Worlds: Cohousing's Promise (2011)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Documentary &middot; Lifestyle &middot; Environmental &middot; Social Issues
            </p>
            <a href="#events" className="btn btn-gold btn-sm">Book Now &rarr;</a>
          </div>
        </div>
      </section>

      {/* CURRENT PROMOTIONS */}
      <section style={{ padding: '72px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>
            Current <span className="gold-text">Promotions</span>
          </h2>
          <div className="grid grid-2">
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔪</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Murder Mystery Night &mdash; Easter Weekend Premiere</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Lighthouse Cinema presents "The Director's Cut Killer." Friday, April 3. An interactive whodunit night with dinner, drinks, and clues throughout the theater.
              </p>
              <a href="#events" className="btn btn-gold btn-sm">Get Tickets &rarr;</a>
            </div>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎤</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Monterey Comedy Improv &mdash; April 18, 7:00&ndash;9:00 PM</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Laugh it up at Lighthouse Cinema with Monterey Comedy Improv, happening the first and third Fridays of the month.
              </p>
              <a href="#events" className="btn btn-gold btn-sm">View Event &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: '72px 0', background: '#0c0c0c', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>
            Contact <span className="gold-text">Lighthouse Cinema</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 40px' }}>
            Reach our team directly for movie times, private events, reservations, and VIP assistance.
          </p>
          <div className="grid grid-3" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>⚡ Fast answers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ask about showtimes, seating, special menus, or upcoming events.</p>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📩 Direct contact</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your message goes straight to Lighthouse Cinema, not a third party.</p>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📱 Simple &amp; convenient</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Text us anytime, or call during business hours for immediate help.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="sms:+18317173124" className="btn btn-gold">Text the Cinema</a>
            <a href="tel:+18317173124" className="btn btn-dark">Call the Cinema</a>
          </div>
        </div>
      </section>
    </div>
  );
}
