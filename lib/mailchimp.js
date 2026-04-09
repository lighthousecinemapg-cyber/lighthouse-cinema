// Minimal Mailchimp v3.0 subscriber helper.
// Requires MAILCHIMP_API_KEY (e.g. abc-us12) and MAILCHIMP_LIST_ID (e.g. 533656).
import crypto from 'crypto';

const API_KEY = process.env.MAILCHIMP_API_KEY;
const LIST_ID = process.env.MAILCHIMP_LIST_ID;

function dc() {
  if (!API_KEY) return null;
  return API_KEY.split('-').pop();
}

export async function subscribeToMailchimp({ email, name = '', tags = [] }) {
  if (!API_KEY || !LIST_ID) {
    console.warn('Mailchimp not configured — skipping');
    return { skipped: true };
  }
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${dc()}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`;
  const [first, ...rest] = (name || '').split(' ');
  const body = {
    email_address: email,
    status_if_new: 'subscribed',
    merge_fields: { FNAME: first || '', LNAME: rest.join(' ') },
    tags,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: 'Basic ' + Buffer.from('anystring:' + API_KEY).toString('base64'),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Mailchimp error: ' + res.status);
  return res.json();
}

export async function triggerBookingEmail(booking) {
  return subscribeToMailchimp({
    email: booking.customerEmail,
    name: booking.customerName,
    tags: ['Booking-Confirmed', ...(booking.eventTitle ? [`Event:${booking.eventTitle}`] : [])],
  });
}
