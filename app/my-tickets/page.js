'use client';
// app/my-tickets/page.js -> lighthousepgcinema.com/my-tickets
// Retrieve a ticket by Square order number or confirmation number.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { movies } from '../showtime-config';
import TicketCard from '../ticket-shared/TicketCard';

const gold = '#d4af37';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';

function MyTicketsInner() {
  const sp = useSearchParams();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(value) {
    const v = (value || '').trim();
    if (!v) { setError('Enter your order or confirmation number.'); return; }
    setLoading(true); setError(''); setOrder(null);
    const qs = v.toUpperCase().startsWith('LH-') ? 'ref=' + encodeURIComponent(v) : 'id=' + encodeURIComponent(v);
    try {
      let res = await fetch('/api/order?' + qs);
      // If an id lookup fails, retry as a reference (and vice-versa).
      if (!res.ok) {
        const alt = qs.startsWith('ref=') ? 'id=' + encodeURIComponent(v) : 'ref=' + encodeURIComponent(v);
        const res2 = await fetch('/api/order?' + alt);
        if (res2.ok) res = res2;
      }
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else if (data.needsScope) {
        setError('Ticket lookup is being finalized. Please call (831) 717-3124 and we will pull up your order.');
      } else {
        setError("We couldn't find that order. Double-check the number, or call us at (831) 717-3124.");
      }
    } catch (e) {
      setError('Something went wrong. Please try again or call (831) 717-3124.');
    }
    setLoading(false);
  }

  // Auto-load when arriving from a QR code / confirmation link.
  useEffect(() => {
    const pre = sp.get('order') || sp.get('ref');
    if (pre) { setInput(pre); lookup(pre); }
    // eslint-disable-next-line
  }, []);

  const found = order ? movies.find((m) => m.title === order.movie) : null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px', color: textLight }}>
      <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,5vw,2.6rem)', fontWeight: 900, margin: '0 0 6px' }}>Find My Tickets</h1>
      <p style={{ color: textMuted, margin: '0 0 24px' }}>Enter your order number or confirmation number (starts with “LH-”). You'll find it on your confirmation page and Square receipt email.</p>

      <form onSubmit={function (e) { e.preventDefault(); lookup(input); }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <input
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          placeholder="Order # or LH-XXXX"
          aria-label="Order or confirmation number"
          style={{ flex: 1, minWidth: 220, background: '#0a0a0a', border: '1px solid ' + darkBorder, color: '#fff', padding: '13px 14px', borderRadius: 8, fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ background: gold, color: '#000', border: 'none', padding: '13px 26px', borderRadius: 8, fontWeight: 800, cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Looking…' : 'Find Tickets'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.4)', color: '#ffb4b0', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: '0.9rem' }}>{error}</div>
      )}

      {order && (
        <div style={{ marginTop: 22 }}>
          <TicketCard
            movie={order.movie}
            poster={found ? found.poster : null}
            rating={found ? found.rating : null}
            runtime={found ? found.runtime : null}
            date={order.date}
            time={order.time}
            qty={order.quantity}
            amountCents={order.totalCents}
            ticketType={'Ticket'}
            confRef={order.confRef}
            orderId={order.id}
            status={order.state}
          />
        </div>
      )}

      {!order && !error && (
        <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: 18, marginTop: 18 }}>
          <p style={{ color: textMuted, margin: 0, fontSize: '0.9rem' }}>
            Can't find your number? Call <a href="tel:+18317173124" style={{ color: gold }}>(831) 717-3124</a> or email <a href="mailto:lighthousecinemapg@gmail.com" style={{ color: gold }}>lighthousecinemapg@gmail.com</a> and we'll look it up for you.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MyTicketsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Loading…</div>}>
      <MyTicketsInner />
    </Suspense>
  );
}
