'use client';
import { useEffect, useState } from 'react';

const gold = '#d4af37';

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
      <span style={{ color: 'rgba(245,233,200,0.6)' }}>{label}</span>
      <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function CheckoutHoldPage() {
  const [q, setQ] = useState(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({
      movie: p.get('m') || 'Your movie',
      date: p.get('d') || '',
      time: p.get('t') || '',
      screen: p.get('s') || '',
      qty: p.get('q') || '1',
      tt: p.get('tt') || 'Adult',
      ref: p.get('ref') || '',
      url: p.get('url') || 'https://square.link/u/YqvdJLdp',
    });
  }, []);

  if (!q) return <main style={{ background: '#0a0a0a', minHeight: '100vh' }} />;

  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '48px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <h1 style={{ color: gold, fontSize: '1.6rem', margin: '0 0 6px' }}>You&rsquo;re almost there</h1>
        <p style={{ color: 'rgba(245,233,200,0.7)', margin: '0 0 20px' }}>Review your screening, then continue to secure checkout.</p>
        <div style={{ border: '1px solid ' + gold, borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>{q.movie}</div>
          {q.date ? <Row label="Date" value={q.date} /> : null}
          <Row label="Showtime" value={q.time} />
          {q.screen ? <Row label="Auditorium" value={'Screen ' + q.screen} /> : null}
          <Row label="Tickets" value={q.qty + ' × ' + q.tt} />
          {q.ref ? <Row label="Reservation" value={q.ref} /> : null}
        </div>
        <a href={q.url} style={{ display: 'block', textAlign: 'center', background: gold, color: '#000', fontWeight: 800, padding: '15px', borderRadius: 10, textDecoration: 'none', fontSize: '1.05rem' }}>Continue to Secure Checkout</a>
        <p style={{ color: 'rgba(245,233,200,0.5)', fontSize: '0.8rem', marginTop: 16, lineHeight: 1.6 }}>
          Your selection has been saved and our team has been notified{q.ref ? ' (reference ' + q.ref + ')' : ''}. Payment is completed securely on Square. This is a temporary checkout while our per-seat system is finalized &mdash; please keep your reservation reference.
        </p>
      </div>
    </main>
  );
}
