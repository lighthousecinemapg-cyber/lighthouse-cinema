// POST /api/square/webhook — Square payment event notifications.
// Verifies the Square HMAC-SHA256 signature, then sends deposit/success and
// failed-payment alerts to Slack (SLACK_WEBHOOK_URL) and owner SMS (Twilio).
// Never logs or forwards card data.
//
// ENV: SQUARE_WEBHOOK_SIGNATURE_KEY, SQUARE_WEBHOOK_URL (the exact notification
//      URL configured in Square), SLACK_WEBHOOK_URL (optional), TWILIO_* (optional)
import crypto from 'crypto';
import { sendSMSAlert } from '@/lib/daily-digest';

async function slack(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) { console.log('[SQ-WEBHOOK] Slack not configured. Payload:', text); return; }
  try { await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) }); }
  catch (e) { console.error('[SQ-WEBHOOK] Slack failed:', e.message); }
}

function verify(rawBody, signature) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url) return { ok: false, reason: 'not_configured' };
  if (!signature) return { ok: false, reason: 'no_signature' };
  const hmac = crypto.createHmac('sha256', key).update(url + rawBody).digest('base64');
  try {
    const a = Buffer.from(hmac);
    const b = Buffer.from(signature);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return { ok: true };
  } catch (e) {}
  return { ok: false, reason: 'mismatch' };
}

export async function POST(request) {
  const raw = await request.text();
  const sig = request.headers.get('x-square-hmacsha256-signature');
  const v = verify(raw, sig);

  if (v.reason === 'not_configured') {
    // Accept so Square doesn't retry-storm; take no action until keys are set.
    console.warn('[SQ-WEBHOOK] Received event but SQUARE_WEBHOOK_SIGNATURE_KEY/URL not set — ignoring.');
    return Response.json({ ok: true, note: 'not configured' });
  }
  if (!v.ok) {
    console.error('[SQ-WEBHOOK] Signature verification failed:', v.reason);
    return Response.json({ error: 'invalid signature' }, { status: 401 });
  }

  let body;
  try { body = JSON.parse(raw); } catch (e) { return Response.json({ error: 'bad json' }, { status: 400 }); }

  const type = body.type || '';
  const payment = body.data?.object?.payment || {};
  const status = payment.status || '';
  const amount = payment.amount_money ? '$' + (Number(payment.amount_money.amount || 0) / 100).toFixed(2) : '';
  const orderId = payment.order_id || '';

  try {
    if (type.startsWith('payment') && status === 'COMPLETED') {
      const msg = `✅ Payment received ${amount}${orderId ? ' · order ' + orderId : ''}`;
      await slack(msg); await sendSMSAlert(msg);
    } else if (type.startsWith('payment') && (status === 'FAILED' || status === 'CANCELED')) {
      const msg = `⚠️ Payment ${status.toLowerCase()} ${amount}${orderId ? ' · order ' + orderId : ''} — follow up needed`;
      await slack(msg); await sendSMSAlert(msg);
    } else if (type.startsWith('refund')) {
      const r = body.data?.object?.refund || {};
      const ra = r.amount_money ? '$' + (Number(r.amount_money.amount || 0) / 100).toFixed(2) : '';
      const msg = `↩️ Refund ${r.status || ''} ${ra}`.trim();
      await slack(msg); await sendSMSAlert(msg);
    } else {
      console.log('[SQ-WEBHOOK] Unhandled event type:', type, status);
    }
  } catch (e) { console.error('[SQ-WEBHOOK] handler error:', e.message); }

  return Response.json({ ok: true });
}
