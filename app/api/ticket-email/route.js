// POST /api/ticket-email
// Body: { to, orderId?, movie?, date?, time?, qty?, amountCents?, confRef?, poster? }
// Emails a branded ticket. If orderId is given, missing fields are filled from Square.
import { sendTicketEmail, isEmailConfigured } from '@/lib/ticket-email';
import { getOrder } from '@/lib/square-orders';

export async function GET() {
  // Lightweight status probe (no secrets leaked).
  return Response.json({ configured: isEmailConfigured() });
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { to, orderId, movie, date, time, qty, amountCents, confRef, poster } = body || {};

    if (!isEmailConfigured()) {
      return Response.json(
        { error: 'Email delivery is not configured yet.', needsSmtp: true },
        { status: 503 }
      );
    }
    if (!to) return Response.json({ error: 'Recipient email is required.' }, { status: 400 });

    // Fill from Square if we have an order id but missing details.
    if (orderId && (!movie || !time)) {
      try {
        const o = await getOrder(orderId);
        movie = movie || o.movie;
        date = date || o.date;
        time = time || o.time;
        qty = qty || o.quantity;
        amountCents = amountCents || o.totalCents;
        confRef = confRef || o.confRef;
      } catch (e) { /* fall back to provided fields */ }
    }

    await sendTicketEmail({ to, movie, date, time, qty, amountCents, confRef, orderId, poster });
    return Response.json({ ok: true, sentTo: to });
  } catch (err) {
    if (err.code === 'NO_SMTP') {
      return Response.json({ error: 'Email delivery is not configured yet.', needsSmtp: true }, { status: 503 });
    }
    return Response.json({ error: err.message || 'Could not send email.' }, { status: 500 });
  }
}
