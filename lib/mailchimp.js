// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// /lib/mailchimp.js â Mailchimp Marketing API Integration
//
// Adds a contact to your Mailchimp audience list.
// Handles: new subscribers, duplicate emails (updates existing),
//          tagging, and merge fields (first name, last name, phone).
//
// REQUIRED ENV VARS:
//   MAILCHIMP_API_KEY        â Your Mailchimp API key
//   MAILCHIMP_AUDIENCE_ID    â The audience (list) ID
//   MAILCHIMP_SERVER_PREFIX  â Data center prefix (e.g. "us21")
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

import crypto from 'crypto';

/**
 * Add or update a subscriber in Mailchimp.
 *
 * @param {Object} data
 * @param {string} data.firstName
 * @param {string} data.lastName
 * @param {string} data.email
 * @param {string} data.phone
 * @returns {Promise<{success: boolean, status: string}>}
 */
export async function addToMailchimp({ firstName, lastName, email, phone }) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !serverPrefix) {
    throw new Error('Mailchimp environment variables are not configured.');
  }

  // Mailchimp uses MD5 hash of lowercase email as subscriber ID
  const subscriberHash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');

  // Use PUT to add-or-update (upsert behavior)
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;

  const body = {
    email_address: email.toLowerCase(),
    status_if_new: 'subscribed',  // Auto-subscribe new contacts
    status: 'subscribed',          // Re-subscribe if previously unsubscribed
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName || '',
      PHONE: phone || '',
    },
    tags: ['Lighthouse Cinema Subscriber'],
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    // Handle specific Mailchimp errors
    if (result.title === 'Member Exists') {
      // Already subscribed â not an error
      console.log(`[Mailchimp] Contact already exists: ${email}`);
      return { success: true, status: 'existing' };
    }

    if (result.title === 'Invalid Resource') {
      throw new Error(`Mailchimp validation error: ${result.detail || 'Invalid data'}`);
    }

    throw new Error(`Mailchimp API error (${response.status}): ${result.detail || result.title || 'Unknown error'}`);
  }

  console.log(`[Mailchimp] Successfully added/updated: ${email} (status: ${result.status})`);

  // Add tag separately (PUT doesn't always apply tags)
  try {
    await addTagToSubscriber(serverPrefix, apiKey, audienceId, subscriberHash);
  } catch (tagErr) {
    // Non-critical â log but don't fail
    console.warn('[Mailchimp] Tag assignment failed:', tagErr.message);
  }

  return { success: true, status: result.status };
}


/**
 * Add a tag to an existing subscriber.
 */
async function addTagToSubscriber(serverPrefix, apiKey, audienceId, subscriberHash) {
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}/tags`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify({
      tags: [
        { name: 'Lighthouse Cinema Subscriber', status: 'active' },
        { name: 'Website Signup', status: 'active' },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Tag API returned ${response.status}`);
  }
}

// ---------------------------------------------------------------
// AUTONOMOUS CAMPAIGN SENDER  (create -> set HTML content -> send)
// Reuses the same env vars as addToMailchimp above:
//   MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX
// Safe mode: if MAILCHIMP_TEST_EMAIL is set, sends a TEST to that
// address only (never the full list) - good for a first dry run.
// ---------------------------------------------------------------
export async function sendCinemaCampaign({
  subject,
  previewText = '',
  html,
  fromName = 'Lighthouse Cinema',
  replyTo = 'hello@lighthousepgcinema.com',
  testEmail = process.env.MAILCHIMP_TEST_EMAIL,
}) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  if (!apiKey || !audienceId || !serverPrefix) {
    throw new Error('Mailchimp environment variables are not configured.');
  }
  const auth = 'Basic ' + Buffer.from('anystring:' + apiKey).toString('base64');
  const base = 'https://' + serverPrefix + '.api.mailchimp.com/3.0';
  const mc = async (path, method, body) => {
    const r = await fetch(base + path, {
      method: method,
      headers: { 'Content-Type': 'application/json', Authorization: auth },
      body: body ? JSON.stringify(body) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Mailchimp ' + method + ' ' + path + ' -> ' + r.status + ': ' + (j.detail || j.title || 'error'));
    return j;
  };
  const campaign = await mc('/campaigns', 'POST', {
    type: 'regular',
    recipients: { list_id: audienceId },
    settings: {
      subject_line: subject,
      preview_text: previewText,
      title: subject,
      from_name: fromName,
      reply_to: replyTo,
      auto_footer: true,
    },
  });
  await mc('/campaigns/' + campaign.id + '/content', 'PUT', { html: html });
  if (testEmail) {
    await mc('/campaigns/' + campaign.id + '/actions/test', 'POST', { test_emails: [testEmail], send_type: 'html' });
    return { id: campaign.id, sent: false, tested: true, to: testEmail };
  }
  await mc('/campaigns/' + campaign.id + '/actions/send', 'POST');
  return { id: campaign.id, sent: true };
}
