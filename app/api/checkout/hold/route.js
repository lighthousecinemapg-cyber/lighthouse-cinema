// POST /api/checkout/hold
// TEMPORARY FALLBACK used only when the dynamic Square checkout is not yet
// credential-configured. It preserves the exact screening selection, creates an
// internal reservation reference, notifies management (Slack + SMS), logs durably,
// and returns the reference. It does NOT record a Square order — the response
// explicitly reports recordedInSquare:false. Never represent this as a completed
// Square transaction.

import { sendSMSAlert } from '@/lib/daily-digest';

function genRef() {
  return 'LHR-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

async function notifyManagement(r) {
  const line =
    'TEMP-FALLBACK reservation ' + r.ref + ' — ' + r.movieTitle + ' | ' + r.date + ' | ' + r.time +
    (r.screen ? ' | Screen ' + r.screen : '') + ' | ' + r.ticketType + ' x' + r.quantity + ' (' + r.price +
    '). Customer sent to generic Square checkout; NOT yet recorded in Square.';
  // Durable log first so nothing is lost even if Slack/SMS are unconfigured.
  console.log('[CHECKOUT-HOLD]', line);
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: ':tickets: ' + line }),
      });
    } catch (e) { console.error('[CHECKOUT-HOLD] Slack error:', e.message); }
  } else {
    console.log('[CHECKOUT-HOLD] Slack not configured (set SLACK_WEBHOOK_URL).');
  }
  try { await sendSMSAlert(line); } catch (e) { /* SMS optional */ }
}

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const r = {
    ref: genRef(),
    slug: String(body.slug || ''),
    movieTitle: String(body.movieTitle || 'Movie'),
    date: String(body.date || ''),
    time: String(body.time || ''),
    screen: body.screen ? String(body.screen) : '',
    ticketType: String(body.ticketType || 'Adult'),
    quantity: Math.max(1, Math.min(20, parseInt(body.quantity, 10) || 1)),
    price: String(body.price || ''),
    fallback: true,
    createdAt: new Date().toISOString(),
  };
  try { await notifyManagement(r); } catch (e) { console.error('[CHECKOUT-HOLD] notify error:', e.message); }
  return Response.json({ ok: true, fallback: true, recordedInSquare: false, ref: r.ref });
}
