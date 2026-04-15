// ═══════════════════════════════════════════════════════════════
// /lib/square.js — Square Customers API Integration
//
// Creates or updates a customer in your Square dashboard.
// Handles: new customers, duplicate detection (by email),
//          phone numbers, and notes.
//
// REQUIRED ENV VARS:
//   SQUARE_ACCESS_TOKEN   — Your Square API access token
//   SQUARE_ENVIRONMENT    — "production" or "sandbox"
// ═══════════════════════════════════════════════════════════════

/**
 * Get the Square API base URL based on environment.
 */
function getSquareBaseUrl() {
  const env = process.env.SQUARE_ENVIRONMENT || 'production';
  return env === 'sandbox'
    ? 'https://connect.squareupsandbox.com/v2'
    : 'https://connect.squareup.com/v2';
}

/**
 * Generate a unique idempotency key to prevent duplicate requests.
 */
function idempotencyKey() {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Search for an existing customer by email address.
 *
 * @param {string} email
 * @param {string} baseUrl
 * @param {string} token
 * @returns {Promise<Object|null>} — existing customer object or null
 */
async function findCustomerByEmail(email, baseUrl, token) {
  const response = await fetch(`${baseUrl}/customers/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Square-Version': '2024-01-18',
    },
    body: JSON.stringify({
      query: {
        filter: {
          email_address: {
            exact: email.toLowerCase(),
          },
        },
      },
      limit: 1,
    }),
  });

  if (!response.ok) {
    // Don't fail on search errors — just return null and create new
    console.warn('[Square] Customer search failed:', response.status);
    return null;
  }

  const data = await response.json();
  return data.customers?.[0] || null;
}

/**
 * Create a new customer in Square.
 *
 * @param {Object} customerData
 * @param {string} baseUrl
 * @param {string} token
 * @returns {Promise<Object>}
 */
async function createCustomer(customerData, baseUrl, token) {
  const response = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Square-Version': '2024-01-18',
    },
    body: JSON.stringify({
      idempotency_key: idempotencyKey(),
      given_name: customerData.firstName,
      family_name: customerData.lastName || undefined,
      email_address: customerData.email.toLowerCase(),
      phone_number: customerData.phone || undefined,
      note: 'Subscribed via website — Lighthouse Cinema Club',
      reference_id: `web_${Date.now()}`,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Square create customer failed: ${errMsg}`);
  }

  return data.customer;
}

/**
 * Update an existing customer in Square.
 *
 * @param {string} customerId
 * @param {Object} updates
 * @param {string} baseUrl
 * @param {string} token
 * @returns {Promise<Object>}
 */
async function updateCustomer(customerId, updates, baseUrl, token) {
  const response = await fetch(`${baseUrl}/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Square-Version': '2024-01-18',
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.errors?.map(e => e.detail).join('; ') || `HTTP ${response.status}`;
    throw new Error(`Square update customer failed: ${errMsg}`);
  }

  return data.customer;
}


/**
 * Add or update a customer in Square.
 * Main export — called by the API route.
 *
 * @param {Object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.phone
 * @returns {Promise<{success: boolean, action: string, customerId: string}>}
 */
export async function addToSquare({ firstName, lastName, email, phone }) {
  const token = process.env.SQUARE_ACCESS_TOKEN;

  if (!token) {
    throw new Error('Square access token is not configured.');
  }

  const baseUrl = getSquareBaseUrl();

  // 1. Check if customer already exists
  const existing = await findCustomerByEmail(email, baseUrl, token);

  if (existing) {
    // 2a. Update existing customer
    const updates = {};

    // Only update fields that have new values
    if (firstName && firstName !== existing.given_name) {
      updates.given_name = firstName;
    }
    if (lastName && lastName !== existing.family_name) {
      updates.family_name = lastName;
    }
    if (phone && phone !== existing.phone_number) {
      updates.phone_number = phone;
    }

    // Append to note if not already noted
    if (existing.note && !existing.note.includes('Subscribed via website')) {
      updates.note = existing.note + '\nRe-subscribed via website ' + new Date().toISOString().split('T')[0];
    } else if (!existing.note) {
      updates.note = 'Subscribed via website — Lighthouse Cinema Club';
    }

    if (Object.keys(updates).length > 0) {
      await updateCustomer(existing.id, updates, baseUrl, token);
      console.log(`[Square] Updated existing customer: ${email} (${existing.id})`);
    } else {
      console.log(`[Square] Customer already up to date: ${email} (${existing.id})`);
    }

    return { success: true, action: 'updated', customerId: existing.id };
  }

  // 2b. Create new customer
  const newCustomer = await createCustomer({ firstName, lastName, email, phone }, baseUrl, token);
  console.log(`[Square] Created new customer: ${email} (${newCustomer.id})`);

  return { success: true, action: 'created', customerId: newCustomer.id };
      }
