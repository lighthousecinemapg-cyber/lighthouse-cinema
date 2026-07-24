// ================================================================
// lib/inquiry.js — Reliable event/contact inquiry handler.
//
// Guarantees an inquiry is NEVER lost:
//   1. Durable capture FIRST (structured console log -> Vercel logs).
//   2. Full-detail email to the cinema.
//   3. Automatic confirmation email to the customer.
//   4. Best-effort store in Mailchimp (existing system).
// Returns ok:true if captured, even when email delivery fails, along
// with a unique reference number and per-email status.
// ================================================================
import { sendEmail } from './email';
import { addToMailchimp } from './mailchimp';
import { sendSMSAlert } from './daily-digest';

const CINEMA_EMAIL = process.env.CONTACT_EMAIL || 'lighthousecinemapg@gmail.com';
const CINEMA_PHONE = '(831) 717-3124';
const CINEMA_ADDR = '525 Lighthouse Ave, Pacific Grove, CA 93950';
const SITE = 'https://lighthousepgcinema.com';
const HOURS = 'Open Tuesday–Sunday (closed Mondays). Showtimes vary — see our schedule online.';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Strip CR/LF to prevent email header injection in header-bound values.
function oneLine(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim(); }
function isEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(e || '')); }
function makeRef() { return 'LHE-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100); }

// Real-time lead alerts: Slack (if SLACK_WEBHOOK_URL set) + owner SMS (existing Twilio).
async function notifyChannels({ ref, type, name, email, phone, fields, priority }) {
  const link = 'https://lighthousepgcinema.com/admin/orders';
  const lines = [
    `*New ${type} inquiry* — ${priority} priority`,
    `*Ref:* ${ref}`,
    `*Name:* ${name}`,
    fields['Company / Organization'] ? `*Company:* ${fields['Company / Organization']}` : null,
    `*Phone:* ${phone}`,
    `*Email:* ${email}`,
    fields['Preferred Date'] ? `*Requested date:* ${fields['Preferred Date']}` : null,
    fields['Number of Guests'] ? `*Guests:* ${fields['Number of Guests']}` : null,
    fields['Budget'] ? `*Budget:* ${fields['Budget']}` : null,
    fields['Package'] ? `*Package:* ${fields['Package']}` : null,
    fields['Estimated Total'] ? `*Est. total:* ${fields['Estimated Total']}` : null,
    `<${link}|Open admin>`,
  ].filter(Boolean);

  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: lines.join('\n') }) });
    } catch (e) { console.error('[INQUIRY] Slack notify failed for', ref, '-', e.message); }
  } else {
    console.log('[INQUIRY] Slack not configured (set SLACK_WEBHOOK_URL). Payload:', lines.join(' | '));
  }

  // Owner SMS via the existing Twilio helper (no-ops+logs if Twilio not set).
  try {
    const bits = [`${priority} ${type} lead`, name, fields['Company / Organization'],
      fields['Number of Guests'] ? fields['Number of Guests'] + ' guests' : null,
      fields['Preferred Date'], `ref ${ref}`].filter(Boolean);
    await sendSMSAlert(bits.join(' · '));
  } catch (e) { console.error('[INQUIRY] SMS notify failed for', ref, '-', e.message); }
}

export async function submitInquiry({ type = 'Event Inquiry', name = '', email = '', phone = '', fields = {}, page = '', ip = '' }) {
  const ref = makeRef();
  const now = new Date();
  const submittedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
  const submittedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }) + ' PT';

  // 1) DURABLE CAPTURE — happens before anything can fail.
  const record = { ref, type, name, email, phone, ...fields, page, ip, submittedDate, submittedTime };
  try { console.log('[INQUIRY]', JSON.stringify(record)); } catch (e) {}

  // 2) Build ordered rows for the staff email.
  const rows = [];
  const push = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '') rows.push([k, v]); };
  push('Reference #', ref);
  push('Event Type', type);
  push('Customer Name', name);
  push('Email', email);
  push('Phone', phone);
  for (const [k, v] of Object.entries(fields)) push(k, v);
  push('Page Submitted From', page);
  push('IP Address', ip);
  push('Submitted', submittedDate + ' at ' + submittedTime);

  const rowsHtml = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#9A7B2A;font-weight:600;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:6px 0;color:#111;">${esc(v).replace(/\n/g, '<br/>')}</td></tr>`
  ).join('');

  const staffHtml = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:660px;margin:0 auto;">
    <h2 style="color:#9A7B2A;margin:0 0 12px;">New ${esc(type)} Request — ${esc(name)}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rowsHtml}</table>
    <p style="color:#888;font-size:12px;margin-top:16px;">Reply to this email to reach the customer directly.</p>
  </div>`;

  const subject = `New ${oneLine(type)} Request – ${oneLine(name)}` + (fields['Preferred Date'] ? ` – ${oneLine(fields['Preferred Date'])}` : '');

  let staffEmailSent = false, customerEmailSent = false, emailError = null;

  // 3) Email the cinema.
  try {
    await sendEmail({ to: CINEMA_EMAIL, subject, html: staffHtml, replyTo: isEmail(email) ? email : undefined });
    staffEmailSent = true;
  } catch (e) { emailError = e.message; console.error('[INQUIRY] staff email failed for', ref, '-', e.message); }

  // 4) Confirmation email to the customer.
  if (isEmail(email)) {
    const summaryRows = rows.filter(([k]) => !['IP Address', 'Page Submitted From'].includes(k))
      .map(([k, v]) => `<tr><td style="padding:4px 14px 4px 0;color:#d4af37;font-weight:600;">${esc(k)}</td><td style="padding:4px 0;color:#eee;">${esc(v)}</td></tr>`).join('');
    const custHtml = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0a0a0a;padding:28px 16px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#d4af37,#9A7B2A);padding:22px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#000;">We've Received Your Request!</div>
          <div style="color:#000;opacity:.85;margin-top:4px;">Lighthouse Cinema · Pacific Grove</div>
        </div>
        <div style="padding:24px;color:#ddd;line-height:1.6;">
          <p>Thank you for contacting Lighthouse Cinema. We have received your request and our team will contact you as soon as possible.</p>
          <p style="color:#d4af37;font-weight:700;font-size:16px;">Reference #: ${esc(ref)}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">${summaryRows}</table>
          <div style="border-top:1px solid #2a2a2a;margin-top:18px;padding-top:16px;color:#aaa;font-size:13px;">
            Questions? Call <a href="tel:+18317173124" style="color:#d4af37;">${CINEMA_PHONE}</a> · <a href="mailto:${CINEMA_EMAIL}" style="color:#d4af37;">${CINEMA_EMAIL}</a> · <a href="${SITE}" style="color:#d4af37;">lighthousepgcinema.com</a><br>
            ${CINEMA_ADDR}<br>${HOURS}
          </div>
        </div>
      </div></div>`;
    try {
      await sendEmail({ to: email, subject: "We've Received Your Event Request!", html: custHtml });
      customerEmailSent = true;
    } catch (e) { console.error('[INQUIRY] customer email failed for', ref, '-', e.message); }
  }

  // 5) Best-effort durable store in an existing system (non-fatal).
  try {
    const parts = String(name || '').trim().split(' ');
    await addToMailchimp({ firstName: parts[0] || '', lastName: parts.slice(1).join(' '), email, phone });
  } catch (e) { /* non-fatal */ }

  // Priority scoring for lead routing.
  const budgetStr = String(fields['Budget'] || '');
  const highValue = /\$5,000|\$10,000|10,000\+/.test(budgetStr) || /corporate|product|premium|gala|premiere|launch|brand|company/i.test(type);
  const priority = highValue ? 'HIGH' : 'Normal';
  try { await notifyChannels({ ref, type, name, email, phone, fields, priority }); } catch (e) { console.error('[INQUIRY] notify error', e.message); }

  return { ok: true, ref, staffEmailSent, customerEmailSent, emailError, priority };
}
