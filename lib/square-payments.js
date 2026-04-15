// ═══════════════════════════════════════════════════════════════
// /lib/square-payments.js — Square Payments API Integration
//
// Processes payments using the Square Payments API.
// Supports: one-time payments, card nonces from Web Payments SDK,
//           refunds, and payment status lookups.
//
// REQUIRED ENV VARS:
//   SQUARE_ACCESS_TOKEN   — Your Square API access token
//   SQUARE_LOCATION_ID    — Your Square location ID
//   SQUARE_ENVIRONMENT    — "production" or "sandbox"
// ═══════════════════════════════════════════════════════════════

function getBaseUrl() {
  const env = process.env.SQUARE_ENVIRONMENT || 'production';
  return env === 'sandbox'
    ? 'https://connect.squareupsandbox.com/v2'
    : 'https://connect.squareup.com/v2';
}

function idempotencyKey() {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const SQUARE_VERSION = '2024-01-18';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
  };
}

/**
 * Create a payment using a card nonce from the Web Payments SDK.
 */
export async function createPayment({
  sourceId,
  amountCents,
  currency = 'USD',
  customerId,
  note,
  referenceId,
  billingAddress,
}) {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Square access token is not configured.');
  }
  if (!process.env.SQUARE_LOCATION_ID) {
    throw new Error('Square location ID is not configured.');
  }

  const body = {
    idempotency_key: idempotencyKey(),
    source_id: sourceId,
    amount_money: {
      amount: amountCents,
      currency,
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    autocomplete: true,
  };

  if (customerId) body.customer_id = customerId;
  if (note) body.note = note;
  if (referenceId) body.reference_id = referenceId;

  if (billingAddress) {
    body.billing_address = {
      first_name: billingAddress.firstName,
      last_name: billingAddress.lastName,
      address_line_1: billingAddress.line1,
      locality: billingAddress.city,
      administrative_district_level_1: billingAddress.state,
      postal_code: billingAddress.zip,
      country: billingAddress.country || 'US',
    };
  }

  const response = await fetch(`${getBaseUrl()}/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    console.error('[Square Payments] Create failed:', errMsg);
    throw new Error(`Payment failed: ${errMsg}`);
  }

  console.log(`[Square Payments] Created: ${data.payment.id} — $${(amountCents / 100).toFixed(2)}`);
  return data.payment;
}


/**
 * Get a payment by ID.
 */
export async function getPayment(paymentId) {
  const response = await fetch(`${getBaseUrl()}/payments/${paymentId}`, {
    method: 'GET',
    headers: headers(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Get payment failed: ${data.errors?.[0]?.detail || response.status}`);
  }

  return data.payment;
}


/**
 * Refund a payment (full or partial).
 */
export async function refundPayment({ paymentId, amountCents, reason }) {
  const body = {
    idempotency_key: idempotencyKey(),
    payment_id: paymentId,
    amount_money: {
      amount: amountCents,
      currency: 'USD',
    },
  };

  if (reason) body.reason = reason;

  const response = await fetch(`${getBaseUrl()}/refunds`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Refund failed: ${errMsg}`);
  }

  console.log(`[Square Payments] Refund: ${data.refund.id} — $${(amountCents / 100).toFixed(2)}`);
  return data.refund;
}


/**
 * List recent payments for the location.
 */
export async function listPayments({ limit = 20, cursor } = {}) {
  const url = new URL(`${getBaseUrl()}/payments`);
  url.searchParams.set('location_id', process.env.SQUARE_LOCATION_ID);
  url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`List payments failed: ${data.errors?.[0]?.detail || response.status}`);
  }

  return {
    payments: data.payments || [],
    cursor: data.cursor || null,
  };
}
