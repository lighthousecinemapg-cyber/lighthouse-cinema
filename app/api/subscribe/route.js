// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// /app/api/subscribe/route.js  (Next.js App Router API Route)
//
// POST /api/subscribe
// Accepts: { firstName, lastName, email, phone }
// Sends to: Mailchimp + Square Customers API
//
// ENVIRONMENT VARIABLES REQUIRED (set in Vercel dashboard):
//   MAILCHIMP_API_KEY        â Mailchimp API key (e.g. abc123-us21)
//   MAILCHIMP_AUDIENCE_ID    â Mailchimp audience/list ID
//   MAILCHIMP_SERVER_PREFIX  â Mailchimp data center (e.g. us21)
//   SQUARE_ACCESS_TOKEN      â Square API access token
//   SQUARE_ENVIRONMENT       â "production" or "sandbox"
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

import { NextResponse } from 'next/server';
import { addToMailchimp } from '@/lib/mailchimp';
import { addToSquare } from '@/lib/square';

// --- Input validation ---
function validateInput(body) {
  const errors = [];

  if (!body.firstName || typeof body.firstName !== 'string' || body.firstName.trim().length < 1) {
    errors.push('First name is required.');
  }
  if (body.firstName && body.firstName.trim().length > 100) {
    errors.push('First name is too long.');
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (body.phone && typeof body.phone === 'string') {
    const cleaned = body.phone.replace(/[\s\-\(\)\+\.]/g, '');
    if (cleaned.length > 0 && (cleaned.length < 7 || cleaned.length > 15 || !/^\d+$/.test(cleaned))) {
      errors.push('Please enter a valid phone number.');
    }
  }

  if (body.lastName && typeof body.lastName === 'string' && body.lastName.trim().length > 100) {
    errors.push('Last name is too long.');
  }

  return errors;
}

// --- Rate limiting (simple in-memory, per-IP) ---
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;            // 5 requests per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimit.delete(ip);
    }
  }
}, 5 * 60 * 1000);


// âââââââââââ POST HANDLER âââââââââââ
export async function POST(request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // Validate
    const errors = validateInput(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors[0] },
        { status: 400 }
      );
    }

    // Clean data
    const data = {
      firstName: body.firstName.trim(),
      lastName: (body.lastName || '').trim(),
      email: body.email.trim().toLowerCase(),
      phone: (body.phone || '').trim(),
    };

    // Send to both services in parallel
    const results = await Promise.allSettled([
      addToMailchimp(data),
      addToSquare(data),
    ]);

    const [mailchimpResult, squareResult] = results;

    // Log any failures (but don't fail the user)
    if (mailchimpResult.status === 'rejected') {
      console.error('[Subscribe] Mailchimp error:', mailchimpResult.reason?.message || mailchimpResult.reason);
    }
    if (squareResult.status === 'rejected') {
      console.error('[Subscribe] Square error:', squareResult.reason?.message || squareResult.reason);
    }

    // If BOTH failed, return error
    if (mailchimpResult.status === 'rejected' && squareResult.status === 'rejected') {
      return NextResponse.json(
        { success: false, message: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // Success (even if one service had issues)
    return NextResponse.json({
      success: true,
      message: "You're in! Check your inbox.",
      details: {
        mailchimp: mailchimpResult.status === 'fulfilled' ? 'ok' : 'failed',
        square: squareResult.status === 'fulfilled' ? 'ok' : 'failed',
      },
    });

  } catch (error) {
    console.error('[Subscribe] Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
