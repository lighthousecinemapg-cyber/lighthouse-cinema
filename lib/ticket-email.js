// ═══════════════════════════════════════════════════════════════
// /lib/ticket-email.js — Branded movie-ticket confirmation email.
// Sends via SMTP (Nodemailer). Activates when SMTP_USER + SMTP_PASS are set.
// ENV: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// ═══════════════════════════════════════════════════════════════
import nodemailer from 'nodemailer';

const ADDRESS = '525 Lighthouse Ave, Pacific Grove, CA 93950';
const PHONE = '(831) 717-3124';
const EMAIL = 'lighthousecinemapg@gmail.com';
const SITE = 'https://lighthousepgcinema.com';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Lighthouse Cinema, ' + ADDRESS);

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const MONTHS = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
function gcalLink(movie, date, time) {
  try {
    const md = (date || '').replace(/^[A-Za-z]+,\s*/, '').split(' ');
    const month = MONTHS[md[0]]; const day = parseInt(md[1], 10);
    let [hm, period] = (time || '').split(' '); let [h, m] = hm.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12; if (period === 'AM' && h === 12) h = 0;
    const y = new Date().getFullYear();
    const s = new Date(y, month, day, h || 0, m || 0); const e = new Date(s.getTime() + 2*3600*1000);
    const fmt = (x) => x.getFullYear()+String(x.getMonth()+1).padStart(2,'0')+String(x.getDate()).padStart(2,'0')+'T'+String(x.getHours()).padStart(2,'0')+String(x.getMinutes()).padStart(2,'0')+'00';
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(movie+' at Lighthouse Cinema')+'&dates='+fmt(s)+'/'+fmt(e)+'&location='+encodeURIComponent(ADDRESS);
  } catch (e) { return SITE; }
}

export async function sendTicketEmail({ to, movie, date, time, qty = 1, amountCents = 0, confRef, orderId, poster }) {
  if (!isEmailConfigured()) {
    const err = new Error('Email is not configured (SMTP_USER/SMTP_PASS missing).');
    err.code = 'NO_SMTP';
    throw err;
  }
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new Error('A valid recipient email is required.');

  const ticketUrl = SITE + '/my-tickets?ref=' + encodeURIComponent(confRef || '') + (orderId ? '&order=' + encodeURIComponent(orderId) : '');
  const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=' + encodeURIComponent(ticketUrl);
  const cal = gcalLink(movie, date, time);
  const amount = '$' + ((amountCents || 0) / 100).toFixed(2);

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0a0a0a;padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#111;border-radius:14px;overflow:hidden;border:1px solid #2a2a2a;">
      <div style="background:linear-gradient(135deg,#d4af37,#b8942e);padding:26px 24px;text-align:center;">
        <div style="font-size:26px;font-weight:800;color:#000;">🎬 Your Tickets Are Ready</div>
        <div style="color:#000;opacity:.8;font-size:14px;margin-top:4px;">Lighthouse Cinema · Pacific Grove</div>
      </div>
      <div style="padding:24px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          ${poster ? `<td style="width:120px;vertical-align:top;padding-right:16px;"><img src="${poster}" alt="${movie}" width="120" style="border-radius:10px;display:block;"></td>` : ''}
          <td style="vertical-align:top;">
            <div style="color:#fff;font-size:22px;font-weight:800;">${movie || 'Movie Ticket'}</div>
            <div style="color:#e0e0e0;font-size:15px;margin-top:8px;">📅 <strong>${date || ''}</strong></div>
            <div style="color:#d4af37;font-size:30px;font-weight:800;margin:6px 0;">🕒 ${time || ''}</div>
            <div style="color:#888;font-size:13px;">${qty} ticket${qty > 1 ? 's' : ''} · ${amount} paid</div>
          </td>
        </tr></table>

        <div style="text-align:center;margin:22px 0;padding:16px;background:#1a1a1a;border-radius:10px;">
          <img src="${qr}" alt="Ticket QR code" width="170" height="170" style="background:#fff;border-radius:8px;padding:6px;">
          <div style="color:#888;font-size:12px;margin-top:6px;">Scan at the door${confRef ? ' · Confirmation ' + confRef : ''}</div>
        </div>

        <a href="${cal}" style="display:block;background:#d4af37;color:#000;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:800;margin-bottom:10px;">📅 Add to Calendar</a>
        <a href="${ticketUrl}" style="display:block;border:1px solid #d4af37;color:#d4af37;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:700;">🎟️ View / Manage My Tickets</a>

        <div style="border-top:1px solid #2a2a2a;margin-top:22px;padding-top:18px;color:#bcbcbc;font-size:13px;line-height:1.7;">
          <strong style="color:#d4af37;">Getting There</strong><br>
          ${ADDRESS} · <a href="${MAPS}" style="color:#d4af37;">Google Maps</a><br>
          🕒 Please arrive 15 minutes early. Free street &amp; nearby lot parking. 🍿 Bar &amp; Grill open before showtime.
        </div>
        <div style="border-top:1px solid #2a2a2a;margin-top:16px;padding-top:16px;color:#888;font-size:12px;text-align:center;">
          Need help? Call <a href="tel:+18317173124" style="color:#d4af37;">${PHONE}</a> · <a href="mailto:${EMAIL}" style="color:#d4af37;">${EMAIL}</a><br>
          Lost your ticket? Retrieve it anytime at ${SITE}/my-tickets
        </div>
      </div>
    </div>
  </div>`;

  const subject = `Your Lighthouse Cinema Tickets – ${movie || 'Movie'}${date ? ' – ' + date : ''}${time ? ' at ' + time : ''}`;
  await transporter().sendMail({
    from: `"Lighthouse Cinema" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  return true;
}
