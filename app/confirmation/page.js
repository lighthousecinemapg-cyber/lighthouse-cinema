'use client';
// app/confirmation/page.js -> lighthousepgcinema.com/confirmation
// Branded post-payment confirmation. Square redirects here after checkout
// with the movie/date/showtime we passed, and appends orderId/transactionId.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { movies } from '../showtime-config';
import TicketCard from '../ticket-shared/TicketCard';

function ConfirmationInner() {
  const sp = useSearchParams();
  const [status, setStatus] = useState(null);

  const movie = sp.get('m') || '';
  const date = sp.get('d') || '';
  const time = sp.get('t') || '';
  const qty = parseInt(sp.get('q') || '1', 10);
  const amt = parseInt(sp.get('amt') || '0', 10);
  const ticketType = sp.get('tt') || 'Adult';
  const ref = sp.get('ref') || '';
  const orderId = sp.get('orderId') || sp.get('order') || '';

  // Best-effort: confirm paid status from Square (won't block render).
  useEffect(() => {
    if (!orderId) return;
    fetch('/api/order?id=' + encodeURIComponent(orderId))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.order) setStatus(d.order.state); })
      .catch(() => {});
  }, [orderId]);

  if (!movie && !ref && !orderId) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: '#e0e0e0' }}>
        <h1 style={{ color: '#d4af37' }}>Looking for your tickets?</h1>
        <p style={{ color: '#888', margin: '12px 0 28px' }}>Retrieve them anytime with your order or confirmation number.</p>
        <a href="/my-tickets" style={{ background: '#d4af37', color: '#000', padding: '13px 30px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Find My Tickets</a>
      </div>
    );
  }

  const found = movies.find((m) => m.title === movie);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px', color: '#e0e0e0' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '2.6rem' }}>✅</div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontWeight: 900, margin: '4px 0 6px' }}>Thank You — You're Booked!</h1>
        <p style={{ color: '#888', margin: 0 }}>
          {status === 'COMPLETED' ? 'Payment confirmed. ' : ''}Your tickets are ready. A receipt has been emailed to you by Square.
        </p>
      </div>

      <TicketCard
        movie={movie}
        poster={found ? found.poster : null}
        rating={found ? found.rating : null}
        runtime={found ? found.runtime : null}
        date={date}
        time={time}
        qty={qty}
        amountCents={amt}
        ticketType={ticketType}
        confRef={ref}
        orderId={orderId}
        status={status}
      />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Loading your confirmation…</div>}>
      <ConfirmationInner />
    </Suspense>
  );
}
