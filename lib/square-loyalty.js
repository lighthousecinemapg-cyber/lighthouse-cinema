// /lib/square-loyalty.js — Square Loyalty API Integration
// Manages loyalty accounts, point accrual, and redemptions.

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
  return `loy_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function getLoyaltyProgram() {
  const response = await fetch(`${getBaseUrl()}/loyalty/programs/main`, { method: 'GET', headers: headers() });
  if (response.status === 404) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(`Get loyalty program failed: ${data.errors?.[0]?.detail || response.status}`);
  return data.program;
}

export async function findLoyaltyAccount(phone) {
  const response = await fetch(`${getBaseUrl()}/loyalty/accounts/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ query: { mappings: [{ type: 'PHONE', value: phone }] }, limit: 1 }),
  });
  const data = await response.json();
  if (!response.ok) return null;
  return data.loyalty_accounts?.[0] || null;
}

export async function createLoyaltyAccount({ phone, programId }) {
  const response = await fetch(`${getBaseUrl()}/loyalty/accounts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      loyalty_account: { program_id: programId, mapping: { type: 'PHONE', value: phone } },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Create loyalty account failed: ${errMsg}`);
  }
  return data.loyalty_account;
}

export async function accumulatePoints({ accountId, points }) {
  const response = await fetch(`${getBaseUrl()}/loyalty/accounts/${accountId}/accumulate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      accumulate_points: { points },
      location_id: process.env.SQUARE_LOCATION_ID,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Accumulate points failed: ${errMsg}`);
  }
  return data.event;
}

export async function redeemReward({ accountId, rewardTierId }) {
  const createResponse = await fetch(`${getBaseUrl()}/loyalty/rewards`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      reward: { loyalty_account_id: accountId, reward_tier_id: rewardTierId },
    }),
  });
  const createData = await createResponse.json();
  if (!createResponse.ok) {
    const errMsg = createData.errors?.map(e => e.detail).join('; ') || `HTTP ${createResponse.status}`;
    throw new Error(`Create reward failed: ${errMsg}`);
  }
  const reward = createData.reward;

  const redeemResponse = await fetch(`${getBaseUrl()}/loyalty/rewards/${reward.id}/redeem`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ idempotency_key: idempotencyKey(), location_id: process.env.SQUARE_LOCATION_ID }),
  });
  const redeemData = await redeemResponse.json();
  if (!redeemResponse.ok) {
    const errMsg = redeemData.errors?.map(e => e.detail).join('; ') || `HTTP ${redeemResponse.status}`;
    throw new Error(`Redeem reward failed: ${errMsg}`);
  }
  return redeemData.event;
}

function formatProgram(program) {
  return {
    id: program.id,
    name: program.terminology?.one || 'Point',
    namePlural: program.terminology?.other || 'Points',
    accrualRules: (program.accrual_rules || []).map(rule => ({
      type: rule.accrual_type,
      points: rule.points,
      spendAmountCents: rule.spend_data?.amount_money?.amount,
    })),
    rewardTiers: (program.reward_tiers || []).map(tier => ({
      id: tier.id,
      name: tier.name,
      points: tier.points,
      discountType: tier.definition?.discount_type,
      percentOff: tier.definition?.percentage_discount,
      amountOff: tier.definition?.fixed_discount_money?.amount,
    })),
  };
}

export async function getLoyaltyDashboard(phone) {
  const [program, account] = await Promise.all([getLoyaltyProgram(), findLoyaltyAccount(phone)]);
  if (!program) return { program: null, account: null, events: [], message: 'No loyalty program configured.' };
  if (!account) return { program: formatProgram(program), account: null, events: [], message: 'No loyalty account found.' };

  let events = [];
  try {
    const eventsResponse = await fetch(`${getBaseUrl()}/loyalty/accounts/${account.id}/events`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ limit: 20 }),
    });
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      events = (eventsData.events || []).map(e => ({
        id: e.id, type: e.type,
        points: e.accumulate_points?.points || e.redeem_reward?.points || 0,
        createdAt: e.created_at,
      }));
    }
  } catch (err) { /* non-fatal */ }

  return {
    program: formatProgram(program),
    account: { id: account.id, balance: account.balance || 0, lifetimePoints: account.lifetime_points || 0, enrolledAt: account.enrolled_at },
    events,
  };
}

export async function enrollInLoyalty(phone) {
  const program = await getLoyaltyProgram();
  if (!program) throw new Error('No loyalty program is configured in Square.');
  const existing = await findLoyaltyAccount(phone);
  if (existing) return {
    account: { id: existing.id, balance: existing.balance || 0, lifetimePoints: existing.lifetime_points || 0 },
    program: formatProgram(program), alreadyEnrolled: true,
  };
  const account = await createLoyaltyAccount({ phone, programId: program.id });
  return {
    account: { id: account.id, balance: account.balance || 0, lifetimePoints: account.lifetime_points || 0 },
    program: formatProgram(program), alreadyEnrolled: false,
  };
}
