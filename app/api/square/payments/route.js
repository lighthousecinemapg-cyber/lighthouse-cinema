// ═══════════════════════════════════════════════════════════════
// /app/api/square/payments/route.js — Payment Processing API
//
// POST /api/square/payments — Create a payment
// GET  /api/square/payments?id=xxx — Get payment status
// ═══════════════════════════════════════════════════════════════

import { createPayment, getPayment } from '@/lib/square-payments';
import { addToSquare } from '@/lib/square';
import { accumulatePoints, findLoyaltyAccount } from '@/lib/square-loyalty';

// Simple rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `pay_${ip}`;
  const entry = rateLimit.get(key);

  if (!entry || now - entry.ts > RATE_LIMIT_WINDOW) {
    rateLimit.set(key, { ts: now, count: 1 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}


export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sourceId, amountCents, currency, note, referenceId, customer, earnLoyaltyPoints } = body;

    // Validation
    if (!sourceId) {
      return Response.json({ error: 'Payment source is required.' }, { status: 400 });
    }
    if (!amountCents || amountCents < 100) {
      return Response.json({ error: 'Amount must be at least $1.00.' }, { status: 400 });
    }

    // 1. Sync customer to Square (if provided)
    let customerId;
    if (customer?.email) {
      try {
        const customerResult = await addToSquare({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email,
          phone: customer.phone || '',
        });
        customerId = customerResult.customerId;
      } catch (err) {
        console.warn('[Payment API] Customer sync failed (non-fatal):', err.message);
      }
    }

    // 2. Process payment
    const payment = await createPayment({
      sourceId,
      amountCents,
      currency: currency || 'USD',
      customerId,
      note: note || 'Lighthouse Cinema — Online Purchase',
      referenceId,
    });

    // 3. Award loyalty points (if applicable)
    let loyaltyResult = null;
    if (earnLoyaltyPoints && customer?.phone) {
      try {
        const account = await findLoyaltyAccount(customer.phone);
        if (account) {
          // 1 point per dollar spent
          const points = Math.floor(amountCents / 100);
          if (points > 0) {
            await accumulatePoints({ accountId: account.id, points });
            loyaltyResult = { pointsEarned: points, newBalance: account.balance + points };
          }
        }
      } catch (err) {
        console.warn('[Payment API] Loyalty points failed (non-fatal):', err.message);
      }
    }

    return Response.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: `$${(amountCents / 100).toFixed(2)}`,
        receiptUrl: payment.receipt_url,
      },
      loyalty: loyaltyResult,
    });

  } catch (err) {
    console.error('[Payment API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Payment processing failed.' },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return Response.json({ error: 'Payment ID is required.' }, { status: 400 });
    }

    const payment = await getPayment(paymentId);

    return Response.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amountCents: Number(payment.amount_money?.amount || 0),
        amount: `$${(Number(payment.amount_money?.amount || 0) / 100).toFixed(2)}`,
        receiptUrl: payment.receipt_url,
        createdAt: payment.created_at,
      },
    });

  } catch (err) {
    return Response.json(
      { error: err.message || 'Failed to retrieve payment.' },
      { status: 500 }
    );
  }
}
