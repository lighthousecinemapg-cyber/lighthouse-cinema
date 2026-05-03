'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dailyMessages } from './daily-messages';
import { movies, SQUARE_LINKS, getTicketLink, isMovieActive, isComingSoon } from './showtime-config';

/*  style constants  */
const gold = '#D4AF37';
const cream = '#F0E9D7';
  const allVisibleMovies = movies.filter(m => m.active && (isMovieActive(m) || isComingSoon(m)));
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

function ShowtimeRow({ day, times, movie }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px',
      background: 'rgba(212,175,55,0.04)', borderRadius: 8,
      border: '1px solid rgba(212,175,55,0.1)', flexWrap: 'wrap',
    }}>
      <span style={{ color: gold, fontWeight: 700, minWidth: 90, fontSize: '0.95rem' }}>{day}</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
        {times.map(t => (
          movie ? (
            <a key={t} href={getTicketLink(movie, t)} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(212,175,55,0.12)', color: cream,
                padding: '5px 14px', borderRadius: 6, fontSize: '0.9rem',
                fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
                border: '1px solid transparent',
              }}
              title={"Buy ticket for " + t}>
              {t} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>🎟️</span>
            </a>
          ) : (
            <span key={t} style={{
              background: 'rgba(212,175,55,0.12)', color: cream,
              padding: '5px 14px', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600,
            }}>{t}</span>
          )
        ))}
      </div>
    </div>
  );
}

function PayItForwardMini() {
  return (
    <a href={SQUARE_LINKS.payItForward} target="_blank" rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(212,175,55,0.06)', color: gold,
        padding: '8px 16px', borderRadius: 8, fontSize: '0.82rem',
        fontWeight: 600, textDecoration: 'none',
        border: '1px dashed rgba(212,175,55,0.3)', marginTop: 8,
      }}>
      💛 Pay It Forward — Buy a ticket for someone who needs a night out
    </a>
  );
}

export default function HomePage() {
  const [trailerOpen, setTrailerOpen] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupStatus, setSignupStatus] = useState(null);
  const [signupLoading, setSignupLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupStatus(null);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, phone: signupPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setSignupStatus('success');
        setSignupName(''); setSignupEmail(''); setSignupPhone('');
      } else {
        setSignupStatus('error');
      }
    } catch {
      setSignupStatus('error');
    }
    setSignupLoading(false);
  };


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

      {/* ANNOUNCEMENT BANNER */}
      <a href="https://square.link/u/1uppuNv7" target="_blank" rel="noopener noreferrer" style={{
        display: 'block',
        background: 'linear-gradient(90deg, #D4AF37 0%, #c9a42e 50%, #D4AF37 100%)',
        textAlign: 'center',
        padding: '12px 20px',
        textDecoration: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 12px rgba(212,175,55,0.3)',
      }}>
        <span style={{ color: '#0a0a0a', fontWeight: 700, fontSize: '1rem', letterSpacing: 1 }}>
          ✨ Get Your Tickets Now ✨
        </span>
      </a>

      {/*  1. HERO  */}
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
                        Pacific Grove &middot; Since 1987
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
            Movies, karaoke, salsa, comedy, and community nights.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#now-playing" style={goldBtn}>Now Playing</a>
            <Link href="/events" style={darkBtn}>All Events</Link>
            <a href="sms:+18334414049" style={darkBtn}>Message Us</a>
          </div>
        </div>
      </section>

{/* DAILY MESSAGE FROM DR. ADEEB */}
      <section style={{
                padding: '48px 24px',
                background: dark,
                textAlign: 'center',
                borderTop: '1px solid rgba(212,175,55,0.12)',
                borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ color: gold, fontSize: '0.85rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
            A Message from Dr. Adeeb
              </p>
          <p style={{ color: cream, fontSize: '1.15rem', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 20 }}>
            &ldquo;{dailyMessages[(new Date().getDate() - 1) % dailyMessages.length]}&rdquo;
</p>
          <p style={{ color: 'rgba(212,175,55,0.7)', fontSize: '0.85rem' }}>
            &mdash; Dr. Ayman Adeeb, Owner
  </p>
  </div>
  </section>


      {/* MOVIE POSTER CAROUSEL - Cinemark Style */}
      <section style={{ padding: '40px 0 20px', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 24, textAlign: 'center' }}>
            <span style={{ color: gold }}>Now Showing</span> at Lighthouse
          </h2>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {allVisibleMovies.map(movie => (
              <div key={movie.slug} onClick={() => { const el = document.getElementById(movie.slug === 'devil-wears-prada-2' ? 'now-playing' : movie.slug === 'cheap-detective' ? 'coming-soon' : movie.slug); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ minWidth: 200, maxWidth: 200, scrollSnapAlign: 'start', cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', background: '#111', transition: 'transform 0.2s, box-shadow 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'relative', height: 280 }}>
                  <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {movie.trailerId && (
                    <button onClick={(e) => { e.stopPropagation(); setTrailerOpen(movie.trailerId); }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: '2px solid white', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#9654;</button>
                  )}
                  {isComingSoon(movie) && (
                    <span style={{ position: 'absolute', top: 8, left: 8, background: gold, color: '#000', padding: '3px 10px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1 }}>COMING SOON</span>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: cream, marginBottom: 4 }}>{movie.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(240,233,215,0.5)' }}>{movie.rating} {movie.genre && '\u00B7 ' + movie.genre}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY SCHEDULE - What's Playing Today */}
      <section id="daily-schedule" style={{
        padding: '48px 0 56px', background: dark,
        borderTop: '1px solid rgba(212,175,55,0.12)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", color: cream, marginBottom: 8 }}>
            What&apos;s <span style={{ color: gold }}>Playing</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'rgba(240,233,215,0.5)', fontSize: '0.9rem', marginBottom: 32 }}>
            Tap any showtime to buy tickets instantly
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, textAlign: 'center' }}>
            {['Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
              const dayNum = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(day === 'Wed' ? 'Wed' : day === 'Thu' ? 'Thu' : day === 'Fri' ? 'Fri' : day === 'Sat' ? 'Sat' : 'Sun');
              const isToday = new Date().getDay() === dayNum;
              return (
                <div key={day} style={{
                  padding: '16px 8px', borderRadius: 12,
                  background: isToday ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.04)',
                  border: isToday ? '2px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.1)',
                }}>
                  <div style={{ color: isToday ? gold : 'rgba(240,233,215,0.6)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, letterSpacing: 1 }}>
                    {day.toUpperCase()} {isToday && '\u2022 TODAY'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: cream, lineHeight: 2 }}>
                    <div style={{ color: gold, fontWeight: 600, marginBottom: 2 }}>Devil Wears Prada 2</div>
                    {day === 'Wed' ? null : day === 'Thu' ? <div>4 PM · 7 PM</div> : <div>12 · 2:30 · 5 · 7:30</div>}
                    {day === 'Wed' ? <div style={{ color: 'rgba(240,233,215,0.4)', fontStyle: 'italic' }}>Not showing</div> : null}
                    <div style={{ color: gold, fontWeight: 600, marginTop: 6, marginBottom: 2 }}>Project Hail Mary</div>
                    <div>1 PM · 4 PM · 7 PM</div>
                    <div style={{ color: gold, fontWeight: 600, marginTop: 6, marginBottom: 2 }}>Zorba the Greek</div>
                    <div>4 PM</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMING SOON ÃÂ¢ÃÂÃÂ The Devil Wears Prada 2 */}
      <section id="now-playing" style={{
        padding: '80px 0 88px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0a05 50%, #0a0a0a 100%)',
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div className="container">
          <div style={{ fontSize: '0.75rem', letterSpacing: 4, color: gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>
            Now Playing
          </div>
          <h2 style={{ fontSize: '2.4rem', textAlign: 'center', marginBottom: 48, fontFamily: "'Playfair Display', serif", color: cream }}>
            The Devil Wears Prada 2
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 380px) 1fr',
            gap: 48,
            maxWidth: 1020,
            margin: '0 auto',
            alignItems: 'start',
          }}>
            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid rgba(212,175,55,0.2)',
              background: '#111',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
              position: 'relative',
            }}>
              <img
                src="https://image.tmdb.org/t/p/w500/p35IoKfBtJDNiWJMO8ZEtIMZSfW.jpg"
                alt="The Devil Wears Prada 2 Movie Poster"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                loading="lazy"
              />
              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'rgba(212,175,55,0.95)',
                color: '#0a0a0a',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                APR 30
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span style={badgeStyle}>PG-13</span>
                <span style={badgeStyle}>Comedy</span>
                <span style={badgeStyle}>Drama</span>
                <span style={badgeStyle}>Sequel</span>
              </div>
              <p style={{
                color: 'rgba(240,233,215,0.72)',
                fontSize: '1.05rem',
                lineHeight: 1.75,
                marginBottom: 24,
              }}>
                Meryl Streep, Anne Hathaway, Emily Blunt, and Stanley Tucci return to the fashionable streets of New York City and the sleek offices of Runway Magazine. When Miranda Priestly faces a declining print empire, she recruits a now-seasoned Andy Sachs to help save everything she built.
              </p>
              <div style={{
                background: 'rgba(212,175,55,0.07)',
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 32,
                border: '1px solid rgba(212,175,55,0.12)',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ color: gold, fontWeight: 700, fontSize: '1.05rem' }}>
                  Now Playing
                </span>
                <span style={{ color: 'rgba(240,233,215,0.55)', fontSize: '0.85rem' }}>
                  Now Playing
                </span>
              </div>
              <div style={{
                background: 'rgba(212,175,55,0.05)',
                borderRadius: 12,
                padding: '18px 22px',
                marginBottom: 28,
                border: '1px solid rgba(212,175,55,0.10)',
              }}>
                <h4 style={{ color: gold, fontSize: '1rem', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>Showtimes</h4>
                <ShowtimeRow day="Thursday" times={['4:00 PM', '7:00 PM']}  movie={movies[2]}/>
                <ShowtimeRow day="Friday" times={['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM']}  movie={movies[2]}/>
                <ShowtimeRow day="Saturday" times={['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM']}  movie={movies[2]}/>
                <ShowtimeRow day="Sunday" times={['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM']}  movie={movies[2]}/>
                            <PayItForwardMini />

<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="https://square.link/u/pfGKjKqr" target="_blank" rel="noopener noreferrer" style={goldBtn}>
                  Book Tickets
                </a>
                <button onClick={() => setTrailerOpen('R57Y4v5OmzM')} style={darkBtn}>
                  Watch Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/*  2. NOW PLAYING  Project Hail Mary  */}
      <section id="project-hail-mary" style={{
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
                Showtimes — Now through May 8
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                              <ShowtimeRow day="Wednesday" times={['1:00 PM', '4:00 PM', '7:00 PM']}  movie={movies[0]}/>
                              <ShowtimeRow day="Thursday" times={['1:00 PM', '4:00 PM', '7:00 PM']}  movie={movies[0]}/>
                              <ShowtimeRow day="Friday" times={['1:00 PM', '4:00 PM', '7:00 PM']}  movie={movies[0]}/>
                              <ShowtimeRow day="Saturday" times={['1:00 PM', '4:00 PM', '7:00 PM']}  movie={movies[0]}/>
                              <ShowtimeRow day="Sunday" times={['1:00 PM', '4:00 PM', '7:00 PM']}  movie={movies[0]}/>
                                <p style={{ color: 'rgba(240,233,215,0.5)', fontSize: '0.78rem', marginTop: 14, lineHeight: 1.9 }}>
                                  <span style={{ color: gold }}>Playing through May 8</span> · Thu–Sun · Wed 12-7 PM · Thu 12-10 PM · Fri-Sat 12 PM-12 AM · Sun 11 AM-7 PM
                  </p>
              </div>

                            <PayItForwardMini />

<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setTrailerOpen('m08TxIsFTRI')} style={goldBtn}>
                   Watch Trailer
                </button>
                <Link href="/events" style={darkBtn}>
                   Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── GREASE ── */}
      <section id="grease" style={{
        padding: '80px 0 88px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0a05 50%, #0a0a0a 100%)',
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div className="section-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', color: gold, letterSpacing: 6, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>NOW PLAYING</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "'Playfair Display', serif", color: cream, marginBottom: 40, fontStyle: 'italic' }}>Grease</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1fr', gap: 48, alignItems: 'start' }}>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <img src="https://img.youtube.com/vi/THd96gHV7Tg/maxresdefault.jpg" alt="Grease" style={{ width: '100%', display: 'block' }} />
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <span style={badgeStyle}>PG</span>
                <span style={badgeStyle}>Musical</span>
                <span style={badgeStyle}>Romance</span>
                <span style={badgeStyle}>1978</span>
              </div>
              <p style={{ color: cream, lineHeight: 1.7, fontSize: '1.05rem', marginBottom: 28, opacity: 0.92 }}>
                The 1978 classic! Sandy and Danny navigate the social pressures of Rydell High in this iconic musical featuring unforgettable songs and electrifying performances from John Travolta and Olivia Newton-John.
              </p>

              <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                <h3 style={{ color: gold, fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", marginBottom: 16, fontStyle: 'italic' }}>Showtimes</h3>
                <ShowtimeRow day="Friday" times={['7:00 PM']}  movie={movies.find(m => m.slug === 'grease')} />
                <ShowtimeRow day="Saturday" times={['7:00 PM']}  movie={movies.find(m => m.slug === 'grease')} />
              </div>

              <div style={{ marginTop: 20 }}>
                <p style={{ color: gold, fontSize: '0.9rem', opacity: 0.8 }}>Playing May 8 & 9 only</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
            <button onClick={() => setTrailerOpen('THd96gHV7Tg')} style={{ padding: '14px 32px', background: 'transparent', border: `1px solid ${gold}`, color: gold, borderRadius: 8, cursor: 'pointer', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>Watch Trailer</button>
            <Link href="https://square.link/u/ovzTqZKH" style={{ padding: '14px 32px', background: gold, color: '#0a0a0a', borderRadius: 8, textDecoration: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>Book Now</Link>
          </div>
        </div>
      </section>

      {/* ── THE SHEEP DETECTIVES ── */}
      <section id="sheep-detectives" style={{
        padding: '80px 0 88px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0a05 50%, #0a0a0a 100%)',
        borderTop: '1px solid rgba(212,175,55,0.12)',
      }}>
        <div className="section-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ textAlign: 'center', color: gold, letterSpacing: 6, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>COMING SOON</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "'Playfair Display', serif", color: cream, marginBottom: 40, fontStyle: 'italic' }}>The Sheep Detectives</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1fr', gap: 48, alignItems: 'start' }}>
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ position: 'absolute', top: 16, left: 16, background: gold, color: '#0a0a0a', padding: '4px 14px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', zIndex: 2 }}>MAY 8</div>
              <img src="https://img.youtube.com/vi/pyZI5oM6hWk/maxresdefault.jpg" alt="The Sheep Detectives" style={{ width: '100%', display: 'block' }} />
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <span style={badgeStyle}>PG</span>
                <span style={badgeStyle}>Comedy</span>
                <span style={badgeStyle}>Animation</span>
              </div>
              <p style={{ color: cream, lineHeight: 1.7, fontSize: '1.05rem', marginBottom: 28, opacity: 0.92 }}>
                When a mysterious crime wave hits the barnyard, an unlikely team of woolly investigators must crack the case. Featuring the voice of Hugh Jackman. 94% on Rotten Tomatoes.
              </p>

              <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ color: gold, fontSize: '1.1rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>Opens May 8</p>
                <p style={{ color: cream, opacity: 0.7, marginTop: 8 }}>Starting Thursday, May 8</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
            <button onClick={() => setTrailerOpen('pyZI5oM6hWk')} style={{ padding: '14px 32px', background: 'transparent', border: `1px solid ${gold}`, color: gold, borderRadius: 8, cursor: 'pointer', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>Watch Trailer</button>
            <Link href="https://square.link/u/pfGKjKqr" style={{ padding: '14px 32px', background: gold, color: '#0a0a0a', borderRadius: 8, textDecoration: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>Book Tickets</Link>
          </div>
        </div>
      </section>

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
            flex: '1 1 280px',
            maxWidth: 320,
            background: '#111',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 16,
            padding: '36px 28px',
            textAlign: 'center',
          }}>
            <h3 style={{ color: gold, fontSize: '1.3rem', marginBottom: 4 }}>New Release Ticket</h3>
            <p style={{ color: 'rgba(245,233,200,0.6)', fontSize: '0.85rem', marginBottom: 16 }}>Premium & new release films</p>
            <p style={{ fontSize: '2.4rem', fontWeight: 800, color: cream, marginBottom: 4 }}>$15</p>
            <p style={{ color: 'rgba(245,233,200,0.5)', fontSize: '0.75rem', marginBottom: 24 }}>+ tax at checkout</p>
            <a href="https://square.link/u/pfGKjKqr" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-block',
              background: 'transparent',
              color: gold,
              border: '2px solid #d4af37',
              padding: '12px 36px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
            }}>Buy Now</a>
          </div>
        </div>
      </section>

      {/*  3. DOCUMENTARY  Zorba the Greek  */}
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

                            <PayItForwardMini />

<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setTrailerOpen('xrArjp14SeU')} style={goldBtn}>
                   Watch Trailer
                </button>
                <Link href="/events" style={darkBtn}>
                   Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  4. THIS WEEK  */}
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
              { day: 'FRIDAY', emoji: '', name: 'Karaoke', time: '7:30 PM' },
              { day: 'SATURDAY', emoji: '', name: 'Salsa Night', time: '8 PM' },
              { day: 'SUNDAY', emoji: '', name: 'Brunch + Movie', time: '11 AM' },
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

      {/*  5. ALL EVENTS  */}
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
                        {event.category === 'weekly' ? '' : event.category === 'screening' ? '' : ''}
                      </span>
                      <span className="badge badge-gold" style={{ position: 'absolute', top: 12, right: 12 }}>{event.category}</span>
                    </div>
                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>{event.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16, flex: 1 }}>{event.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: gold, fontWeight: 600 }}>{formatDate(event.date)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(event.time)} ÃÂÃÂ· {event.venue}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: gold, fontFamily: "'Playfair Display', serif" }}>${event.ticketPrice}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per ticket</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 0', borderTop: '1px solid var(--dark-border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selling Fast</span>
                        <span className="btn btn-gold btn-sm" style={{ pointerEvents: 'none' }}>Book Now </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/*  6. COMMUNITY NIGHTS  */}
      <section style={{ padding: '72px 0', background: '#0f0f0f', borderTop: '1px solid rgba(212,175,55,0.10)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 3, color: gold, marginBottom: 12, textTransform: 'uppercase' }}>Free & For Everyone</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 14, fontFamily: "'Playfair Display', serif" }}>Community Nights</h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', maxWidth: 640, margin: '0 auto 40px' }}>
            Drop-in gatherings in the lobby lounge. Grab a drink, meet neighbors, no cover charge.
          </p>
          <div className="grid grid-3" style={{ textAlign: 'left' }}>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Drink & Draw</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Artists of every skill level welcome. Bring a sketchbook, order a drink, make something new. Free, weekly.</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Tabletop Night</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Drop-in tabletop and board games hosted in the lounge. All you need is your imagination. Free, weekly.</p>
            </div>
            <div className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Karma Screenings</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pay what you want. 20% of proceeds go to a local non-profit partner each month. Good films, good cause.</p>
            </div>
          </div>

                  <div className="card" style={{ padding: 28 }}>
                          <div style={{ fontSize: '2rem', marginBottom: 12 }}>&#x1F3CD;&#xFE0F;</div>
                          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>Motorcycle Movie of the Month</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>Presented by <span style={{ color: gold }}>Big Sur Motorcycle Adventure Tours</span></p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 12 }}>Free private screening every month. Doors open at 11:00 AM, showtime at 11:30 AM.</p>
                          <div style={{ fontSize: '0.8rem', color: gold, lineHeight: 1.8 }}>May 17 &middot; Jun 7 &middot; Jul 12 &middot; Aug 2 &middot; Sep 6 &middot; Oct 18 &middot; Nov 8</div>
              </div>
        </div>
      </section>

      {/*  7. ABOUT  */}
      <section style={{ padding: '80px 0', background: dark }}>
        <div className="container" style={{ maxWidth: 820, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: 3, color: gold, marginBottom: 12, textTransform: 'uppercase' }}>About Us</div>
          <h2 style={{ fontSize: '2rem', marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>A Neighborhood Cinema Since 1987</h2>
          <p style={{ color: 'rgba(240,233,215,0.65)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: 16 }}>
            Lighthouse Cinema has been a beloved staple of Pacific Grove since July 1987,
            when brothers John and Sal Enea opened its doors. For nearly four decades it has
            been more than a movie theater  a place where first dates happen, friendships
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

      {/*  8. VIP  */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1505 100%)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680 }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
            Join the <span style={{ color: gold }}>VIP List</span>
          </h2>
          <p style={{ color: 'rgba(240,233,215,0.55)', marginBottom: 24 }}>
            Text <strong style={{ color: gold }}>JOIN</strong> to <strong style={{ color: gold }}>(831) 747-4470</strong> for showtimes, new events, and <strong>10% off</strong> your next visit.
          </p>
          <a href="sms:+18317474470?body=JOIN" style={goldBtn}>Text JOIN </a>
        </div>
      </section>

      {/*  9. MARQUEE  */}
      <section style={{ background: gold, color: dark, padding: '12px 0', overflow: 'hidden', fontWeight: 600, fontSize: '0.9rem' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          PROJECT HAIL MARY  NOW PLAYING &nbsp;ÃÂÃÂ·&nbsp;
          KARAOKE FRIDAYS 7:30PM &nbsp;ÃÂÃÂ·&nbsp;
          SALSA SATURDAYS 8PM &nbsp;ÃÂÃÂ·&nbsp;
          BAR & GRILL OPEN
        </div>
      </section>

      {/*  10. CONTACT  */}
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
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}> Fast answers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ask about showtimes, seating, special menus, or upcoming events.</p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}> Direct contact</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Your message goes straight to Lighthouse Cinema, not a third party.</p>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}> Simple & convenient</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Text us anytime, or call during business hours for immediate help.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="sms:+18334414049" style={goldBtn}>Text the Cinema</a>
            <a href="tel:+18317173124" style={darkBtn}>Call the Cinema (831) 717-3124</a>
            <a href="tel:+18317173124" style={{...darkBtn, border: '1px solid #D4AF37', color: '#D4AF37'}}>Call Manager Direct</a>
          </div>
        </div>
      </section>

      {/* JOIN THE LIGHTHOUSE FAMILY */}
      <section style={{padding: "80px 20px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", textAlign: "center"}}>
        <div style={{maxWidth: 600, margin: "0 auto"}}>
          <h2 style={{fontFamily: "Playfair Display, serif", fontSize: "2.2rem", color: "#D4AF37", marginBottom: 10}}>Join the Lighthouse Family</h2>
          <p style={{color: "#ccc", fontSize: "1.1rem", marginBottom: 30}}>Get event updates, exclusive offers, and community news delivered to your inbox.</p>
          {signupStatus === "success" ? (
            <div style={{background: "rgba(212,175,55,0.15)", border: "1px solid #D4AF37", borderRadius: 12, padding: "30px 20px"}}>
              <p style={{color: "#D4AF37", fontSize: "1.4rem", fontFamily: "Playfair Display, serif", margin: 0}}>You&apos;re in. Welcome to the family.</p>
            </div>
          ) : (
            <form onSubmit={handleSignup} style={{display: "flex", flexDirection: "column", gap: 14}}>
              <input type="text" placeholder="Your Name" required value={signupName} onChange={e => setSignupName(e.target.value)} style={{padding: "14px 18px", borderRadius: 8, border: "1px solid #333", background: "#0a0a1a", color: "#fff", fontSize: "1rem"}} />
              <input type="email" placeholder="Email Address" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} style={{padding: "14px 18px", borderRadius: 8, border: "1px solid #333", background: "#0a0a1a", color: "#fff", fontSize: "1rem"}} />
              <input type="tel" placeholder="Phone (optional)" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} style={{padding: "14px 18px", borderRadius: 8, border: "1px solid #333", background: "#0a0a1a", color: "#fff", fontSize: "1rem"}} />
              <button type="submit" disabled={signupLoading} style={{padding: "16px", borderRadius: 8, border: "none", background: "#D4AF37", color: "#1a1a2e", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", marginTop: 6}}>{signupLoading ? "Joining..." : "Join the Lighthouse Family"}</button>
              {signupStatus === "error" && <p style={{color: "#ff6b6b", margin: 0}}>Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>
      </section>

      {/*  RESPONSIVE  */}
      <style>{`h
        @media (max-width: 768px) {
          #now-playing > div > div:nth-child(2) { grid-template-columns: 1fr !important; }\n          #coming-soon > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
          #documentaries > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
