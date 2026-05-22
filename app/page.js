'use client';
// Gold & Black themed redesign with Cinemark-style layout
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { movies, SQUARE_LINKS, getTicketLink, isMovieActive, isComingSoon } from './showtime-config';

const GIFT_CARD_LINK = 'https://square.link/u/PicBQip5';

/* style constants --- GOLD & BLACK theme */
const gold = '#d4af37';
const goldDark = '#b8942e';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';
const allVisibleMovies = movies.filter(m => m.active && (isMovieActive(m) || isComingSoon(m)));

/* Helper: get dates for the next 10 days */
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

/* Get showtimes for a specific day --- handles BOTH formats:
   1. showtimes: { Wednesday: ['2:30 PM', ...] }  (day-of-week keys)
   2. showDates: [{ date: '2026-05-20', times: ['1:00 PM', ...] }]  (specific dates)
*/
function getMovieShowtimes(movie, dayName, selectedDate) {
  // First check showDates (specific date matches take priority)
  if (movie.showDates && selectedDate) {
    var y = selectedDate.getFullYear();
    var m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    var d = String(selectedDate.getDate()).padStart(2, '0');
    var dateStr = y + '-' + m + '-' + d;
    var match = movie.showDates.find(function(sd) { return sd.date === dateStr; });
    if (match) return match.times;
  }
  // Fall back to day-of-week based showtimes
  if (movie.showtimes && movie.showtimes[dayName]) {
    return movie.showtimes[dayName];
  }
  return [];
}

export default function HomePage() {
  var [trailerOpen, setTrailerOpen] = useState(null);
  var [selectedDate, setSelectedDate] = useState(0);
  var [activeTab, setActiveTab] = useState('movies');
  var dates = getNextDays(10);
  var selectedDay = getDayName(dates[selectedDate]);

  /* Filter movies that have showtimes on the selected day */
  var moviesWithShowtimes = allVisibleMovies.filter(function(m) {
    var times = getMovieShowtimes(m, selectedDay, dates[selectedDate]);
    return times.length > 0;
  });

  return (
    <div className="animate-in">

      {/* TRAILER MODAL */}
      {trailerOpen && (
        <div
          onClick={function() { setTrailerOpen(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={function(e) { e.stopPropagation(); }}
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
            onClick={function() { setTrailerOpen(null); }}
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
        background: black,
        padding: '32px 0 0',
        borderBottom: '1px solid ' + darkBorder,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: 6,
              fontFamily: "'Playfair Display', serif",
            }}>
              Lighthouse Cinema
            </h1>
            <p style={{ color: textMuted, fontSize: '0.9rem' }}>
              525 Lighthouse Ave, Pacific Grove, CA 93950 &nbsp;|&nbsp;
              <a href="tel:+18317173124" style={{ color: gold }}>(831) 717-3124</a>
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { key: 'movies', label: 'Now Playing' },
              { key: 'events', label: 'Events & Shows' },
              { key: 'about', label: 'About' },
            ].map(function(tab) {
              return (
              <button
                key={tab.key}
                onClick={function() { setActiveTab(tab.key); }}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid ' + gold : '3px solid transparent',
                  color: activeTab === tab.key ? gold : textMuted,
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ); })}
          </div>
        </div>
      </section>

      {/* TAB CONTENT */}
      {activeTab === 'movies' && (
        <>
          {/* MOVIE POSTER CAROUSEL */}
          <section style={{
            padding: '32px 0',
            background: darkBg,
            borderBottom: '1px solid ' + darkBorder,
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20, color: '#fff' }}>
                Featured Movies
              </h2>
              <div style={{
                display: 'flex', gap: 16, overflowX: 'auto',
                paddingBottom: 12, scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
              }}>
                {allVisibleMovies.map(function(movie) {
                  return (
                  <div
                    key={movie.slug}
                    style={{
                      minWidth: 180, maxWidth: 180, scrollSnapAlign: 'start',
                      cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                      background: darkCard, flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={function() {
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
                          onClick={function(e) { e.stopPropagation(); setTrailerOpen(movie.trailerId); }}
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
                          background: gold, color: '#000',
                          padding: '3px 10px', borderRadius: 4,
                          fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1,
                        }}>COMING SOON</span>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 3 }}>
                        {movie.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: textMuted }}>
                        {movie.rating} {movie.runtime && '\u00B7 ' + movie.runtime}
                      </div>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </section>

          {/* SHOWTIMES SECTION */}
          <section id="showtimes" style={{ padding: '32px 0 48px', background: black }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20, color: '#fff' }}>
                Showtimes
              </h2>

              {/* Date Picker Bar */}
              <div style={{
                display: 'flex', gap: 0, overflowX: 'auto',
                borderBottom: '1px solid ' + darkBorder,
                marginBottom: 32, paddingBottom: 0,
              }}>
                {dates.map(function(date, i) {
                  var isSelected = selectedDate === i;
                  var isToday = i === 0;
                  return (
                    <button
                      key={i}
                      onClick={function() { setSelectedDate(i); }}
                      style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: isSelected ? '3px solid ' + gold : '3px solid transparent',
                        color: isSelected ? gold : textMuted,
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
                  color: textMuted, fontSize: '1rem',
                }}>
                  <p>No showtimes available for {getDayName(dates[selectedDate])}.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
                    We are open Wednesday through Sunday.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {moviesWithShowtimes.map(function(movie) {
                    var times = getMovieShowtimes(movie, selectedDay, dates[selectedDate]);
                    return (
                      <div
                        key={movie.slug}
                        style={{
                          display: 'flex', gap: 24,
                          paddingBottom: 32,
                          borderBottom: '1px solid ' + darkBorder,
                        }}
                      >
                        {/* Poster */}
                        <div style={{
                          minWidth: 120, maxWidth: 120,
                          borderRadius: 6, overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
                            color: '#fff', marginBottom: 6,
                          }}>
                            {movie.title}
                          </h3>
                          <div style={{
                            fontSize: '0.85rem', color: textMuted,
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
                                onClick={function() { setTrailerOpen(movie.trailerId); }}
                                style={{
                                  padding: '6px 16px', borderRadius: 4,
                                  border: '1px solid ' + darkBorder, background: darkCard,
                                  color: '#fff', fontSize: '0.82rem', fontWeight: 600,
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
                            color: gold, marginBottom: 8,
                          }}>
                            Standard Format
                          </div>

                          {/* Showtime buttons */}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {times.map(function(t) {
                              return (
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
                                  border: '1px solid ' + darkBorder,
                                  background: darkCard,
                                  color: '#fff',
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
                            ); })}
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
            background: darkBg,
            borderTop: '1px solid ' + darkBorder,
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20, color: '#fff' }}>
                Weekly Events
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {[
                  { day: 'Tuesday', name: '$7 Movie Day', time: 'All Showings', desc: 'Every movie just $7 every Tuesday!' },
                  { day: 'Saturday', name: 'Salsa Night', time: '8:00 PM', desc: 'Dance the night away with live music' },
                ].map(function(item) {
                  return (
                  <div key={item.day} style={{
                    background: darkCard,
                    borderRadius: 8,
                    padding: '20px 24px',
                    border: '1px solid ' + darkBorder,
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{
                      minWidth: 56, height: 56, borderRadius: 8,
                      background: 'rgba(212,175,55,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      {'\u{1F483}'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: textMuted }}>
                        {item.day}s at {item.time}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: textMuted, marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </section>

          {/* SPECIAL EVENT */}
          <section style={{
            padding: '40px 0',
            background: black,
            borderTop: '1px solid ' + darkBorder,
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <div style={{
                display: 'flex', gap: 24, alignItems: 'center',
                background: darkCard, borderRadius: 12,
                padding: 28, border: '1px solid ' + darkBorder,
                flexWrap: 'wrap',
              }}>
                <div style={{
                  minWidth: 80, height: 80, borderRadius: 12,
                  background: 'rgba(212,175,55,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.2rem', flexShrink: 0,
                }}>
                  {'\u{1F3A8}'}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{
                    display: 'inline-block', background: gold, color: '#000',
                    padding: '2px 10px', borderRadius: 4,
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: 1,
                    marginBottom: 8,
                  }}>SPECIAL EVENT</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    Art &amp; East-Meets-West Fusion Concert
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: textMuted, marginBottom: 8 }}>
                    May 23, 2026 &middot; 5:00 PM - 8:00 PM &middot; $15
                  </p>
                  <p style={{ fontSize: '0.85rem', color: textMuted, marginBottom: 12 }}>
                    Abstract art, fusion music, DJ sets, and a surprise Disney animator pop-up sketch session.
                  </p>
                  <a
                    href="https://square.link/u/TREEYNkF"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', padding: '8px 24px',
                      background: gold, color: '#000', borderRadius: 6,
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
            background: darkBg,
            borderTop: '1px solid ' + darkBorder,
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Gift Cards
              </h2>
              <p style={{ color: textMuted, fontSize: '0.95rem', marginBottom: 24 }}>
                Give the gift of movies, food, drinks, and events. Digital delivery from $10.
              </p>
              <a
                href={GIFT_CARD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', padding: '12px 36px',
                  background: gold, color: '#000', borderRadius: 6,
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
        <section style={{ padding: '40px 0', background: black }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 24 }}>
              Upcoming Events
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {[
                { title: 'Salsa Night', day: 'Every Saturday', time: '8:00 PM', price: 'Free', emoji: '\u{1F483}' },
                { title: 'Art & East-Meets-West Fusion Concert', day: 'May 23, 2026', time: '5:00 PM', price: '$15', emoji: '\u{1F3A8}', link: 'https://square.link/u/TREEYNkF' },
                { title: 'Motorcycle Movie of the Month', day: 'Monthly', time: '11:00 AM', price: 'Free', emoji: '\u{1F3CD}\u{FE0F}' },
                { title: 'Drink & Draw', day: 'Weekly', time: 'Evening', price: 'Free', emoji: '\u{1F3A8}' },
                { title: 'Tabletop Night', day: 'Weekly', time: 'Evening', price: 'Free', emoji: '\u{1F3B2}' },
              ].map(function(event, i) {
                return (
                <div key={i} style={{
                  background: darkCard, borderRadius: 8,
                  border: '1px solid ' + darkBorder,
                  padding: 24,
                  transition: 'box-shadow 0.2s',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{event.emoji}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                    {event.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: textMuted, marginBottom: 4 }}>
                    {event.day} at {event.time}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: gold }}>
                    {event.price}
                  </div>
                  {event.link && (
                    <a href={event.link} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', marginTop: 12,
                        padding: '8px 20px', background: gold, color: '#000',
                        borderRadius: 6, fontSize: '0.82rem', fontWeight: 700,
                        textDecoration: 'none',
                      }}>
                      Get Tickets
                    </a>
                  )}
                </div>
              ); })}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section style={{ padding: '48px 0', background: black }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>
              About Lighthouse Cinema
            </h2>
            <p style={{ color: textLight, fontSize: '1rem', lineHeight: 1.8, marginBottom: 16 }}>
              Lighthouse Cinema has been a beloved staple of Pacific Grove since July 1987,
              when brothers John and Sal Enea opened its doors. For nearly four decades it has
              been more than a movie theater &mdash; a place where first dates happen, friendships
              grow, and families share the magic of the big screen.
            </p>
            <p style={{ color: textLight, fontSize: '1rem', lineHeight: 1.8, marginBottom: 24 }}>
              Under new ownership by Dr. Ayman Adeeb and his family, and with the dedication
              of a hard-working staff, Lighthouse Cinema is shining brighter than ever. With
              movies, salsa nights, comedy, and community events, there is something
              for everyone.
            </p>

            <div style={{
              background: darkCard, borderRadius: 12, padding: 28,
              border: '1px solid ' + darkBorder, marginBottom: 32,
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                Theater Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.9rem', color: textLight }}>
                <div>
                  <strong style={{ color: gold }}>Address</strong><br />
                  525 Lighthouse Ave<br />
                  Pacific Grove, CA 93950
                </div>
                <div>
                  <strong style={{ color: gold }}>Phone</strong><br />
                  <a href="tel:+18317173124" style={{ color: gold }}>(831) 717-3124</a>
                </div>
                <div>
                  <strong style={{ color: gold }}>Hours</strong><br />
                  Wed - Sun: Open<br />
                  Mon - Tue: Closed
                </div>
                <div>
                  <strong style={{ color: gold }}>Text Us</strong><br />
                  <a href="sms:+18334414049" style={{ color: gold }}>(833) 441-4049</a>
                </div>
              </div>
            </div>

            {/* VIP Signup */}
            <div style={{
              background: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 28,
              border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Join the VIP List
              </h3>
              <p style={{ color: textMuted, fontSize: '0.9rem', marginBottom: 16 }}>
                Text <strong style={{ color: gold }}>JOIN</strong> to{' '}
                <strong style={{ color: gold }}>(831) 747-4470</strong> for showtimes, new events,
                and 10% off your next visit.
              </p>
              <a href="sms:+18317474470?body=JOIN" style={{
                display: 'inline-flex', padding: '10px 28px',
                background: gold, color: '#000', borderRadius: 6,
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
        background: gold, color: '#000',
        padding: '10px 0', overflow: 'hidden',
        fontWeight: 600, fontSize: '0.85rem',
      }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center', letterSpacing: 0.5 }}>
          NOW SHOWING: DEVIL WEARS PRADA 2 &middot; SHEEP DETECTIVES &middot; MANDALORIAN &amp; GROGU &middot; I LOVE BOOSTERS &nbsp;|&nbsp;
          TUESDAY $7 MOVIE DAY &nbsp;|&nbsp;
          SALSA SATURDAYS 8 PM &nbsp;|&nbsp;
          BAR &amp; GRILL OPEN DAILY
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ padding: '48px 0', background: darkBg, borderTop: '1px solid ' + darkBorder }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>
            Contact Lighthouse Cinema
          </h2>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="sms:+18334414049" style={{
              display: 'inline-flex', padding: '12px 28px',
              background: gold, color: '#000', borderRadius: 6,
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
            }}>
              Text the Cinema
            </a>
            <a href="tel:+18317173124" style={{
              display: 'inline-flex', padding: '12px 28px',
              background: darkCard, color: '#fff', borderRadius: 6,
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              border: '1px solid ' + darkBorder,
            }}>
              Call (831) 717-3124
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

