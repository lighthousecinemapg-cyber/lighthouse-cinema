'use client';
// Gold & Black themed redesign with Cinemark-style layout
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { movies, SQUARE_LINKS, getTicketLink, isMovieActive, isComingSoon } from './showtime-config';

const GIFT_CARD_LINK = 'https://square.link/u/PicBQip5';

/* style constants --- GOLD & BLACK themhe */
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

function getTuesdayLineup() {
  var d = new Date();
  while (d.getDay() !== 2) { d.setDate(d.getDate() + 1); }
  var y = d.getFullYear(), mo = String(d.getMonth() + 1).padStart(2, '0'), da = String(d.getDate()).padStart(2, '0');
  var dateStr = y + '-' + mo + '-' + da;
  return movies.filter(function (m) {
    if (!m.active) return false;
    if (m.startDate && dateStr < m.startDate) return false;
    if (m.endDate && dateStr > m.endDate) return false;
    return getMovieShowtimes(m, 'Tuesday', d).length > 0;
  }).map(function (m) {
    var t = getMovieShowtimes(m, 'Tuesday', d);
    return { title: m.title, times: t, timesStr: t.join(' / ') };
  });
}

function dealFor(day, time) {
  if (day === 'Tuesday') return { on: true, price: '$7', link: SQUARE_LINKS.tuesdayDiscount, label: 'TUESDAY MOVIE DAY - Every Movie, Every Show $7' };
  if (day === 'Wednesday') return { on: true, price: '$10', link: SQUARE_LINKS.wednesday, label: 'MIDWEEK MOVIE NIGHT - All Movies, All Showtimes $10' };
  if (day === 'Thursday') return { on: true, price: '$10', link: SQUARE_LINKS.thursday, label: 'THURSDAY MOVIE NIGHT - All Movies, All Showtimes $10' };
  if (day === 'Sunday') return { on: true, price: '$10', link: SQUARE_LINKS.sunday, label: 'SUNDAY FAMILY MOVIE DAY - All Movies $10' };
  if (day === 'Friday') return { on: true, price: '$15', link: SQUARE_LINKS.friday, label: 'FRIDAY MOVIE NIGHT - All Movies, Any Showtime $15' };
  if (day === 'Saturday') return { on: true, price: '$15', link: SQUARE_LINKS.saturday, label: 'SATURDAY BIG SCREEN - All Movies, Any Showtime $15' };
  return { on: false, price: '', link: '', label: '' };
}

export default function HomePage() {
  var [trailerOpen, setTrailerOpen] = useState(null);
  var [selectedDate, setSelectedDate] = useState(0);
  var [activeTab, setActiveTab] = useState('movies');
  var [ticketModal, setTicketModal] = useState(null);
  var [ticketType, setTicketType] = useState('adult');
  var [payLoading, setPayLoading] = useState(false);
  var [qty, setQty] = useState(1);
  var dates = getNextDays(10);
  var selectedDay = getDayName(dates[selectedDate]);

  /* Persist the selected showtime so it never disappears (refresh, tab switch, back button). */
  useEffect(function() {
    try {
      var raw = sessionStorage.getItem('lh_ticket_selection');
      if (raw) {
        var sel = JSON.parse(raw);
        if (sel && sel.slug && sel.time && (Date.now() - (sel.savedAt || 0) < 2 * 60 * 60 * 1000)) {
          var mv = movies.find(function(m) { return m.slug === sel.slug; });
          if (mv) {
            setTicketModal({ movie: mv, time: sel.time });
            if (sel.ticketType) setTicketType(sel.ticketType);
            if (typeof sel.dateIdx === 'number') setSelectedDate(sel.dateIdx);
          }
        }
      }
    } catch (e) {}
  }, []);

  useEffect(function() {
    try {
      if (ticketModal && ticketModal.movie) {
        var d = dates[selectedDate];
        sessionStorage.setItem('lh_ticket_selection', JSON.stringify({
          slug: ticketModal.movie.slug,
          movieTitle: ticketModal.movie.title,
          time: ticketModal.time,
          ticketType: ticketType,
          dateIdx: selectedDate,
          date: d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '',
          runtime: ticketModal.movie.runtime || '',
          rating: ticketModal.movie.rating || '',
          savedAt: Date.now(),
        }));
      }
    } catch (e) {}
  }, [ticketModal, ticketType, selectedDate]);

  /* Filter movies that have showtimes on the selected day */
  var moviesWithShowtimes = allVisibleMovies.filter(function(m) {
    if (isComingSoon(m)) return false;
    var times = getMovieShowtimes(m, selectedDay, dates[selectedDate]);
    return times.length > 0;
  });

  async function startPayment() {
    if (!ticketModal) return;
    var deal = dealFor(selectedDay, ticketModal.time);
    var priceStr = deal.on ? deal.price : (ticketType === 'adult' ? '$15' : '$12');
    var dLabel = dates[selectedDate] ? dates[selectedDate].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
    var fallback = deal.on ? deal.link : (ticketType === 'adult' ? getTicketLink(ticketModal.movie, ticketModal.time) : SQUARE_LINKS.childSenior);
    var ttLabel = ticketType.charAt(0).toUpperCase() + ticketType.slice(1);
    try {
      sessionStorage.setItem('lh_ticket_selection', JSON.stringify({ slug: ticketModal.movie.slug, movieTitle: ticketModal.movie.title, time: ticketModal.time, ticketType: ticketType, dateIdx: selectedDate, date: dLabel, quantity: qty, savedAt: Date.now() }));
    } catch (e) {}
    setPayLoading(true);
    try {
      var res = await fetch('/api/square/payment-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ movieTitle: ticketModal.movie.title, dateLabel: dLabel, time: ticketModal.time, price: priceStr, quantity: qty, ticketType: ttLabel }),
      });
      if (res.ok) {
        var data = await res.json();
        if (data && data.url) { window.location.href = data.url; return; }
      }
    } catch (e) {}
    // Fallback to existing static link if the Square API is not configured yet
    window.location.href = fallback;
  }

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

      {/* TICKET TYPE MODAL */}
      {ticketModal && (
        <div
          onClick={function() { setTicketModal(null); setTicketType('adult'); try { sessionStorage.removeItem('lh_ticket_selection'); } catch (e) {} }}
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
              background: darkCard, borderRadius: 16,
              border: '2px solid ' + gold, padding: 32,
              maxWidth: 420, width: '100%',
              boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
            }}
          >
            <button
              onClick={function() { setTicketModal(null); setTicketType('adult'); try { sessionStorage.removeItem('lh_ticket_selection'); } catch (e) {} }}
              style={{
                position: 'absolute', top: 12, right: 16,
                background: 'none', border: 'none', color: textMuted,
                fontSize: 24, cursor: 'pointer',
              }}
            >&times;</button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 4, textAlign: 'center' }}>
              Select Ticket Type
            </h3>
            <div style={{
              background: '#0a0a0a', border: '1px solid ' + gold, borderRadius: 12,
              padding: '14px 16px', marginBottom: 22,
            }}>
              <div style={{ color: textMuted, fontSize: '0.68rem', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Your Reservation</div>
              <div style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>{'\u{1F3AC}'} {ticketModal.movie.title}</div>
              <div style={{ color: textLight, fontSize: '0.9rem', marginBottom: 4 }}>{'\u{1F4C5}'} {dates[selectedDate] ? dates[selectedDate].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 6px' }}>
                <span style={{ fontSize: '1.5rem' }}>{'\u{1F551}'}</span>
                <span style={{ color: gold, fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{ticketModal.time}</span>
              </div>
              <div style={{ color: textMuted, fontSize: '0.8rem' }}>
                {ticketModal.movie.rating}{ticketModal.movie.runtime ? '  \u00b7  ' + ticketModal.movie.runtime : ''}{'  \u00b7  Standard Format'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { id: 'adult', emoji: '\u{1F464}', label: 'Adult', price: dealFor(selectedDay, ticketModal.time).on ? dealFor(selectedDay, ticketModal.time).price : '$15', desc: 'General admission' },
                { id: 'senior', emoji: '\u{1F474}', label: 'Senior (62+)', price: dealFor(selectedDay, ticketModal.time).on ? dealFor(selectedDay, ticketModal.time).price : '$12', desc: 'Valid ID required' },
                { id: 'child', emoji: '\u{1F9D2}', label: 'Child (under 12)', price: dealFor(selectedDay, ticketModal.time).on ? dealFor(selectedDay, ticketModal.time).price : '$12', desc: 'Must be accompanied by adult' },
              ].map(function(opt) {
                var isSelected = ticketType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={function() { setTicketType(opt.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 10,
                      border: isSelected ? '2px solid ' + gold : '2px solid ' + darkBorder,
                      background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{opt.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.78rem', color: textMuted }}>{opt.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: isSelected ? gold : textMuted }}>
                      {opt.price}
                    </div>
                  </button>
                );
              })}
            </div>

            {ticketModal && dealFor(selectedDay, ticketModal.time).on && (
              <div style={{
                background: 'rgba(212,175,55,0.08)', borderRadius: 8,
                padding: '8px 14px', marginBottom: 16, textAlign: 'center',
                border: '1px solid rgba(212,175,55,0.2)',
              }}>
                <span style={{ color: gold, fontWeight: 700, fontSize: '0.85rem' }}>
                  {'🎉'} {dealFor(selectedDay, ticketModal.time).label}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: textLight, fontWeight: 700, fontSize: '0.95rem' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={function() { setQty(function(q) { return Math.max(1, q - 1); }); }} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid ' + gold, background: 'transparent', color: gold, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>{'\u2212'}</button>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', minWidth: 26, textAlign: 'center' }}>{qty}</span>
                <button onClick={function() { setQty(function(q) { return Math.min(20, q + 1); }); }} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid ' + gold, background: 'transparent', color: gold, fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}>{'+'}</button>
              </div>
            </div>
            <button
              onClick={startPayment}
              disabled={payLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%', padding: '14px 24px',
                background: gold, color: '#000', borderRadius: 8,
                fontSize: '1rem', fontWeight: 700, textDecoration: 'none',
                border: 'none', cursor: payLoading ? 'default' : 'pointer',
                opacity: payLoading ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              {payLoading ? 'Preparing your ticket…' : 'Continue to Payment →'}
            </button>
          </div>
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
                      {movie.finalDay && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: '#E50914', color: '#fff', padding: '3px 10px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1 }}>{movie.finalDay}</span>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 3 }}>
                        <a href={'/movies/' + movie.slug} style={{ color: 'inherit', textDecoration: 'none' }}>{movie.title}</a>
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

              {/* Monday Closed Banner */}
              {selectedDay === 'Monday' && (
                <div style={{ background: 'rgba(255,68,68,0.1)', border: '2px solid #ff4444', borderRadius: 12, padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ff4444' }}>{'🚫'} WE ARE CLOSED TODAY (MONDAY) {'🚫'}</span>
                  <p style={{ color: textMuted, fontSize: '0.9rem', margin: '8px 0 0' }}>Open Tuesday - Sunday. Select another day above to see showtimes!</p>
                </div>
              )}


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
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>{'🚫'}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff4444', marginBottom: 8 }}>CLOSED ON MONDAYS</h3>
                  <p style={{ fontSize: '1rem', marginBottom: 8 }}>We are closed every Monday. No movies, no showtimes.</p>
                  <p style={{ fontSize: '0.95rem', color: gold, fontWeight: 600 }}>We are open Tuesday through Sunday!</p>
                  <p style={{ fontSize: '0.85rem', marginTop: 12 }}>See you tomorrow! Check the other days above for showtimes.</p>
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
                            <a href={'/movies/' + movie.slug} style={{ color: 'inherit', textDecoration: 'none' }}>{movie.title}</a>
                          </h3>
                          <div style={{
                            fontSize: '0.85rem', color: textMuted,
                            marginBottom: 12,
                          }}>
                            {movie.rating && <span>{movie.rating}</span>}
                            {movie.runtime && <span> &nbsp;|&nbsp; {movie.runtime}</span>}
                            {movie.genre && <span> &nbsp;|&nbsp; {movie.genre}</span>}
                          </div>
                          {movie.finalDay && (
                            <div style={{ display: 'inline-block', background: '#E50914', color: '#fff', padding: '5px 14px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 800, letterSpacing: 0.5, marginBottom: 10 }}>{movie.finalDay}</div>
                          )}
                          {movie.finalDay && movie.displayNote && (
                            <div style={{ color: '#ff6b6b', fontSize: '0.92rem', fontWeight: 600, marginBottom: 10 }}>{movie.displayNote}</div>
                          )}

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
                              <button
                                key={t}
                                onClick={function() { setTicketModal({movie: movie, time: t}); setTicketType('adult'); }}
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
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                                title={'Buy ticket for ' + t}
                              >
                                {t}
                              </button>
                            ); })}
                          </div>
                          {times.length > 0 && (
                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                              <button onClick={function() { setTicketModal({ movie: movie, time: times[0] }); setTicketType('adult'); }} style={{ background: gold, color: '#000', border: 'none', padding: '11px 24px', borderRadius: 6, fontSize: '0.92rem', fontWeight: 800, cursor: 'pointer' }}>🎟️ Buy Tickets</button>
                              <span style={{ color: textMuted, fontSize: '0.82rem', fontWeight: 600 }}>⚡ Only takes 30 seconds</span>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* TODAY'S PRICE BANNER */}
          <section style={{ padding: '44px 0', background: 'linear-gradient(135deg, #1a1400 0%, #2a1f00 50%, #1a1400 100%)', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
              {(function () {
                var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                var prices = { Sunday: '$10', Monday: 'CLOSED', Tuesday: '$7', Wednesday: '$10', Thursday: '$10', Friday: '$15', Saturday: '$15' };
                var links = { Sunday: SQUARE_LINKS.sunday, Tuesday: SQUARE_LINKS.tuesdayDiscount, Wednesday: SQUARE_LINKS.wednesday, Thursday: SQUARE_LINKS.thursday, Friday: SQUARE_LINKS.friday, Saturday: SQUARE_LINKS.saturday };
                var today = days[new Date().getDay()];
                var price = prices[today];
                var link = links[today] || SQUARE_LINKS.general;
                return (
                  <div>
                    <div style={{ fontSize: '2.4rem', marginBottom: 4 }}>{'\u{1F3AC}'}</div>
                    <div style={{ color: gold, letterSpacing: 2, textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800 }}>{"Today\u2019s Price \u2014 " + today}</div>
                    {price === 'CLOSED' ? (
                      <h2 style={{ fontSize: 'clamp(1.8rem,6vw,2.8rem)', fontWeight: 800, color: '#fff', margin: '8px 0 0' }}>{"We\u2019re Closed Today \u2014 See You Tomorrow!"}</h2>
                    ) : (
                      <div>
                        <h2 style={{ fontSize: 'clamp(2.2rem,7vw,3.4rem)', fontWeight: 800, color: '#fff', margin: '6px 0 14px' }}>{'ALL MOVIES ' + price + ' TODAY'}</h2>
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: gold, color: '#000', padding: '15px 40px', borderRadius: 8, fontWeight: 800, fontSize: '1.15rem', textDecoration: 'none' }}>Buy Tickets Now</a>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
                      {['Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(function (d) {
                        var on = d === today;
                        return (<span key={d} style={{ background: on ? gold : darkCard, color: on ? '#000' : textLight, border: '1px solid ' + (on ? gold : darkBorder), borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700 }}>{d.slice(0,3) + ' ' + prices[d]}</span>);
                      })}
                      <span style={{ background: darkCard, color: textMuted, border: '1px solid ' + darkBorder, borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700 }}>Mon Closed</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* COMING SOON SECTION */}
          <section style={{ padding: '40px 0', background: darkBg, borderTop: '1px solid ' + darkBorder }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>Coming Soon</h2>
              <p style={{ color: textMuted, fontSize: '0.9rem', marginBottom: 24 }}>Upcoming movies with showtimes and tickets</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {allVisibleMovies.filter(function(m) { return isComingSoon(m); }).map(function(movie) {
                  var movieTimes = movie.showtimes ? (Object.values(movie.showtimes)[0] || []) : (movie.showDates && movie.showDates[0] ? movie.showDates[0].times : []);
                  var openDate = movie.startDate ? movie.startDate.replace('2026-', '').replace('-', '/') : 'TBA';
                  return (
                    <div key={movie.slug} style={{ display: 'flex', gap: 16, padding: 16, background: darkCard, borderRadius: 8, border: '1px solid ' + darkBorder, flexWrap: 'wrap' }}>
                      <img src={movie.poster} alt={movie.title} style={{ width: 90, height: 130, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}><a href={'/movies/' + movie.slug} style={{ color: 'inherit', textDecoration: 'none' }}>{movie.title}</a></h3>
                          <span style={{ background: gold, color: '#000', padding: '2px 8px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700 }}>COMING SOON</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: textMuted, marginBottom: 6 }}>{movie.rating} {movie.runtime ? '| ' + movie.runtime : ''} {movie.genre ? '| ' + movie.genre : ''}</div>
                        <div style={{ fontSize: '0.85rem', color: gold, fontWeight: 600, marginBottom: 4 }}>{'Opens ' + openDate}</div>
                        {movie.advanceSale && (<div style={{ display: 'inline-block', background: gold, color: '#000', padding: '3px 10px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.5, marginBottom: 6 }}>NOW ON SALE - ADVANCE TICKETS</div>)}
                        <div style={{ fontSize: '0.8rem', color: textMuted, marginBottom: 8 }}>{'Showtimes: ' + (movieTimes.length > 0 ? movieTimes.join(' | ') : 'TBA')}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {movie.trailerId && <button onClick={function() { setTrailerOpen(movie.trailerId); }} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid ' + darkBorder, background: 'transparent', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>Trailer</button>}
                          <a href={'https://square.link/u/YqvdJLdp'} target="_blank" rel="noopener noreferrer" style={{ padding: '5px 12px', borderRadius: 4, background: gold, color: '#000', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>Buy Tickets</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  { day: 'Tuesday', name: '$7 Movie Day', time: 'All Day', desc: 'All movies, all showtimes - just $7 every Tuesday!' },
                  { day: 'Tuesday', name: '$7 Movie Day', time: 'All Day', desc: 'Every movie just $7! Support your local cinema.' },
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
                      {item.icon}
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

          {/* PRIVATE EVENTS CTA */}
          <section style={{ padding: '40px 0', background: black, borderTop: '1px solid ' + darkBorder, textAlign: 'center' }}>
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 2, color: gold, marginBottom: 8 }}>Private Events</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Host Your Event at Lighthouse</h2>
              <p style={{ color: textMuted, fontSize: '0.95rem', marginBottom: 20 }}>Birthday parties, corporate nights, school & church events, fundraisers, and private screenings — make it unforgettable on the big screen.</p>
              <a href="/private-events" style={{ display: 'inline-flex', padding: '12px 32px', background: gold, color: '#000', borderRadius: 6, fontSize: '1rem', fontWeight: 700, textDecoration: 'none' }}>Inquire About Private Events</a>
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
                The Perfect Gift for Movie Lovers — give the gift of movies, food, drinks, and events. Digital delivery from $10.
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
                { title: 'Tuesday $7 Movie Day', day: 'Every Tuesday', time: 'All Day', price: '$7', emoji: '\u{1F3AC}', link: SQUARE_LINKS.tuesdayDiscount },
                { title: 'Salsa Night', day: 'Every Saturday', time: '8:00 PM', price: 'Free', emoji: '\u{1F483}' },
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
                  Tue - Sun: Open<br />
                  Mon: Closed
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
          NOW PLAYING: {movies.filter(function (m) { return m.active && isMovieActive(m) && !isComingSoon(m); }).map(function (m) { return m.title.toUpperCase(); }).join(' \u00b7 ')} &nbsp;|&nbsp; TUESDAY $7 MOVIE DAY &nbsp;|&nbsp;
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
