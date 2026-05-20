'use client';
// Cinemark-style redesign
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { movies, SQUARE_LINKS, getTicketLink, isMovieActive, isComingSoon } from './showtime-config';

const GIFT_CARD_LINK = 'https://square.link/u/PicBQip5';

/* style constants */
const red = '#CF2027';
const redDark = '#A31920';
const white = '#FFFFFF';
const lightBg = '#F8F8F8';
const dark = '#333333';
const allVisibleMovies = movies.filter(m => m.active && (isMovieActive(m) || isComingSoon(m)));

/* Helper: get dates for the next 7 days */
function getNextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getShortDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getMonthDay(date) {
  return (date.getMonth() + 1) + '/' + date.getDate();
}

/* Get showtimes for a specific day */
function getMovieShowtimes(movie, dayName) {
  if (!movie.showtimes) return [];
  return movie.showtimes[dayName] || [];
}

export default function HomePage() {
  const [trailerOpen, setTrailerOpen] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [activeTab, setActiveTab] = useState('movies');
  const dates = getNextDays(10);
  const selectedDay = getDayName(dates[selectedDate]);

  /* Filter movies that have showtimes on the selected day */
  const moviesWithShowtimes = allVisibleMovies.filter(m => {
    const times = getMovieShowtimes(m, selectedDay);
    return times.length > 0;
  });

  return (
    <div className="animate-in">

      {/* TRAILER MODAL */}
      {trailerOpen && (
        <div
          onClick={() => setTrailerOpen(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 900, aspectRatio: '16/9',
              borderRadius: 8, overflow: 'hidden',
              position: 'relative', background: '#000',
            }}
          >
            <iframe
              src={'https://www.youtube.com/embed/' + trailerOpen + '?autoplay=1&rel=0'}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Movie Trailer"
            />
          </div>
          <button
            onClick={() => setTrailerOpen(null)}
            style={{
              position: 'fixed', top: 20, right: 28,
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              fontSize: 28, cursor: 'pointer', zIndex: 10000,
              width: 44, height: 44, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Close trailer"
          >&times;</button>
        </div>
      )}

      {/* THEATER HEADER */}
      <section style={{
        background: white,
        padding: '32px 0 0',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700,
              color: dark,
              marginBottom: 6,
              fontFamily: "'Playfair Display', serif",
            }}>
              Lighthouse Cinema
            </h1>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              525 Lighthouse Ave, Pacific Grove, CA 93950 &nbsp;|&nbsp;
              <a href="tel:+18317173124" style={{ color: red }}>(831) 717-3124</a>
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { key: 'movies', label: 'Now Playing' },
              { key: 'events', label: 'Events & Shows' },
              { key: 'about', label: 'About' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid ' + red : '3px solid transparent',
                  color: activeTab === tab.key ? red : '#666',
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TAB CONTENT */}
      {activeTab === 'movies' && (
        <>
          {/* MOVIE POSTER CAROUSEL */}
          <section style={{
            padding: '32px 0',
            background: lightBg,
            borderBottom: '1px solid #e0e0e0',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20, color: dark }}>
                Featured Movies
              </h2>
              <div style={{
                display: 'flex', gap: 16, overflowX: 'auto',
                paddingBottom: 12, scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}>
                {allVisibleMovies.map(movie => (
                  <div
                    key={movie.slug}
                    style={{
                      minWidth: 180, maxWidth: 180, scrollSnapAlign: 'start',
                      cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                      background: white, flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => {
                      var el = document.getElementById('showtimes');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div style={{ position: 'relative', height: 260 }}>
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {movie.trailerId && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setTrailerOpen(movie.trailerId); }}
                          style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.65)', border: '2px solid white',
                            color: 'white', fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >&#9654;</button>
                      )}
                      {isComingSoon(movie) && (
                        <span style={{
                          position: 'absolute', top: 8, left: 8,
                          background: red, color: '#fff',
                          padding: '3px 10px', borderRadius: 4,
                          fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1,
                        }}>COMING SOON</span>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: dark, marginBottom: 3 }}>
                        {movie.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>
                        {movie.rating} {movie.runtime && 'Â· ' + movie.runtime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SHOWTIMES SECTION */}
          <section id="showtimes" style={{ padding: '32px 0 48px', background: white }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: dark }}>
                Showtimes
              </h2>

              {/* Date Picker Bar */}
              <div style={{
                display: 'flex', gap: 0, overflowX: 'auto',
                borderBottom: '1px solid #e0e0e0',
                marginBottom: 32, paddingBottom: 0,
              }}>
                {dates.map((date, i) => {
                  var isSelected = selectedDate === i;
                  var isToday = i === 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(i)}
                      style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: isSelected ? '3px solid ' + red : '3px solid transparent',
                        color: isSelected ? red : '#666',
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                        minWidth: 70,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem' }}>
                        {isToday ? 'Today' : getShortDay(date)}
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        {getMonthDay(date)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Movie Listings */}
              {moviesWithShowtimes.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px',
                  color: '#999', fontSize: '1rem',
                }}>
                  <p>No showtimes available for {getDayName(dates[selectedDate])}.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
                    We are open Wednesday through Sunday.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {moviesWithShowtimes.map(movie => {
                    var times = getMovieShowtimes(movie, selectedDay);
                    return (
                      <div
                        key={movie.slug}
                        style={{
                          display: 'flex', gap: 24,
                          paddingBottom: 32,
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        {/* Poster */}
                        <div style={{
                          minWidth: 120, maxWidth: 120,
                          borderRadius: 6, overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}>
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            style={{ width: '100%', height: 170, objectFit: 'cover' }}
                          />
                        </div>

                        {/* Movie Info */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.25rem', fontWeight: 700,
                            color: dark, marginBottom: 6,
                          }}>
                            {movie.title}
                          </h3>
                          <div style={{
                            fontSize: '0.85rem', color: '#666',
                            marginBottom: 12,
                          }}>
                            {movie.rating && <span>{movie.rating}</span>}
                            {movie.runtime && <span> &nbsp;|&nbsp; {movie.runtime}</span>}
                            {movie.genre && <span> &nbsp;|&nbsp; {movie.genre}</span>}
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {movie.trailerId && (
                              <button
                                onClick={() => setTrailerOpen(movie.trailerId)}
                                style={{
                                  padding: '6px 16px', borderRadius: 4,
                                  border: '1px solid #ccc', background: white,
                                  color: '#333', fontSize: '0.82rem', fontWeight: 600,
                                  cursor: 'pointer', transition: 'all 0.2s',
                                }}
                              >
                                Trailer
                              </button>
                            )}
                          </div>

                          {/* Format label */}
                          <div style={{
                            fontSize: '0.8rem', fontWeight: 700,
                            color: dark, marginBottom: 8,
                          }}>
                            Standard Format
                          </div>

                          {/* Showtime buttons */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {times.map(t => (
                              <a
                                key={t}
                                href={getTicketLink(movie, t)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '10px 20px',
                                  borderRadius: 4,
                                  border: '1px solid #ddd',
                                  background: white,
                                  color: dark,
                                  fontSize: '0.9rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                                title={'Buy ticket for ' + t}
                              >
                                {t}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* WEEKLY EVENTS BAR */}
          <section style={{
            padding: '40px 0',
            background: lightBg,
            borderTop: '1px solid #e0e0e0',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20, color: dark }}>
                Weekly Events
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {[
                  { day: 'Friday', name: 'Karaoke Night', time: '7:30 PM', desc: 'Sing your heart out every Friday' },
                  { day: 'Saturday', name: 'Salsa Night', time: '8:00 PM', desc: 'Dance the night away with live music' },
                ].map(item => (
                  <div key={item.day} style={{
                    background: white,
                    borderRadius: 8,
                    padding: '20px 24px',
                    border: '1px solid #e0e0e0',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{
                      minWidth: 56, height: 56, borderRadius: 8,
                      background: 'rgba(207,32,39,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      {item.day === 'Friday' ? 'ð¤' : 'ð'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: dark, fontSize: '1rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {item.day}s at {item.time}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SPECIAL EVENT */}
          <section style={{
            padding: '40px 0',
            background: white,
            borderTop: '1px solid #e0e0e0',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <div style={{
                display: 'flex', gap: 24, alignItems: 'center',
                background: lightBg, borderRadius: 12,
                padding: 28, border: '1px solid #e0e0e0',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  minWidth: 80, height: 80, borderRadius: 12,
                  background: 'rgba(207,32,39,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.2rem', flexShrink: 0,
                }}>
                  ð¨
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{
                    display: 'inline-block', background: red, color: '#fff',
                    padding: '2px 10px', borderRadius: 4,
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1,
                    marginBottom: 8,
                  }}>SPECIAL EVENT</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: dark, marginBottom: 4 }}>
                    Art &amp; East-Meets-West Fusion Concert
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
                    May 23, 2026 &middot; 5:00 PM - 8:00 PM &middot; $15
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 12 }}>
                    Abstract art, fusion music, DJ sets, and a surprise Disney animator pop-up sketch session.
                  </p>
                  <a
                    href="https://square.link/u/TREEYNkF"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', padding: '8px 24px',
                      background: red, color: '#fff', borderRadius: 6,
                      fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    Buy Tickets
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* GIFT CARDS */}
          <section style={{
            padding: '48px 0',
            background: lightBg,
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: dark, marginBottom: 8 }}>
                Gift Cards
              </h2>
              <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: 24 }}>
                Give the gift of movies, food, drinks, and events. Digital delivery from $10.
              </p>
              <a
                href={GIFT_CARD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', padding: '12px 36px',
                  background: red, color: '#fff', borderRadius: 6,
                  fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                Buy Gift Cards
              </a>
            </div>
          </section>
        </>
      )}

      {activeTab === 'events' && (
        <section style={{ padding: '40px 0', background: white }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: dark, marginBottom: 24 }}>
              Upcoming Events
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {[
                { title: 'Karaoke Night', day: 'Every Friday', time: '7:30 PM', price: 'Free', emoji: 'ð¤' },
                { title: 'Salsa Night', day: 'Every Saturday', time: '8:00 PM', price: 'Free', emoji: 'ð' },
                { title: 'Art & East-Meets-West Fusion Concert', day: 'May 23, 2026', time: '5:00 PM', price: '$15', emoji: 'ð¨', link: 'https://square.link/u/TREEYNkF' },
                { title: 'Motorcycle Movie of the Month', day: 'Monthly', time: '11:00 AM', price: 'Free', emoji: 'ðï¸' },
                { title: 'Drink & Draw', day: 'Weekly', time: 'Evening', price: 'Free', emoji: 'ð¨' },
                { title: 'Tabletop Night', day: 'Weekly', time: 'Evening', price: 'Free', emoji: 'ð²' },
              ].map((event, i) => (
                <div key={i} style={{
                  background: white, borderRadius: 8,
                  border: '1px solid #e0e0e0',
                  padding: 24,
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{event.emoji}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: dark, marginBottom: 6 }}>
                    {event.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 4 }}>
                    {event.day} at {event.time}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: red }}>
                    {event.price}
                  </div>
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', marginTop: 12,
                        padding: '8px 20px', background: red, color: '#fff',
                        borderRadius: 6, fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none',
                      }}>
                      Get Tickets
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section style={{ padding: '48px 0', background: white }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: dark, marginBottom: 20 }}>
              About Lighthouse Cinema
            </h2>
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.8, marginBottom: 16 }}>
              Lighthouse Cinema has been a beloved staple of Pacific Grove since July 1987,
              when brothers John and Sal Enea opened its doors. For nearly four decades it has
              been more than a movie theater &mdash; a place where first dates happen, friendships
              grow, and families share the magic of the big screen.
            </p>
            <p style={{ color: '#555', fontSize: '1rem', lineHeight: 1.8, marginBottom: 24 }}>
              Under new ownership by Dr. Ayman Adeeb and his family, and with the dedication
              of a hard-working staff, Lighthouse Cinema is shining brighter than ever. With
              movies, karaoke, salsa nights, comedy, and community events, there is something
              for everyone.
            </p>

            <div style={{
              background: lightBg, borderRadius: 12, padding: 28,
              border: '1px solid #e0e0e0', marginBottom: 32,
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: dark, marginBottom: 12 }}>
                Theater Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.9rem', color: '#555' }}>
                <div>
                  <strong style={{ color: dark }}>Address</strong><br />
                  525 Lighthouse Ave<br />
                  Pacific Grove, CA 93950
                </div>
                <div>
                  <strong style={{ color: dark }}>Phone</strong><br />
                  <a href="tel:+18317173124" style={{ color: red }}>(831) 717-3124</a>
                </div>
                <div>
                  <strong style={{ color: dark }}>Hours</strong><br />
                  Wed - Sun: Open<br />
                  Mon - Tue: Closed
                </div>
                <div>
                  <strong style={{ color: dark }}>Text Us</strong><br />
                  <a href="sms:+18334414049" style={{ color: red }}>(833) 441-4049</a>
                </div>
              </div>
            </div>

            {/* VIP Signup */}
            <div style={{
              background: 'rgba(207,32,39,0.04)', borderRadius: 12, padding: 28,
              border: '1px solid rgba(207,32,39,0.15)', textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: dark, marginBottom: 8 }}>
                Join the VIP List
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 16 }}>
                Text <strong style={{ color: red }}>JOIN</strong> to{' '}
                <strong style={{ color: red }}>(831) 747-4470</strong> for showtimes, new events,
                and 10% off your next visit.
              </p>
              <a href="sms:+18317474470?body=JOIN" style={{
                display: 'inline-flex', padding: '10px 28px',
                background: red, color: '#fff', borderRadius: 6,
                fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
              }}>
                Text JOIN
              </a>
            </div>
          </div>
        </section>
      )}

      {/* BOTTOM MARQUEE BAR */}
      <section style={{
        background: red, color: '#fff',
        padding: '10px 0', overflow: 'hidden',
        fontWeight: 600, fontSize: '0.85rem',
      }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center', letterSpacing: 0.5 }}>
          NOW SHOWING: DEVIL WEARS PRADA 2 &middot; SHEEP DETECTIVES &middot; MANDALORIAN &amp; GROGU &middot; I LOVE BOOSTERS &nbsp;|&nbsp;
          KARAOKE FRIDAYS 7:30 PM &nbsp;|&nbsp;
          SALSA SATURDAYS 8 PM &nbsp;|&nbsp;
          BAR &amp; GRILL OPEN DAILY
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ padding: '48px 0', background: lightBg, borderTop: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: dark, marginBottom: 20 }}>
            Contact Lighthouse Cinema
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="sms:+18334414049" style={{
              display: 'inline-flex', padding: '12px 28px',
              background: red, color: '#fff', borderRadius: 6,
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
            }}>
              Text the Cinema
            </a>
            <a href="tel:+18317173124" style={{
              display: 'inline-flex', padding: '12px 28px',
              background: white, color: dark, borderRadius: 6,
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              border: '1px solid #ddd',
            }}>
              Call (831) 717-3124
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
