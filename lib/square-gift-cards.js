// ═══════════════════════════════════════════════════════════════
// /lib/square-gift-cards.js — Square Gift Cards API Integration
//
// Lets customers buy, check balance, and redeem gift cards
// directly on the Lighthouse Cinema website.
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

const SQUARE_VERSION = '2024-01-18';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
  };
}

function idempotencyKey() {
  return `gc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}


/**
 * Create a new gift card and activate it with an initial balance.
 * This is a two-step process: create the card, then load funds.
 *
 * @param {Object} params
 * @param {number} params.amountCents   — Initial balance in cents
 * @param {string} [params.buyerEmail]  — Email of the purchaser
 * @param {string} [params.recipientName] — Name of the recipient
 * @param {string} [params.message]     — Gift message
 * @param {string} params.sourceId      — Payment source (card nonce) to fund the gift card
 * @returns {Promise<Object>} — { giftCard, payment }
 */
export async function purchaseGiftCard({
  amountCents,
  buyerEmail,
  recipientName,
  message,
  sourceId,
}) {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('Square access token is not configured.');
  }

  // Step 1: Create the gift card
  const createResponse = await fetch(`${getBaseUrl()}/gift-cards`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      location_id: process.env.SQUARE_LOCATION_ID,
      gift_card: {
        type: 'DIGITAL',
      },
    }),
  });

  const createData = await createResponse.json();

  if (!createResponse.ok) {
    const errMsg = createData.errors?.map(e => e.detail).join('; ') || `HTTP ${createResponse.status}`;
    throw new Error(`Create gift card failed: ${errMsg}`);
  }

  const giftCard = createData.gift_card;

  // Step 2: Activate the gift card with funds using a payment
  const activateResponse = await fetch(`${getBaseUrl()}/gift-cards/${giftCard.id}/activities`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      gift_card_activity: {
        gift_card_id: giftCard.id,
        type: 'ACTIVATE',
        location_id: process.env.SQUARE_LOCATION_ID,
        activate_activity_details: {
          amount_money: {
            amount: amountCents,
            currency: 'USD',
          },
        },
      },
    }),
  });

  const activateData = await activateResponse.json();

  if (!activateResponse.ok) {
    const errMsg = activateData.errors?.map(e => e.detail).join('; ') || `HTTP ${activateResponse.status}`;
    throw new Error(`Activate gift card failed: ${errMsg}`);
  }

  console.log(`[Square Gift Cards] Created & activated: ${giftCard.gan} — $${(amountCents / 100).toFixed(2)}`);

  return {
    giftCard: {
      id: giftCard.id,
      gan: giftCard.gan, // Gift card account number
      state: 'ACTIVE',
      balanceCents: amountCents,
      balance: `$${(amountCents / 100).toFixed(2)}`,
    },
    recipientName: recipientName || null,
    message: message || null,
    buyerEmail: buyerEmail || null,
  };
}


/**
 * Check the balance of a gift card by its GAN (gift card account number).
 *
 * @param {string} gan — Gift card account number (16-digit number)
 * @returns {Promise<Object>} — { id, gan, state, balanceCents, balance }
 */
export async function checkBalance(gan) {
  // Look up by GAN
  const response = await fetch(`${getBaseUrl()}/gift-cards/from-gan`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ gan }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return { found: false, message: 'Gift card not found. Please check the number and try again.' };
    }
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Check balance failed: ${errMsg}`);
  }

  const card = data.gift_card;
  const balanceCents = Number(card.balance_money?.amount || 0);

  return {
    found: true,
    id: card.id,
    gan: card.gan,
    state: card.state,
    balanceCents,
    balance: `$${(balanceCents / 100).toFixed(2)}`,
  };
}


/**
 * Redeem (deduct) an amount from a gift card.
 * Use this during checkout to apply a gift card to a purchase.
 *
 * @param {Object} params
 * @param {string} params.giftCardId  — Gift card ID
 * @param {number} params.amountCents — Amount to deduct in cents
 * @returns {Promise<Object>} — { success, remainingBalanceCents, remainingBalance }
 */
export async function redeemGiftCard({ giftCardId, amountCents }) {
  const response = await fetch(`${getBaseUrl()}/gift-cards/${giftCardId}/activities`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      gift_card_activity: {
        gift_card_id: giftCardId,
        type: 'REDEEM',
        location_id: process.env.SQUARE_LOCATION_ID,
        redeem_activity_details: {
          amount_money: {
            amount: amountCents,
            currency: 'USD',
          },
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Redeem gift card failed: ${errMsg}`);
  }

  const activity = data.gift_card_activity;
  const remaining = Number(activity.gift_card_balance_money?.amount || 0);

  console.log(`[Square Gift Cards] Redeemed $${(amountCents / 100).toFixed(2)} — remaining: $${(remaining / 100).toFixed(2)}`);

  return {
    success: true,
    remainingBalanceCents: remaining,
    remainingBalance: `$${(remaining / 100).toFixed(2)}`,
  };
}


/**
 * Add funds to an existing gift card (reload).
 *
 * @param {Object} params
 * @param {string} params.giftCardId  — Gift card ID
 * @param {number} params.amountCents — Amount to add in cents
 * @returns {Promise<Object>}
 */
export async function reloadGiftCard({ giftCardId, amountCents }) {
  const response = await fetch(`${getBaseUrl()}/gift-cards/${giftCardId}/activities`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      gift_card_activity: {
        gift_card_id: giftCardId,
        type: 'LOAD',
        location_id: process.env.SQUARE_LOCATION_ID,
        load_activity_details: {
          amount_money: {
            amount: amountCents,
            currency: 'USD',
          },
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Reload gift card failed: ${errMsg}`);
  }

  const activity = data.gift_card_activity;
  const newBalance = Number(activity.gift_card_balance_money?.amount || 0);

  console.log(`[Square Gift Cards] Reloaded $${(amountCents / 100).toFixed(2)} — new balance: $${(newBalance / 100).toFixed(2)}`);

  return {
    success: true,
    newBalanceCents: newBalance,
    newBalance: `$${(newBalance / 100).toFixed(2)}`,
  };
}


/**
 * List all gift cards (for admin dashboard).
 *
 * @param {Object} [params]
 * @param {string} [params.state] — Filter by state: ACTIVE, DEACTIVATED, etc.
 * @param {number} [params.limit] — Max results
 * @returns {Promise<Array>}
 */
export async function listGiftCards({ state, limit = 50 } = {}) {
  const url = new URL(`${getBaseUrl()}/gift-cards`);
  if (state) url.searchParams.set('state', state);
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`List gift cards failed: ${data.errors?.[0]?.detail || response.status}`);
  }

  return (data.gift_cards || []).map(card => ({
    id: card.id,
    gan: card.gan,
    state: card.state,
    balanceCents: Number(card.balance_money?.amount || 0),
    balance: `$${(Number(card.balance_money?.amount || 0) / 100).toFixed(2)}`,
    createdAt: card.created_at,
  }));
}
