// ═══════════════════════════════════════════════════════════════
// /lib/square-orders.js — Retrieve an order from Square (system of record)
//
// Square stores the movie + date + showtime in each order's line-item
// name and the confirmation number in reference_id. This reads it back.
//
// REQUIRED ENV VARS: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
// NOTE: requires the token to have ORDERS_READ (and PAYMENTS_READ) permission.
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

// Parse "Movie — Saturday, July 12 · 1:00 PM" into parts.
function parseItemName(name) {
  const out = { movie: name || '', date: '', time: '' };
  if (!name) return out;
  const dash = name.split(' — ');
  if (dash.length >= 2) {
    out.movie = dash[0].trim();
    const rest = dash.slice(1).join(' — ');
    const dot = rest.split(' · ');
    out.date = (dot[0] || '').trim();
    out.time = (dot[1] || '').trim();
  }
  return out;
}

function normalize(o) {
  const items = (o.line_items || []).map((li) => ({
    name: li.name,
    qty: Number(li.quantity || 1),
    amountCents: Number((li.total_money && li.total_money.amount) || (li.base_price_money && li.base_price_money.amount) || 0),
  }));
  const first = items[0] || {};
  const parsed = parseItemName(first.name || '');
  const paid = (o.tenders || []).reduce((sum, t) => sum + Number((t.amount_money && t.amount_money.amount) || 0), 0);
  return {
    id: o.id,
    confRef: o.reference_id || null,
    state: o.state || null, // OPEN | COMPLETED | CANCELED
    createdAt: o.created_at || null,
    currency: (o.total_money && o.total_money.currency) || 'USD',
    totalCents: Number((o.total_money && o.total_money.amount) || 0),
    paidCents: paid,
    items,
    movie: parsed.movie,
    date: parsed.date,
    time: parsed.time,
    quantity: first.qty || 1,
  };
}

export async function getOrder(orderId) {
  if (!process.env.SQUARE_ACCESS_TOKEN) throw new Error('Square access token is not configured.');
  const res = await fetch(`${getBaseUrl()}/orders/${orderId}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data.errors && data.errors.map((e) => e.detail).join('; ')) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return normalize(data.order || {});
}

// Best-effort lookup by confirmation reference (reference_id) at our location.
export async function findOrderByRef(ref) {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    throw new Error('Square is not configured.');
  }
  const body = {
    location_ids: [process.env.SQUARE_LOCATION_ID],
    query: {
      filter: { reference_id_filter: { exact: ref } },
      sort: { sort_field: 'CREATED_AT', sort_order: 'DESC' },
    },
    limit: 1,
  };
  const res = await fetch(`${getBaseUrl()}/orders/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data.errors && data.errors.map((e) => e.detail).join('; ')) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const o = (data.orders || [])[0];
  return o ? normalize(o) : null;
}

// List recent real orders (paid/open) for the admin dashboard.
export async function listRecentOrders({ limit = 100 } = {}) {
  if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    throw new Error('Square is not configured.');
  }
  const body = {
    location_ids: [process.env.SQUARE_LOCATION_ID],
    query: {
      filter: { state_filter: { states: ['OPEN', 'COMPLETED'] } },
      sort: { sort_field: 'CREATED_AT', sort_order: 'DESC' },
    },
    limit,
  };
  const res = await fetch(`${getBaseUrl()}/orders/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data.errors && data.errors.map((e) => e.detail).join('; ')) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return (data.orders || []).map(normalize);
}
