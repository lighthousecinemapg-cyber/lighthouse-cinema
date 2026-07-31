// POST /api/square/payment-link
// Body: { movieTitle, dateLabel, time, price, quantity, ticketType }
// Returns: { ok:true, url } — a Square checkout link whose line item is
//          named "<Movie> — <Date> · <Time>" so the showtime is preserved
//          on Square's checkout page, receipt, and dashboard.

import { createTicketPaymentLink } from '@/lib/square-payment-links';

export async function POST(request) {
  try {
    const body = await request.json();
    const { movieTitle, dateLabel, time, price, quantity, ticketType, screen } = body || {};

    if (!movieTitle || !time || !price) {
      return Response.json(
        { error: 'movieTitle, time, and price are required.' },
        { status: 400 }
      );
    }

    const amountCents = Math.round(
      parseFloat(String(price).replace(/[^0-9.]/g, '')) * 100
    );
    if (!amountCents || amountCents < 100) {
      return Response.json({ error: 'Invalid price.' }, { status: 400 });
    }

    const link = await createTicketPaymentLink({
      movieTitle,
      dateLabel: dateLabel || '',
      time,
      amountCents,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      ticketType: ticketType || 'Adult',
      screen: screen || null,
    });

    if (!link.url) throw new Error('Square did not return a checkout URL.');

    return Response.json({ ok: true, url: link.url, orderId: link.orderId });
  } catch (err) {
    console.error('[payment-link API] Error:', err.message);
    // 503 signals "not configured / upstream failed" so the client can
    // fall back to the existing static Square links gracefully.
    return Response.json(
      { error: err.message || 'Failed to create payment link.' },
      { status: 503 }
    );
  }
}
