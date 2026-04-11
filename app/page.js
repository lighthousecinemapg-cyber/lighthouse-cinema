'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

/* ââââââ style constants ââââââ */
const gold = '#D4AF37';
const cream = '#F0E9D7';
const dark = '#0a0a0a';

const badgeStyle = {
  background: 'rgba(212,175,55,0.12)',
  color: gold,
  padding: '4px 12px',
  borderRadius: 999,
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: 1,
  border: '1px solid rgba(212,175,55,0.25)',
};

const goldBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: gold,
  color: dark,
  padding: '13px 28px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: '0.95rem',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

const darkBtn = {
  ...goldBtn,
  background: 'rgba(212,175,55,0.08)',
  color: cream,
  border: '1.5px solid rgba(212,175,55,0.35)',
};

function ShowtimeRow({ day, times }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '10px 16px',
      background: 'rgba(212,175,55,0.04)',
      borderRadius: 8,
      border: '1px solid rgba(212,175,55,0.1)',
    }}>
      <span style={{ color: gold, fontWeight: 700, minWidth: 90, fontSize: '0.95rem' }}>
        {day}
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {times.map(t => (
          <span key={t} style={{
            background: 'rgba(212,175,55,0.12)', color: cream,
            padding: '5px 14px', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [trailerOpen, setTrailerOpen] = useState(null);
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

      {/* TRAILER MODAL */}
      {trailerOpen && (
        <div
          onClick={() => setTrailerOpen(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 920, aspectRatio: '16/9',
              borderRadius: 12, overflow: 'hidden',
              border: '2px solid rgba(212,175,55,0.4)',
              position: 'relative', background: '#000',
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailerOpen}?rel=0`}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
          <button
            onClick={() => setTrailerOpen(null)}
            style={{
              position: 'fixed', top: 24, right: 32,
              background: 'none', border: 'none', color: gold,
              fontSize: 32, cursor: 'pointer', zIndex: 10000,
            }}
            aria-label="Close trailer"
          >&times;</button>
        </div>
      )}

      {/* ââââââ 1. HERO ââââââ */}
      <section style={{
        position: 'relative', minHeight: '75vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dark, overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(212,175,55,0.10) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% -10%, rgba(212,175,55,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 20px 80px' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 5, color: gold, marginBottom: 20, textTransform: 'uppercase' }}>
            Pacific Grove Â· Since 1987
          </div>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
            fontFamily: "'Playfair Display', serif",
            color: cream, lineHeight: 1.08, marginBottom: 22, fontWeight: 700,
          }}>
            The <span style={{ color: gold }}>Crown Jewel</span> of the Peninsula
          </h1>
          <p style={{
            color: 'rgba(240,233,215,0.65)', fontSize: '1.15rem',
            maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.65,
          }}>
            Movies, bingo, karaoke, salsa, comedy, and community nights.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#now-playing" style={goldBtn}>Now Playing</a>
            <Link href="/events" style={darkBtn}>All Events</Link>
            <a href="sms:+18317173124" style={darkBtn}>Message Us</a>
          </div>
        </div>
      </section>

      {/* ââââââ 2. NOW PLAYING â Project Hail Mary ââââââ */}
      <section id="now-playing" style={{
        padding: '80px 0 88px', background: dark,
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div className="container">
          <div style={{ fontSize: '0.75rem', letterSpacing: 4, color: gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>
            Now Playing
          </div>
          <h2 style={{ fontSize: '2.4rem', textAlign: 'center', marginBottom: 48, fontFamily: "'Playfair Display', serif", color: cream }}>
            Project Hail Mary
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(240px, 380px) 1fr',
            gap: 48, maxWidth: 1020, margin: '0 auto', alignItems: 'start',
          }}>
            <div style={{
              borderRadius: 14, overflow: 'hidden',
              border: '2px solid rgba(212,175,55,0.2)',
              background: '#111', boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            }}>
              <img
                src="https://img.youtube.com/vi/m08TxIsFTRI/maxresdefault.jpg"
                alt="Project Hail Mary"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                loading="lazy"
              />
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={badgeStyle}>PG-13</span>
                <span style={badgeStyle}>2h 19m</span>
                <span style={badgeStyle}>Sci-Fi</span>
                <span style={badgeStyle}>94% Rotten Tomatoes</span>
              </div>

              <p style={{ color: 'rgba(240,233,215,0.72)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 32 }}>
                Ryan Gosling stars as a science teacher who wakes up alone on a spaceship
                light-years from Earth with no memory of how he got there. As his memory
                returns, he uncovers a mission to save humanity from extinction. Based on
                Andy Weir's bestselling novel. Directed by Phil Lord & Christopher Miller.
              </p>

              <h3 style={{ color: gold, fontSize: '0.85rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14, fontWeight: 700 }}>
                Showtimes This Week
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                <ShowtimeRow day="Friday" times={['1:00 PM', '4:00 PM']} />
                <ShowtimeRow day="Saturday" times={['1:00 PM', '4:00 PM', '7:00 PM']} />
                <ShowtimeRow day="Sunday" times={['1:00 PM', '4:00 PM']} />
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setTrailerOpen('m08TxIsFTRI')} style={goldBtn}>
                  ð¥ Watch Trailer
                </button>
                <Link href="/events" style={darkBtn}>
                  ð Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUY MOVIE TICKETS */}
      <section id="buy-tickets" style={{
        padding: '80px 20px', background: '#0a0a0a', textAlign: 'center',
      }}>
        <p style={{ color: gold, letterSpacing: 3, fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>TICKETS</p>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12, color: cream }}>
          Buy <span style={{ color: gold }}>Movie Tickets</span>
        </h2>
        <p style={{ color: 'rgba(245,233,200,0.7)', maxWidth: 500, margin: '0 auto 40px', fontSize: '1.05rem' }}>
          Skip the line. Grab your seats now and enjoy the show.
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 700, margin: '0 auto',
        }}>
          <div style={{
            flex: '1 1 280px', maxWidth: 320, background: '#111', border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 16, padding: '36px 28px', textAlign: 'center',
          }}>
            <h3 style={{ color: gold, fontSize: '1.3rem', marginBottom: 4 }}>Standard Ticket</h3>
            <p style={{ color: 'rgba(245,233,200,0.6)', fontSize: '0.85rem', marginBottom: 16 }}>Any regular showing</p>
            <p style={{ fontSize: '2.4rem', fontWeight: 800, color: cream, marginBottom: 4 }}>$12</p>
            <p style={{ color: 'rgba(245,233,200,0.5)', fontSize: '0.75rem', marginBottom: 24 }}>+ tax at checkout</p>
            <a href="https://square.link/u/STANDARD_TICKET" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', background: gold, color: '#0a0a0a', padding: '14px 36px',
              borderRadius: 999, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            }}>Buy Now</a>
          </div>
          <div style={{
            flex: '1 1 280px', maxWidth: 320, background: '#111', border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 16, padding: '36px 28px', textAlign: 'center',
          }}>
            <h3 style={{ color: gold, fontSize: '1.3rem', marginBottom: 4 }}>Matinee Ticket</h3>
            <p style={{ color: 'rgba(245,233,200,0.6)', fontSize: '0.85rem', marginBottom: 16 }}>Showings before 5 PM</p>
            <p style={{ fontSize: '2.4rem', fontWeight: 800, color: cream, marginBottom: 4 }}>$10</p>
            <p style={{ color: 'rgba(245,233,200,0.5)', fontSize: '0.75rem', marginBottom: 24 }}>+ tax at checkout</p>
            <a href="https://square.link/u/MATINEE_TICKET" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block', background: 'transparent', color: gold, border: '2px solid #d4af37',
              padding: '12px 36px', borderRadius: 999, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            }}>Buy Now</a>
          </div>
        </div>
      </section>

      {/* ââââââ 3. DOCUMENTARY â Zorba the Greek ââââââ */}
      <section id="documentaries" style={{
        padding: '80px 0 88px', background: '#0c0c0c',
        borderTop: '1px solid rgba(212,175,55,0.10)',
      }}>
        <div className="container">
          <div style={{ fontSize: '0.75rem', letterSpacing: 4, color: gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>
            Documentary Feature
          </div>
          <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: 48, fontFamily: "'Playfair Display', serif", color: cream }}>
            Zorba the Greek
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(200px, 320px) 1fr',
            gap: 40, maxWidth: 920, margin: '0 auto', alignItems: 'start',
          }}>
            <div style={{
              borderRadius: 14, overflow: 'hidden',
              border: '2px solid rgba(212,175,55,0.18)',
              background: '#111', boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
            }}>
              <img
                src="https://img.youtube.com/vi/xrArjp14SeU/maxresdefault.jpg"
                alt="Zorba the Greek"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                loading="lazy"
              />
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={badgeStyle}>Classic</span>
                <span style={badgeStyle}>1964</span>
                <span style={badgeStyle}>Drama</span>
                <span style={badgeStyle}>Anthony Quinn</span>
              </div>

              <p style={{ color: 'rgba(240,233,215,0.72)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 24 }}>
                Anthony Quinn delivers an unforgettable performance as the exuberant
                Alexis Zorba, who teaches a reserved English writer how to embrace life
                on the island of Crete. Winner of three Academy Awards.
              </p>

              <div style={{
                background: 'rgba(212,175,55,0.07)', borderRadius: 10,
                padding: '16px 20px', marginBottom: 32,
                border: '1px solid rgba(212,175,55,0.12)',
                display: 'inline-flex', flexDirection: 'column', gap: 4,
              }}>
                <span style={{ color: gold, fontWeight: 700, fontSize: '1.05rem' }}>
                  Daily at 4:00 PM
                </span>
                <span style={{ color: 'rgba(240,233,215,0.55)', fontSize: '0.85rem' }}>
                  Main Auditorium
                </span>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setTrailerOpen('xrArjp14SeU')} style={goldBtn}>
                  ð¥ Watch Trailer
                </button>
                <Link href="/events" style={darkBtn}>
                  ð Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ââââââ 4. THIS WEEK ââââââ */}
      <section style={{ padding: '72px 0', background: dark, borderTop: '1px solid rgba(212,175,55,0.10)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: 8, textAlign: 'center', fontFamily: "'Playfair Display', serif" }}>
            This <span style={{ color: gold }}>Week</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(240,233,215,0.55)', marginBottom: 40 }}>
            Something happening every night
          </p>
          <div className="grid grid-4" style={{ gap: 14 }}>
            {[
              { day: 'THURSDAY', emoji: 'ð²', name: 'Bingo Night', time: '7 PM' },
              { day: 'FRIDAY', emoji: 'ð¤', name: 'Karaoke', time: '7:30 PM' },
              { day: 'SATURDAY', emoji: 'ð', name: 'Salsa Night', time: '8 PM' },
              { day: 'SUNDAY', emoji: 'ð³', name: 'Brunch + Movie', time: '11 AM' },
            ].map(item => (
              <div key={item.day} style={{
                textAlign: 'center', padding: '24px 14px',
                background: 'rgba(212,175,55,0.04)', borderRadius: 12,
                border: '1px solid rgba(212,175,55,0.10)',
              }}>
                <div style={{ fontSize: '0.7rem', color: gold, letterSpacing: 2, marginBottom: 8 }}>{item.day}</div>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, color: cream, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(240,233,215,0.5)' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ââââââ 5. ALL EVENTS ââââââ */}
      <section id="events" style={{ padding: '72px 0 32px', textAlign: 'center', background: '#0c0c0c', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
            <span style={{ color: gold }}>Upcoming</span> Events
          </h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', maxWidth: 600, margin: '0 auto 32px' }}>
            Reserve your seat at Pacific Grove's most exciting venue.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={filter === cat ? 'btn btn-gold btn-sm' : 'btn btn-dark btn-sm'}>
                {cat === 'all' ? 'All Events' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 32, background: '#0c0c0c' }}>
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div className="spinner" style={{ width: 40, height: 40 }}></div>
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
                      height: 180, background: 'linear-gradient(135deg, var(--dark-elevated), var(--dark-card))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderBottom: '1px solid var(--dark-border)', position: 'relative',
                    }}>
                      <span style={{ fontSize: '3rem' }}>
                        {event.category === 'weekly' ? 'ð­' : event.category === 'screening' ? 'ð¬' : 'â¨'}
                      </span>
                      <span className="badge badge-gold" style={{ position: 'absolute', top: 12, right: 12 }}>{event.category}</span>
                    </div>
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{event.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, flex: 1 }}>{event.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: gold, fontWeight: 600 }}>{formatDate(event.date)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(event.time)} Â· {event.venue}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: gold, fontFamily: "'Playfair Display', serif" }}>${event.ticketPrice}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per ticket</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', borderTop: '1px solid var(--dark-border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Fast</span>
                        <span className="btn btn-gold btn-sm" style={{ pointerEvents: 'none' }}>Book Now â</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ââââââ 6. COMMUNITY NIGHTS ââââââ */}
      <section style={{ padding: '72px 0', background: '#0f0f0f', borderTop: '1px solid rgba(212,175,55,0.10)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 3, color: gold, marginBottom: 12, textTransform: 'uppercase' }}>Free & For Everyone</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 14, fontFamily: "'Playfair Display', serif" }}>Community Nights</h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', maxWidth: 640, margin: '0 auto 40px' }}>
            Drop-in gatherings in the lobby lounge. Grab a drink, meet neighbors, no cover charge.
          </p>
          <div className="grid grid-3" style={{ textAlign: 'left' }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>ð¨</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Drink & Draw</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Artists of every skill level welcome. Bring a sketchbook, order a drink, make something new. Free, weekly.</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>ð²</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Tabletop Night</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Drop-in tabletop and board games hosted in the lounge. All you need is your imagination. Free, weekly.</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>ð</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Karma Screenings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pay what you want. 20% of proceeds go to a local non-profit partner each month. Good films, good cause.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ââââââ 7. ABOUT ââââââ */}
      <section style={{ padding: '80px 0', background: dark }}>
        <div className="container" style={{ maxWidth: 820, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 3, color: gold, marginBottom: 12, textTransform: 'uppercase' }}>About Us</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>A Neighborhood Cinema Since 1987</h2>
          <p style={{ color: 'rgba(240,233,215,0.65)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 16 }}>
            Lighthouse Cinema has been a beloved staple of Pacific Grove since July 1987,
            when brothers John and Sal Enea opened its doors. For nearly four decades it has
            been more than a movie theater â a place where first dates happen, friendships
            grow, and families share the magic of the big screen.
          </p>
          <p style={{ color: 'rgba(240,233,215,0.65)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 24 }}>
            Under new ownership by Dr. Ayman Adeeb and his family, and with the dedication
            of a hard-working staff, Lighthouse Cinema is shining brighter than ever. Thank
            you, Pacific Grove, for your continued love and support.
          </p>
          <p style={{ color: gold, fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontStyle: 'italic' }}>
            See you at the theatre.
          </p>
        </div>
      </section>

      {/* ââââââ 8. VIP ââââââ */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1505 100%)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
            Join the <span style={{ color: gold }}>VIP List</span>
          </h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', marginBottom: 24 }}>
            Text <strong style={{ color: gold }}>JOIN</strong> to <strong style={{ color: gold }}>(831) 747-4470</strong> for showtimes, new events, and <strong>10% off</strong> your next visit.
          </p>
          <a href="sms:+18317474470?body=JOIN" style={goldBtn}>Text JOIN â</a>
        </div>
      </section>

      {/* ââââââ 9. MARQUEE ââââââ */}
      <section style={{ background: gold, color: dark, padding: '12px 0', overflow: 'hidden', fontWeight: 600, fontSize: '0.9rem' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          PROJECT HAIL MARY â NOW PLAYING &nbsp;Â·&nbsp;
          ZORBA THE GREEK DAILY 4PM &nbsp;Â·&nbsp;
          BINGO THURSDAYS 7PM &nbsp;Â·&nbsp;
          KARAOKE FRIDAYS 7:30PM &nbsp;Â·&nbsp;
          SALSA SATURDAYS 8PM &nbsp;Â·&nbsp;
          BAR & GRILL OPEN
        </div>
      </section>

      {/* ââââââ 10. CONTACT ââââââ */}
      <section style={{ padding: '72px 0', background: '#0c0c0c', borderTop: '1px solid rgba(212,175,55,0.10)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
            Contact <span style={{ color: gold }}>Lighthouse Cinema</span>
          </h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', maxWidth: 640, margin: '0 auto 40px' }}>
            Reach our team directly for movie times, private events, reservations, and VIP assistance.
          </p>
          <div className="grid grid-3" style={{ textAlign: 'left', marginBottom: 32 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>â¡ Fast answers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ask about showtimes, seating, special menus, or upcoming events.</p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>ð§ Direct contact</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your message goes straight to Lighthouse Cinema, not a third party.</p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>ð± Simple & convenient</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Text us anytime, or call during business hours for immediate help.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="sms:+18317173124" style={goldBtn}>Text the Cinema</a>
            <a href="tel:+18317173124" style={darkBtn}>Call the Cinema</a>
          </div>
        </div>
      </section>

      {/* ââââââ RESPONSIVE ââââââ */}
      <style>{`h
        @media (max-width: 768px) {
          #now-playing > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
          #documentaries > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
