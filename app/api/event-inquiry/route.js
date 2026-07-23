// POST /api/event-inquiry — party / private-event / rental inquiries.
// Validates + sanitizes, protects against spam/dupes/header-injection,
// then captures + emails via the reliable inquiry pipeline.
import { submitInquiry } from '@/lib/inquiry';

const recent = new Map(); // in-memory dedupe / light rate-limit
const DUPE_WINDOW = 15 * 1000;
const CLEAN_WINDOW = 5 * 60 * 1000;

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const page = request.headers.get('referer') || '';
    const b = await request.json();

    const name = String(b.name || '').trim();
    const email = String(b.email || '').trim();
    const phone = String(b.phone || '').trim();

    // Honeypot: real users never fill this hidden field.
    if (b.company) return Response.json({ ok: true, ref: 'IGNORED' });

    if (!name || !email || !phone) {
      return Response.json({ error: 'Please provide your name, email, and phone number.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Duplicate protection.
    const key = email.toLowerCase() + '|' + (b.eventType || b.packageName || '');
    const nowT = Date.now();
    const last = recent.get(key);
    if (last && nowT - last < DUPE_WINDOW) {
      return Response.json({ error: "We've already received your request — our team will be in touch shortly." }, { status: 429 });
    }
    recent.set(key, nowT);
    for (const [k, t] of recent) if (nowT - t > CLEAN_WINDOW) recent.delete(k);

    const fields = {};
    const add = (label, val) => { if (val !== undefined && val !== null && String(val).trim() !== '') fields[label] = val; };
    add('Preferred Date', b.date);
    add('Preferred Time', b.timeSlotLabel);
    add('Package', b.packageName);
    add('Number of Guests', b.guests);
    add('Add-ons', Array.isArray(b.addons) ? b.addons.join(', ') : b.addons);
    add('Estimated Total', b.total);
    add('Movie Requested', b.movie);
    add('Special Requests / Notes', b.notes);

    const result = await submitInquiry({
      type: b.eventType || b.packageName || 'Private Event',
      name, email, phone, fields, page, ip,
    });

    return Response.json({ ok: true, ref: result.ref, emailSent: result.staffEmailSent });
  } catch (err) {
    console.error('[event-inquiry] error:', err.message);
    return Response.json(
      { error: 'Something went wrong. Please call (831) 241-6617 and we will take your request directly.' },
      { status: 500 }
    );
  }
}
