import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/events-db';

const STAFF_CODE = 'lighthouse2026';

function checkStaff(request) {
  const code = request.headers.get('x-staff-code');
  return code === STAFF_CODE;
}

// GET /api/events - return all events
export async function GET() {
  try {
    const events = getEvents();
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// PUT /api/events - update an event (staff only)
export async function PUT(request) {
  if (!checkStaff(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const updated = updateEvent(body.id, body);
    if (!updated) return Response.json({ error: 'Event not found' }, { status: 404 });
    return Response.json({ event: updated });
  } catch (error) {
    return Response.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/events?id=xxx - delete an event (staff only)
export async function DELETE(request) {
  if (!checkStaff(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleted = deleteEvent(id);
    if (!deleted) return Response.json({ error: 'Event not found' }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// /app/api/events/route.js — Event Request Handler
//
// Receives event request form submissions, then:
//   1. Creates/updates customer in Square (with "Event Lead" tag + note)
//   2. Sends SMS alert to owner via Twilio (the real "text me instantly")
//   3. Emails a backup to the owner
//
// Note on Square Messages: Square's public API does NOT expose an endpoint
// to inject messages into the Messages inbox programmatically. The closest
// production-ready path is:
//   - Create the customer in the Square Directory with full contact info
//   - Attach a detailed note (visible in customer profile)
//   - Tag them with a customer group like "Event Lead"
//   - Send the owner an SMS via Twilio so they can reply from Square Messages
// This gives the owner a one-tap path to respond via Square's own Messages
// app on their phone, which is what actually drives conversion.

import nodemailer from 'nodemailer';

// ---- Config ----
const SQUARE_BASE = process.env.SQUARE_ENVIRONMENT === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

const squareHeaders = {
  'Square-Version': '2024-01-18',
  'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

// ---- Rate limiting (in-memory, per IP) ----
const rateLimit = new Map();
const RATE_WINDOW_MS = 60 * 1000;   // 1 minute
const RATE_MAX = 3;                 // max 3 submissions per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + RATE_WINDOW_MS; }
  entry.count += 1;
  rateLimit.set(ip, entry);
  return entry.count <= RATE_MAX;
}

// ---- Helpers ----
function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

function formatMessage(d) {
  return [
    '🎬 NEW EVENT REQUEST — Lighthouse Cinema',
    '',
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email || '—'}`,
    `Event Type: ${d.eventType}`,
    `Date: ${d.eventDate}`,
    `Guests: ${d.guests}`,
    `Budget: ${d.budget || '—'}`,
    '',
    `Message: ${d.message || '—'}`,
  ].join('\n');
}

// ---- Square: find or create customer ----
async function upsertSquareCustomer({ name, phone, email }) {
  const [givenName, ...rest] = (name || '').trim().split(' ');
  const familyName = rest.join(' ');

  // 1. Search by phone
  const searchRes = await fetch(`${SQUARE_BASE}/v2/customers/search`, {
    method: 'POST',
    headers: squareHeaders,
    body: JSON.stringify({
      query: { filter: { phone_number: { exact: phone } } },
      limit: 1,
    }),
  });
  const searchData = await searchRes.json();
  if (searchData.customers?.length) {
    return searchData.customers[0];
  }

  // 2. Create new
  const createRes = await fetch(`${SQUARE_BASE}/v2/customers`, {
    method: 'POST',
    headers: squareHeaders,
    body: JSON.stringify({
      given_name: givenName,
      family_name: familyName || undefined,
      phone_number: phone,
      email_address: email || undefined,
      note: 'Source: Event Request Form',
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(createData.errors?.[0]?.detail || 'Failed to create Square customer');
  }
  return createData.customer;
}

// ---- Square: add event details as a customer note ----
async function updateCustomerNote(customerId, note) {
  const res = await fetch(`${SQUARE_BASE}/v2/customers/${customerId}`, {
    method: 'PUT',
    headers: squareHeaders,
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Failed to update customer note', err);
  }
}

// ---- Square: tag customer with "Event Lead" group ----
async function tagEventLead(customerId) {
  const groupId = process.env.SQUARE_EVENT_LEAD_GROUP_ID;
  if (!groupId) {
    console.warn('SQUARE_EVENT_LEAD_GROUP_ID not set — skipping tag');
    return;
  }
  const res = await fetch(
    `${SQUARE_BASE}/v2/customers/${customerId}/groups/${groupId}`,
    { method: 'PUT', headers: squareHeaders }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Failed to tag customer', err);
  }
}

// ---- Twilio: SMS alert to owner ----
async function sendOwnerSMS(messageBody) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.OWNER_PHONE_NUMBER;
  if (!sid || !token || !from || !to) {
    console.warn('Twilio not configured — skipping owner SMS');
    return;
  }
  const body = new URLSearchParams({ From: from, To: to, Body: messageBody });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('Twilio send failed', err);
  }
}

// ---- Email backup to owner ----
async function sendOwnerEmail(subject, body) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.OWNER_EMAIL;
  if (!host || !user || !pass || !to) {
    console.warn('SMTP not configured — skipping owner email');
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: `"Lighthouse Cinema" <${user}>`,
    to,
    subject,
    text: body,
  });
}

// ---- Route handler ----
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return Response.json(
        { success: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const data = await request.json();

    // Honeypot
    if (data.website) {
      return Response.json({ success: true }); // silently accept
    }

    // Required fields
    const required = ['name', 'phone', 'eventType', 'eventDate', 'guests'];
    for (const field of required) {
      if (!data[field]) {
        return Response.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Phone normalization
    const normalizedPhone = normalizePhone(data.phone);
    if (!normalizedPhone) {
      return Response.json(
        { success: false, error: 'Invalid phone number.' },
        { status: 400 }
      );
    }

    const payload = { ...data, phone: normalizedPhone };
    const message = formatMessage(payload);

    // Log
    console.log('[event-request]', { ip, name: data.name, phone: normalizedPhone, type: data.eventType });

    // Fan out to Square + Twilio + Email in parallel. Don't fail the whole
    // request if one channel fails — the customer still gets their confirmation.
    const results = await Promise.allSettled([
      (async () => {
        const customer = await upsertSquareCustomer({
          name: data.name,
          phone: normalizedPhone,
          email: data.email,
        });
        await updateCustomerNote(customer.id, message);
        await tagEventLead(customer.id);
        return customer.id;
      })(),
      sendOwnerSMS(message),
      sendOwnerEmail(`🎬 Event Request: ${data.name} — ${data.eventType}`, message),
    ]);

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`Channel ${['square', 'twilio', 'email'][i]} failed:`, r.reason);
      }
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[event-request] fatal', err);
    return Response.json(
      { success: false, error: 'Server error. Please try again or text us directly.' },
      { status: 500 }
    );
  }
}
