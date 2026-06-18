'use client';
// app/pricing/page.js  ->  lighthousepgcinema.com/pricing
// Daily admission pricing. Computes today's price + correct Square checkout.

import { useState, useEffect } from 'react';

const gold = '#d4af37';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';

const LINKS = {
  general: 'https://square.link/u/YqvdJLdp',
  seven: 'https://square.link/u/bkzq4xI6',
  ten: 'https://square.link/u/wxooaH3l',
};

const WEEK = [
  { day: 'Monday', price: 'Closed', label: 'Closed', link: null },
  { day: 'Tuesday', price: '$7', label: 'Tuesday Movie Day — Every Movie, Every Show', link: LINKS.seven },
  { day: 'Wednesday', price: '$10', label: 'Midweek Movie Night — All Movies, All Showtimes', link: LINKS.ten },
  { day: 'Thursday', price: '$10', label: 'Thursday Movie Night — All Movies, All Showtimes', link: LINKS.ten },
  { day: 'Friday', price: '$15', label: 'Friday Premiere Night', link: LINKS.general },
  { day: 'Saturday', price: '$15', label: 'Saturday Big Screen Experience', link: LINKS.general },
  { day: 'Sunday', price: '$10', label: 'Sunday Family Movie Day — All Movies', link: LINKS.ten },
];

export default function PricingPage() {
  const [todayIdx, setTodayIdx] = useState(null);
  useEffect(() => {
    const js = new Date().getDay(); // 0=Sun..6=Sat
    setTodayIdx(js === 0 ? 6 : js - 1); // map to WEEK index (Mon=0)
  }, []);
  const today = todayIdx === null ? null : WEEK[todayIdx];

  return (
    <div>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1400 60%, #0a0a0a 100%)', borderBottom: '2px solid ' + gold, padding: '60px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ color: gold, letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 12 }}>Ticket Pricing</div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>Movie Tickets From Just $7</h1>
          <p style={{ color: textLight, fontSize: '1.1rem', maxWidth: 620, margin: '0 auto 26px', lineHeight: 1.6 }}>Big screen. Premium sound. Fresh popcorn. A real movie-theater experience in Pacific Grove — for less than the cost of lunch.</p>
          {today && today.link && (
            <div style={{ background: darkCard, border: '1px solid ' + gold, borderRadius: 14, padding: '20px 24px', maxWidth: 520, margin: '0 auto', display: 'inline-block' }}>
              <div style={{ color: textMuted, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2 }}>Today — {today.day}</div>
              <div style={{ color: gold, fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.1 }}>{today.price}</div>
              <div style={{ color: textLight, fontSize: '0.95rem', margin: '4px 0 16px' }}>{today.label}</div>
              <a href={today.link} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '13px 32px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>Buy Tickets Now</a>
            </div>
          )}
          {today && !today.link && (
            <div style={{ color: textLight, fontSize: '1.1rem' }}>We're closed today — see you tomorrow! 🎬</div>
          )}
        </div>
      </section>

      {/* WEEKLY TABLE */}
      <section style={{ background: black, padding: '54px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 28px' }}>Pricing by Day</h2>
          <div style={{ border: '1px solid ' + darkBorder, borderRadius: 12, overflow: 'hidden' }}>
            {WEEK.map((d, i) => {
              const isToday = today && d.day === today.day;
              return (
                <div key={d.day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', background: isToday ? '#1a1400' : (i % 2 ? darkBg : darkCard), borderBottom: i < WEEK.length - 1 ? '1px solid ' + darkBorder : 'none', flexWrap: 'wrap' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', minWidth: 110 }}>{d.day}{isToday ? ' · Today' : ''}</div>
                  <div style={{ color: textMuted, fontSize: '0.9rem', flex: 1, minWidth: 180 }}>{d.label}</div>
                  <div style={{ color: d.price === 'Closed' ? textMuted : gold, fontWeight: 800, fontSize: '1.3rem' }}>{d.price}</div>
                </div>
              );
            })}
          </div>
          <p style={{ color: textMuted, fontSize: '0.85rem', textAlign: 'center', marginTop: 14 }}>Pricing is general admission and applies to all movies and all showtimes that day. Special events may vary.</p>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <a href={LINKS.general} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '13px 32px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>See Showtimes & Buy Tickets</a>
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', padding: '50px 0', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold, textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 10px' }}>Why Stay Home?</h2>
          <p style={{ color: textLight, margin: '0 0 8px', lineHeight: 1.6 }}>Giant screen · premium sound · comfortable seating · family-friendly · fresh popcorn. A real night out in Pacific Grove for the price of a coffee and a snack.</p>
          <p style={{ color: gold, fontWeight: 700, margin: '6px 0 0' }}>$7 Tuesdays · $10 Wednesday, Thursday & Sunday</p>
        </div>
      </section>
    </div>
  );
}

export const dynamic = 'force-dynamic';
