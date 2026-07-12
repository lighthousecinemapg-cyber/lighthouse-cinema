'use client';
// Shared branded ticket card: QR, details, calendar, directions, support, print.
import { useMemo } from 'react';

const gold = '#d4af37';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';

const ADDRESS = '525 Lighthouse Ave, Pacific Grove, CA 93950';
const PHONE = '(831) 717-3124';
const EMAIL = 'lighthousecinemapg@gmail.com';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Lighthouse Cinema, ' + ADDRESS);

const MONTHS = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };

function parseWhen(dateStr, timeStr) {
  try {
    // dateStr like "Saturday, July 12"; timeStr like "7:30 PM"
    const md = (dateStr || '').replace(/^[A-Za-z]+,\s*/, '');
    const parts = md.split(' ');
    const month = MONTHS[parts[0]];
    const day = parseInt(parts[1], 10);
    if (month == null || !day) return null;
    let [hm, period] = (timeStr || '').split(' ');
    let [h, m] = hm.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const year = new Date().getFullYear();
    return new Date(year, month, day, h || 0, m || 0, 0);
  } catch (e) { return null; }
}

function stamp(d) {
  return (
    d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') + '00'
  );
}

export default function TicketCard({ movie, poster, rating, runtime, date, time, qty, amountCents, ticketType, confRef, orderId, status }) {
  const start = useMemo(() => parseWhen(date, time), [date, time]);
  const end = start ? new Date(start.getTime() + 2 * 60 * 60 * 1000) : null;

  const ticketUrl =
    'https://lighthousepgcinema.com/my-tickets?ref=' + encodeURIComponent(confRef || '') +
    (orderId ? '&order=' + encodeURIComponent(orderId) : '');
  const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=190x190&margin=8&data=' + encodeURIComponent(ticketUrl);

  const gcalHref = start
    ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
      encodeURIComponent(movie + ' at Lighthouse Cinema') +
      '&dates=' + stamp(start) + '/' + stamp(end) +
      '&location=' + encodeURIComponent(ADDRESS) +
      '&details=' + encodeURIComponent('Your tickets: ' + ticketUrl)
    : null;

  function downloadIcs() {
    if (!start) return;
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lighthouse Cinema//EN',
      'BEGIN:VEVENT',
      'UID:' + (confRef || orderId || Date.now()) + '@lighthousepgcinema.com',
      'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + stamp(start),
      'DTEND:' + stamp(end),
      'SUMMARY:' + movie + ' at Lighthouse Cinema',
      'LOCATION:' + ADDRESS,
      'DESCRIPTION:Your tickets: ' + ticketUrl,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (movie || 'ticket').replace(/[^a-z0-9]/gi, '-') + '.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  const btn = { padding: '11px 18px', borderRadius: 8, border: '1px solid ' + gold, background: 'transparent', color: gold, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const btnGold = { ...btn, background: gold, color: '#000', border: 'none' };

  return (
    <div>
      <div style={{ background: darkCard, border: '2px solid ' + gold, borderRadius: 16, overflow: 'hidden' }}>
        {/* Top: movie + QR */}
        <div style={{ display: 'flex', gap: 18, padding: 20, flexWrap: 'wrap' }}>
          {poster && (
            <img src={poster} alt={movie + ' poster'} style={{ width: 110, borderRadius: 10, border: '1px solid ' + darkBorder, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: textMuted, fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800 }}>Your Ticket</div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: '4px 0 8px' }}>{movie}</h2>
            <div style={{ color: textLight, fontSize: '1.05rem', fontWeight: 700 }}>📅 {date}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
              <span style={{ fontSize: '1.4rem' }}>🕐</span>
              <span style={{ color: gold, fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{time}</span>
            </div>
            <div style={{ color: textMuted, fontSize: '0.85rem' }}>
              {rating ? rating + ' · ' : ''}{runtime ? runtime + ' · ' : ''}{ticketType} × {qty}
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <img src={qrSrc} alt="Ticket QR code" width={130} height={130} style={{ background: '#fff', borderRadius: 10, padding: 6 }} />
            <div style={{ color: textMuted, fontSize: '0.68rem', marginTop: 4 }}>Scan at the door</div>
          </div>
        </div>

        {/* Order meta */}
        <div style={{ borderTop: '1px dashed ' + darkBorder, padding: '14px 20px', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {confRef && (<div><div style={{ color: textMuted }}>Confirmation #</div><div style={{ color: '#fff', fontWeight: 700 }}>{confRef}</div></div>)}
          <div><div style={{ color: textMuted }}>Amount Paid</div><div style={{ color: '#fff', fontWeight: 700 }}>${(amountCents / 100).toFixed(2)}</div></div>
          <div><div style={{ color: textMuted }}>Status</div><div style={{ color: status === 'COMPLETED' ? '#4CAF50' : gold, fontWeight: 700 }}>{status === 'COMPLETED' ? 'Paid' : (status || 'Confirmed')}</div></div>
          {orderId && (<div><div style={{ color: textMuted }}>Order ID</div><div style={{ color: '#fff', fontWeight: 700, fontSize: '0.72rem' }}>{orderId}</div></div>)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
        {gcalHref && <a href={gcalHref} target="_blank" rel="noopener noreferrer" style={btnGold}>📅 Google Calendar</a>}
        {start && <button onClick={downloadIcs} style={btn}>⬇ Add to Calendar (.ics)</button>}
        <button onClick={function () { window.print(); }} style={btn}>🖨 Print</button>
        <a href="/my-tickets" style={btn}>🎟️ Find My Tickets</a>
        <a href="/" style={btn}>← Home</a>
      </div>

      {/* Getting there */}
      <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: 18, marginTop: 20 }}>
        <h3 style={{ color: gold, fontSize: '1rem', margin: '0 0 8px' }}>Getting There</h3>
        <p style={{ color: textLight, margin: '0 0 6px' }}>{ADDRESS}</p>
        <a href={MAPS} target="_blank" rel="noopener noreferrer" style={{ color: gold, textDecoration: 'none', fontWeight: 700 }}>Open in Google Maps →</a>
        <p style={{ color: textMuted, fontSize: '0.85rem', margin: '10px 0 0' }}>
          🕒 Please arrive 15 minutes early to park and grab concessions. 🍿 The Bar &amp; Grill is open before showtime.
        </p>
      </div>

      {/* Support */}
      <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: 18, marginTop: 14 }}>
        <h3 style={{ color: gold, fontSize: '1rem', margin: '0 0 8px' }}>Need Help?</h3>
        <p style={{ color: textLight, margin: 0, fontSize: '0.9rem' }}>
          Call <a href={'tel:+18317173124'} style={{ color: gold }}>{PHONE}</a> · Email <a href={'mailto:' + EMAIL} style={{ color: gold }}>{EMAIL}</a> · <a href="/contact" style={{ color: gold }}>Contact page</a>
        </p>
        <p style={{ color: textMuted, margin: '8px 0 0', fontSize: '0.82rem' }}>Lost your ticket? Retrieve it anytime from <a href="/my-tickets" style={{ color: gold }}>My Tickets</a>.</p>
      </div>
    </div>
  );
}
