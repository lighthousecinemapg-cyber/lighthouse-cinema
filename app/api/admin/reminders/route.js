// /app/api/admin/reminders/route.js â Reminder system
//
// POST /api/admin/reminders
//   { action: "daily-staff" | "weekly-staff" | "event-prep" | "customer-confirm" | "customer-reminder" | "payment-reminder" }
//
// Can be called by Vercel Cron or manually from the dashboard.
//
import { authenticateRequest } from '@/lib/auth';
import { listEvents } from '@/lib/calendar-events';
import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail(to, subject, html) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Lighthouse Cinema" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

// Send SMS via Twilio
async function sendSMS(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return;

  const params = new URLSearchParams({ From: from, To: to, Body: body });
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ---- Staff daily schedule email ----
async function sendDailyStaffEmail() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const events = await listEvents({ dateMin: todayStart, dateMax: todayEnd });

  if (events.length === 0) {
    return { sent: false, reason: 'No events today' };
  }

  const rows = events.map(e => `
    <tr>
      <td style="padding:8px;border:1px solid #333;">${e.time}</td>
      <td style="padding:8px;border:1px solid #333;">Room ${e.room}</td>
      <td style="padding:8px;border:1px solid #333;">${e.customer}</td>
      <td style="padding:8px;border:1px solid #333;">${e.eventType}</td>
      <td style="padding:8px;border:1px solid #333;">${e.guests} guests</td>
      <td style="padding:8px;border:1px solid #333;font-weight:bold;color:${e.status === 'Paid' ? '#4CAF50' : e.status === 'Draft' ? '#f44336' : '#FFC107'}">${e.status}</td>
    </tr>
  `).join('');

  const totalGuests = events.reduce((s, e) => s + e.guests, 0);
  const totalRevenue = events.reduce((s, e) => s + e.totalPrice, 0);
  const pendingBalance = events.reduce((s, e) => s + e.balance, 0);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#F0E9D7;padding:24px;border-radius:12px;">
      <h1 style="color:#D4AF37;margin:0 0 4px;">Daily Schedule</h1>
      <p style="color:#999;margin:0 0 20px;">${formatDate(now)} â ${events.length} events, ${totalGuests} guests</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#F0E9D7;">
        <thead><tr style="background:#1a1a1a;">
          <th style="padding:8px;border:1px solid #333;text-align:left;">Time</th>
          <th style="padding:8px;border:1px solid #333;text-align:left;">Room</th>
          <th style="padding:8px;border:1px solid #333;text-align:left;">Customer</th>
          <th style="padding:8px;border:1px solid #333;text-align:left;">Type</th>
          <th style="padding:8px;border:1px solid #333;text-align:left;">Guests</th>
          <th style="padding:8px;border:1px solid #333;text-align:left;">Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:20px;padding:16px;background:#1a1a1a;border-radius:8px;">
        <p style="margin:4px 0;">Revenue today: <strong>$${totalRevenue.toLocaleString()}</strong></p>
        <p style="margin:4px 0;">Pending balances: <strong style="color:#FFC107;">$${pendingBalance.toLocaleString()}</strong></p>
      </div>
    </div>
  `;

  await sendEmail(
    process.env.OWNER_EMAIL || process.env.SMTP_USER,
    `ð¬ Today's Schedule â ${events.length} Events`,
    html
  );
  return { sent: true, eventCount: events.length };
}

// ---- Staff weekly schedule email ----
async function sendWeeklyStaffEmail() {
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString();
  const events = await listEvents({ dateMin: weekStart, dateMax: weekEnd });

  const byDay = {};
  events.forEach(e => {
    const day = e.date;
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e);
  });

  const days = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, evts]) => {
    const items = evts.map(e => `<li>${e.time} â Room ${e.room}: ${e.customer} (${e.eventType}, ${e.guests} guests) [${e.status}]</li>`).join('');
    return `<h3 style="color:#D4AF37;margin:16px 0 8px;">${formatDate(date)}</h3><ul style="margin:0;padding-left:20px;">${items}</ul>`;
  }).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#F0E9D7;padding:24px;border-radius:12px;">
      <h1 style="color:#D4AF37;">Weekly Schedule</h1>
      <p style="color:#999;">${events.length} events this week</p>
      ${days || '<p>No events scheduled this week.</p>'}
    </div>
  `;

  await sendEmail(
    process.env.OWNER_EMAIL || process.env.SMTP_USER,
    `ð¬ Weekly Schedule â ${events.length} Events This Week`,
    html
  );
  return { sent: true, eventCount: events.length };
}

// ---- Event prep reminders (24h + 2h before) ----
async function sendEventPrepReminders() {
  const now = new Date();
  const in2h = new Date(now.getTime() + 2.5 * 3600000);
  const in24h = new Date(now.getTime() + 24.5 * 3600000);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString();
  const events = await listEvents({ dateMin: todayStart, dateMax: tomorrowEnd });

  let sent = 0;
  for (const e of events) {
    const eventStart = new Date(e.date + 'T' + e.time);
    const hoursUntil = (eventStart - now) / 3600000;

    let urgency = '';
    if (hoursUntil > 1.5 && hoursUntil <= 2.5) urgency = '2 HOURS';
    else if (hoursUntil > 23 && hoursUntil <= 25) urgency = '24 HOURS';
    else continue;

    const body = `â° EVENT PREP â ${urgency}\n\n${e.customer} â ${e.eventType}\nRoom ${e.room} at ${e.time}\n${e.guests} guests\n\nChecklist:\nâ Room setup\nâ Food/drink prep\nâ Staffing confirmed\nâ AV equipment ready`;

    await sendSMS(process.env.OWNER_PHONE_NUMBER, body);
    sent++;
  }
  return { sent };
}

// ---- Customer booking confirmation ----
async function sendCustomerConfirmation(event) {
  if (!event.email) return { sent: false, reason: 'No email' };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#F0E9D7;padding:24px;border-radius:12px;">
      <h1 style="color:#D4AF37;text-align:center;">Booking Confirmed!</h1>
      <p style="text-align:center;color:#999;">Lighthouse Cinema â Pacific Grove</p>
      <div style="background:#1a1a1a;padding:16px;border-radius:8px;margin:20px 0;">
        <p><strong>Event:</strong> ${event.eventType}</p>
        <p><strong>Date:</strong> ${formatDate(event.date)}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Room:</strong> ${event.room}</p>
        <p><strong>Guests:</strong> ${event.guests}</p>
        ${event.totalPrice ? `<p><strong>Total:</strong> $${event.totalPrice}</p>` : ''}
        ${event.depositPaid ? `<p><strong>Deposit Paid:</strong> $${event.depositPaid}</p>` : ''}
        ${event.balance > 0 ? `<p><strong>Balance Due:</strong> $${event.balance}</p>` : ''}
      </div>
      <p style="text-align:center;">Questions? Reply to this email or text us anytime.</p>
    </div>
  `;

  await sendEmail(event.email, `â Booking Confirmed â ${event.eventType} at Lighthouse Cinema`, html);
  return { sent: true };
}

// ---- Customer reminders (3 day, 1 day, same day) ----
async function sendCustomerReminders() {
  const now = new Date();
  const upcoming = await listEvents({
    dateMin: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
    dateMax: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4).toISOString(),
  });

  let sent = 0;
  for (const e of upcoming) {
    if (!e.email && !e.phone) continue;
    const eventDate = new Date(e.date + 'T' + e.time);
    const daysUntil = Math.round((eventDate - now) / 86400000);

    let subject = '';
    let urgencyText = '';
    if (daysUntil === 3) {
      subject = `Reminder: Your event is in 3 days!`;
      urgencyText = 'in 3 days';
    } else if (daysUntil === 1) {
      subject = `Tomorrow! Your event at Lighthouse Cinema`;
      urgencyText = 'tomorrow';
    } else if (daysUntil === 0) {
      subject = `Today! Your event at Lighthouse Cinema`;
      urgencyText = 'today';
    } else continue;

    if (e.email) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#F0E9D7;padding:24px;border-radius:12px;">
          <h1 style="color:#D4AF37;">Your Event is ${urgencyText}!</h1>
          <div style="background:#1a1a1a;padding:16px;border-radius:8px;margin:20px 0;">
            <p><strong>${e.eventType}</strong> â Room ${e.room}</p>
            <p>${formatDate(e.date)} at ${e.time}</p>
            <p>${e.guests} guests</p>
          </div>
          ${e.balance > 0 ? `<div style="background:#2a1a00;padding:16px;border-radius:8px;border:1px solid #D4AF37;margin:16px 0;">
            <p style="color:#D4AF37;font-weight:bold;">Balance Due: $${e.balance}</p>
            <p>Please complete payment to secure your reservation.</p>
          </div>` : ''}
          <p>See you soon!<br>Lighthouse Cinema</p>
        </div>
      `;
      await sendEmail(e.email, subject, html);
    }

    if (e.phone && daysUntil <= 1) {
      const sms = `Lighthouse Cinema: Your ${e.eventType} is ${urgencyText} at ${e.time} in Room ${e.room}. ${e.balance > 0 ? `Balance due: $${e.balance}.` : ''} See you soon!`;
      await sendSMS(e.phone, sms);
    }
    sent++;
  }
  return { sent };
}

// ---- Payment reminders ----
async function sendPaymentReminders() {
  const now = new Date();
  const upcoming = await listEvents({
    dateMin: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
    dateMax: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).toISOString(),
  });

  let sent = 0;
  for (const e of upcoming) {
    if (e.balance <= 0 || !e.email) continue;
    const eventDate = new Date(e.date + 'T' + e.time);
    const daysUntil = Math.round((eventDate - now) / 86400000);

    let urgency = '';
    if (daysUntil <= 1) urgency = 'Your event is coming up soon. Please complete payment to secure your reservation.';
    else if (daysUntil <= 3) urgency = 'Your event is just days away. Please settle your balance at your earliest convenience.';
    else if (e.status === 'Draft') urgency = 'We have your event request on hold. A deposit is required to confirm your booking.';
    else continue;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#F0E9D7;padding:24px;border-radius:12px;">
        <h1 style="color:#D4AF37;">Payment Reminder</h1>
        <div style="background:#2a1a00;padding:16px;border-radius:8px;border:1px solid #D4AF37;margin:20px 0;">
          <p style="font-size:24px;text-align:center;color:#D4AF37;font-weight:bold;">$${e.balance} due</p>
          <p style="text-align:center;">${e.eventType} â ${formatDate(e.date)}</p>
        </div>
        <p>${urgency}</p>
        <p>Reply to this email or call us to arrange payment.</p>
        <p>Lighthouse Cinema<br>Pacific Grove, CA</p>
      </div>
    `;

    await sendEmail(e.email, `ð³ Payment Reminder â $${e.balance} Due`, html);
    sent++;
  }
  return { sent };
}

// ---- Route handler ----
export async function POST(request) {
  // Allow cron jobs via secret header OR authenticated staff
  const cronSecret = request.headers.get('x-cron-secret');
  const isCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isCron && !authenticateRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, event } = await request.json();

    let result;
    switch (action) {
      case 'daily-staff':
        result = await sendDailyStaffEmail();
        break;
      case 'weekly-staff':
        result = await sendWeeklyStaffEmail();
        break;
      case 'event-prep':
        result = await sendEventPrepReminders();
        break;
      case 'customer-confirm':
        if (!event) return Response.json({ error: 'Missing event data' }, { status: 400 });
        result = await sendCustomerConfirmation(event);
        break;
      case 'customer-reminder':
        result = await sendCustomerReminders();
        break;
      case 'payment-reminder':
        result = await sendPaymentReminders();
        break;
      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error('[reminders] error', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
