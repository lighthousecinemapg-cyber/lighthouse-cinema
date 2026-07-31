// ═══════════════════════════════════════════════════════════════
// /lib/square-payment-links.js — Square Payment Links API
//
// Creates a unique Square-hosted checkout link for ONE ticket
// purchase, with the movie + date + showtime baked into the
// line-item name so the showtime is visible on Square's checkout
// page, on the receipt/confirmation, and in the Square dashboard.
//
// REQUIRED ENV VARS:
//   SQUARE_ACCESS_TOKEN   — Your Square API access token
//   SQUARE_LOCATION_ID    — Your Square location ID
//   SQUARE_ENVIRONMENT    — "production" or "sandbox" (default production)
// ═══════════════════════════════════════════════════════════════

const SQUARE_VERSION = '2024-01-18';

function getBaseUrl() {
  const env = process.env.SQUARE_ENVIRONMENT || 'production';
  return env === 'sandbox'
    ? 'https://connect.squareupsandbox.com/v2'
    : 'https://connect.squareup.com/v2';
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
  };
}

function idempotencyKey() {
  return `plink_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a Square payment link for a movie ticket.
 *
 * @param {Object}  p
 * @param {string}  p.movieTitle   — e.g. "Moana"
 * @param {string}  p.dateLabel    — e.g. "Saturday, July 11"
 * @param {string}  p.time         — e.g. "1:00 PM"
 * @param {number}  p.amountCents  — per-ticket price in cents (e.g. 1500)
 * @param {number}  [p.quantity]   — number of tickets (default 1)
 * @param {string}  [p.ticketType] — "Adult" | "Senior" | "Child"
 * @param {string}  [p.note]       — optional order note
 * @returns {Promise<{url:string,id:string,orderId:string}>}
 */
export async function createTicketPaymentLink({
  movieTitle,
  dateLabel,
  time,
  amountCents,
  quantity = 1,
  ticketType = 'Adult',
  screen,
  note,
}) {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Square access token is not configured.');
  }
  if (!process.env.SQUARE_LOCATION_ID) {
    throw new Error('Square location ID is not configured.');
  }

  const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
  // The showtime lives IN the line-item name so Square shows it everywhere.
  const screenLabel = screen ? ` — Screen ${screen}` : '';
  const itemName = `${movieTitle} — ${dateLabel} — ${time}${screenLabel}`;
  const noteText =
    note || `${movieTitle} | ${dateLabel} | ${time}${screen ? ' | Screen ' + screen : ''} | ${ticketType} x${qty}`;

  // Human-friendly confirmation number stored on the order (reference_id) and
  // carried to our own confirmation page after payment.
  const confRef = 'LH-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
  const totalCents = amountCents * qty;
  const redirectParams = new URLSearchParams({
    m: movieTitle,
    d: dateLabel || '',
    t: time,
    q: String(qty),
    amt: String(totalCents),
    tt: ticketType,
    s: screen ? String(screen) : '',
    ref: confRef,
  });
  const SITE = 'https://lighthousepgcinema.com';

  const body = {
    idempotency_key: idempotencyKey(),
    order: {
      location_id: process.env.SQUARE_LOCATION_ID,
      reference_id: confRef,
      line_items: [
        {
          name: itemName,
          quantity: String(qty),
          base_price_money: { amount: amountCents, currency: 'USD' },
          note: `${ticketType} admission`,
        },
      ],
    },
    checkout_options: {
      allow_tipping: false,
      ask_for_shipping_address: false,
      redirect_url: `${SITE}/confirmation?${redirectParams.toString()}`,
    },
    // payment_note appears on the Square transaction record (dashboard).
    payment_note: noteText,
    description: itemName,
  };

  const res = await fetch(`${getBaseUrl()}/online-checkout/payment-links`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg =
      data.errors?.map((e) => e.detail).join('; ') || `HTTP ${res.status}`;
    console.error('[Square PaymentLinks] Create failed:', msg);
    throw new Error(`Payment link failed: ${msg}`);
  }

  const link = data.payment_link || {};
  return {
    url: link.url || link.long_url,
    id: link.id,
    orderId: link.order_id,
    confRef,
  };
}
