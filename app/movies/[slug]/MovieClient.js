'use client';
import { useState } from 'react';

const gold = '#d4af37';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';

const VENUE = '525 Lighthouse Ave, Pacific Grove, CA 93950';

function dayPrice(day) {
  if (day === 'Tuesday') return '$7';
  if (day === 'Wednesday' || day === 'Thursday' || day === 'Sunday') return '$10';
  if (day === 'Friday' || day === 'Saturday') return '$15';
  return '$15';
}

// Next calendar date (YYYY-MM-DD) for a given weekday name, from today.
function nextDateForDay(dayName) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const target = names.indexOf(dayName);
  const d = new Date();
  for (let i = 0; i < 8; i++) {
    if (d.getDay() === target) break;
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function longDate(dateObj) {
  return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function to24(time) {
  const [hm, period] = time.split(' ');
  let [h, m] = hm.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h, m };
}

function gcalStamp(dateObj, time) {
  const { h, m } = to24(time);
  const d = new Date(dateObj);
  d.setHours(h, m, 0, 0);
  const end = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (x) =>
    x.getFullYear() +
    String(x.getMonth() + 1).padStart(2, '0') +
    String(x.getDate()).padStart(2, '0') +
    'T' +
    String(x.getHours()).padStart(2, '0') +
    String(x.getMinutes()).padStart(2, '0') +
    '00';
  return fmt(d) + '/' + fmt(end);
}

export default function MovieClient({ movie, showdays }) {
  const [trailer, setTrailer] = useState(false);
  const [loadingKey, setLoadingKey] = useState(null);

  async function buy(dayName, time, dateObj) {
    const key = dayName + time;
    const price = dayPrice(dayName);
    const dateLabel = longDate(dateObj);
    setLoadingKey(key);
    try {
      const res = await fetch('/api/square/payment-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          movieTitle: movie.title,
          dateLabel,
          time,
          price,
          quantity: 1,
          ticketType: 'Adult',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (e) {}
    // Graceful fallback to the movie's configured Square link
    const fb =
      (movie.ticketLinks && (movie.ticketLinks.default)) ||
      'https://square.link/u/YqvdJLdp';
    window.location.href = fb;
  }

  function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      navigator.share({ title: movie.title + ' — Lighthouse Cinema', url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  }

  // Earliest upcoming showtime for the calendar link
  const firstDay = showdays[0];
  const calDate = firstDay ? nextDateForDay(firstDay.day) : null;
  const calTime = firstDay && firstDay.times[0];
  const calHref =
    calDate && calTime
      ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent(movie.title + ' at Lighthouse Cinema') +
        '&dates=' +
        gcalStamp(calDate, calTime) +
        '&location=' +
        encodeURIComponent(VENUE) +
        '&details=' +
        encodeURIComponent('Tickets: https://lighthousepgcinema.com/movies/' + movie.slug)
      : null;

  const btn = {
    padding: '9px 16px', borderRadius: 8, border: '1px solid ' + gold,
    background: 'transparent', color: gold, fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
  };

  return (
    <div>
      {/* Trailer + actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {movie.trailerId && (
          <button onClick={function () { setTrailer(true); }} style={{ ...btn, background: gold, color: '#000', border: 'none' }}>
            ▶ Watch Trailer
          </button>
        )}
        <button onClick={share} style={btn} aria-label="Share this movie">↗ Share</button>
        {calHref && (
          <a href={calHref} target="_blank" rel="noopener noreferrer" style={btn}>📅 Add to Calendar</a>
        )}
      </div>

      {/* Showtimes */}
      <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px' }}>Showtimes &amp; Tickets</h2>
      <p style={{ color: textMuted, fontSize: '0.85rem', margin: '0 0 18px' }}>
        Pick a time to reserve. Your movie, date &amp; showtime stay with you all the way through checkout.
      </p>

      {showdays.length === 0 && (
        <p style={{ color: textMuted }}>Showtimes for this film will be announced soon.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {showdays.map(function (sd) {
          const dateObj = nextDateForDay(sd.day);
          return (
            <div key={sd.day} style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>{sd.label || sd.day}</span>
                <span style={{ color: gold, fontWeight: 700, fontSize: '0.9rem' }}>{dayPrice(sd.day)} / ticket</span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {sd.times.map(function (t) {
                  const key = sd.day + t;
                  const loading = loadingKey === key;
                  return (
                    <button
                      key={t}
                      onClick={function () { buy(sd.day, t, dateObj); }}
                      disabled={loading}
                      style={{
                        padding: '10px 18px', borderRadius: 8, border: '1px solid ' + gold,
                        background: loading ? gold : 'transparent', color: loading ? '#000' : '#fff',
                        fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'default' : 'pointer',
                      }}
                      title={'Buy tickets for ' + sd.day + ' ' + t}
                    >
                      {loading ? 'Loading…' : t + '  🎟️'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trailer modal */}
      {trailer && movie.trailerId && (
        <div
          onClick={function () { setTrailer(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={function (e) { e.stopPropagation(); }} style={{ width: '100%', maxWidth: 900, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={'https://www.youtube.com/embed/' + movie.trailerId + '?autoplay=1&rel=0'}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={movie.title + ' Trailer'}
            />
          </div>
          <button onClick={function () { setTrailer(false); }} aria-label="Close trailer" style={{ position: 'fixed', top: 20, right: 28, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', width: 44, height: 44, borderRadius: '50%' }}>&times;</button>
        </div>
      )}
    </div>
  );
}
