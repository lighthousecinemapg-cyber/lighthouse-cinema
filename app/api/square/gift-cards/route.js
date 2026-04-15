// ═══════════════════════════════════════════════════════════════
// /app/api/square/gift-cards/route.js — Gift Cards API
//
// POST /api/square/gift-cards              — Purchase a gift card
// GET  /api/square/gift-cards?gan=xxx      — Check balance
// POST /api/square/gift-cards (action=redeem) — Redeem at checkout
// POST /api/square/gift-cards (action=reload) — Add funds
// ═══════════════════════════════════════════════════════════════

import { purchaseGiftCard, checkBalance, redeemGiftCard, reloadGiftCard } from '@/lib/square-gift-cards';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gan = searchParams.get('gan');

    if (!gan) {
      return Response.json({ error: 'Gift card number (GAN) is required.' }, { status: 400 });
    }

    // Strip spaces/dashes from GAN
    const cleanGan = gan.replace(/[\s-]/g, '');

    if (cleanGan.length < 10) {
      return Response.json({ error: 'Invalid gift card number.' }, { status: 400 });
    }

    const result = await checkBalance(cleanGan);
    return Response.json({ success: true, ...result });

  } catch (err) {
    console.error('[Gift Cards API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Failed to check balance.' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ─── Redeem ─────────────────────────────────────────
    if (action === 'redeem') {
      const { giftCardId, amountCents } = body;

      if (!giftCardId || !amountCents) {
        return Response.json(
          { error: 'Gift card ID and amount are required.' },
          { status: 400 }
        );
      }

      const result = await redeemGiftCard({ giftCardId, amountCents });
      return Response.json({
        success: true,
        ...result,
        message: `Gift card redeemed! Remaining balance: ${result.remainingBalance}`,
      });
    }

    // ─── Reload ─────────────────────────────────────────
    if (action === 'reload') {
      const { giftCardId, amountCents } = body;

      if (!giftCardId || !amountCents || amountCents < 500) {
        return Response.json(
          { error: 'Gift card ID and amount (min $5.00) are required.' },
          { status: 400 }
        );
      }

      const result = await reloadGiftCard({ giftCardId, amountCents });
      return Response.json({
        success: true,
        ...result,
        message: `Funds added! New balance: ${result.newBalance}`,
      });
    }

    // ─── Purchase (default) ──────────────────────────────
    const { amountCents, buyerEmail, recipientName, message, sourceId } = body;

    if (!amountCents || amountCents < 500) {
      return Response.json(
        { error: 'Gift card amount must be at least $5.00.' },
        { status: 400 }
      );
    }

    if (!sourceId) {
      return Response.json(
        { error: 'Payment source is required.' },
        { status: 400 }
      );
    }

    const result = await purchaseGiftCard({
      amountCents,
      buyerEmail,
      recipientName,
      message,
      sourceId,
    });

    return Response.json({
      success: true,
      ...result,
      message: `Gift card created! Card number: ${result.giftCard.gan}`,
    });

  } catch (err) {
    console.error('[Gift Cards API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Gift card operation failed.' },
      { status: 500 }
    );
  }
}
