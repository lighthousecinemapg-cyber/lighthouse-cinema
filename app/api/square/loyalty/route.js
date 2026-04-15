// ═══════════════════════════════════════════════════════════════
// /app/api/square/loyalty/route.js — Loyalty Program API
//
// GET  /api/square/loyalty?phone=xxx  — Get loyalty dashboard
// POST /api/square/loyalty            — Enroll in loyalty program
// ═══════════════════════════════════════════════════════════════

import { getLoyaltyDashboard, enrollInLoyalty, redeemReward } from '@/lib/square-loyalty';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return Response.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // Normalize phone
    const normalized = normalizePhone(phone);
    const dashboard = await getLoyaltyDashboard(normalized);

    return Response.json({ success: true, ...dashboard });

  } catch (err) {
    console.error('[Loyalty API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Failed to fetch loyalty info.' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { action, phone, rewardTierId, accountId } = body;

    if (!phone) {
      return Response.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);

    // Enroll
    if (!action || action === 'enroll') {
      const result = await enrollInLoyalty(normalized);
      return Response.json({
        success: true,
        ...result,
        message: result.alreadyEnrolled
          ? 'You\'re already enrolled! Check your points balance.'
          : 'Welcome to the Lighthouse Cinema Rewards! Start earning points on every purchase.',
      });
    }

    // Redeem
    if (action === 'redeem') {
      if (!rewardTierId || !accountId) {
        return Response.json(
          { error: 'Account ID and reward tier are required for redemption.' },
          { status: 400 }
        );
      }

      const result = await redeemReward({ accountId, rewardTierId });
      return Response.json({
        success: true,
        event: result,
        message: 'Reward redeemed! Enjoy your perk.',
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (err) {
    console.error('[Loyalty API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Loyalty operation failed.' },
      { status: 500 }
    );
  }
}


function normalizePhone(phone) {
  // Strip non-digits
  const digits = phone.replace(/\D/g, '');
  // Add +1 if US number without country code
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}
