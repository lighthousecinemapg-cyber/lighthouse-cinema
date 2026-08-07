'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const gold = '#d4af37';

export default function TicketButton({ slug, movieTitle, time, screen, price, dateLabel, fallbackLink }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    if (loading) return;
    setLoading(true);
    // 1) Dynamic per-showtime Square checkout (movie/date/time/screen baked into the order)
    try {
      const res = await fetch('/api/square/payment-link', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ movieTitle, dateLabel, time, price, quantity: 1, ticketType: 'Adult', screen: screen || null }),
      });
      if (res.ok) { const d = await res.json(); if (d && d.url) { window.location.href = d.url; return; } }
    } catch (e) {}
    // 2) Fallback: create an internal reservation + notify, then a transition page that preserves the screening
    try {
      let ref = '';
      const h = await fetch('/api/checkout/hold', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, movieTitle, date: dateLabel, time, screen: screen || '', ticketType: 'Adult', quantity: 1, price }),
      });
      if (h.ok) { const hd = await h.json(); ref = (hd && hd.ref) || ''; }
      const p = new URLSearchParams({ m: movieTitle, d: dateLabel, t: time, s: screen ? String(screen) : '', q: '1', tt: 'Adult', ref, url: fallbackLink || 'https://square.link/u/YqvdJLdp' });
      window.location.href = '/checkout/hold?' + p.toString();
    } catch (e) { window.location.href = fallbackLink || 'https://square.link/u/YqvdJLdp'; }
  }
  return (
    <motion.button onClick={go} disabled={loading} aria-label={'Buy tickets for ' + movieTitle + ' at ' + time}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={{ duration: 0.2 }}
      style={{ background: loading ? '#8a7420' : gold, color: '#000', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: '0.95rem', fontWeight: 800, cursor: loading ? 'wait' : 'pointer', minWidth: 92 }}>
      {loading ? '…' : time}
    </motion.button>
  );
}
