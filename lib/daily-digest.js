// ================================================================
// LIGHTHOUSE CINEMA â DAILY DIGEST & SMS ALERTS
// Morning email digest + real-time SMS for critical events
// ================================================================

import nodemailer from 'nodemailer';

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;
const OWNER_PHONE = process.env.OWNER_PHONE || '+18317173124';
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'lighthousecinemapg@gmail.com';

// ================================================================
// SMS ALERTS (via Twilio â optional)
// ================================================================

export async function sendSMSAlert(message) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log('SMS alert (Twilio not configured):', message);
    return { sent: false, reason: 'Twilio not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: OWNER_PHONE,
          From: TWILIO_FROM,
          Body: `ð¬ Lighthouse Cinema: ${message}`,
        }),
      }
    );
    const data = await response.json();
    return { sent: true, sid: data.sid };
  } catch (err) {
    console.error('SMS send error:', err.message);
    return { sent: false, error: err.message };
  }
}

// Pre-built alert triggers
export async function alert1StarReview(reviewerName, reviewText) {
  return sendSMSAlert(`ð¨ 1-STAR REVIEW from ${reviewerName}: "${(reviewText || '').slice(0, 80)}..." â Check dashboard NOW.`);
}

export async function alertHighValueBooking(customerName, ticketCount, total) {
  return sendSMSAlert(`ð° High-value booking! ${customerName} booked ${ticketCount} tickets ($${total}). VIP treatment ready.`);
}

export async function alertSystemError(service, error) {
  return sendSMSAlert(`â ï¸ System error â ${service}: ${error.slice(0, 100)}`);
}

// ================================================================
// DAILY DIGEST EMAIL (sent every morning at 8 AM)
// ================================================================

export async function sendDailyDigest(digestData) {
  const {
    newReviews = [],
    yesterdayBookings = [],
    todayEvents = [],
    topPost = null,
    systemHealth = 'All systems operational',
    flashSaleOpportunities = [],
  } = digestData;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const totalBookingRevenue = yesterdayBookings.reduce((s, b) => s + (b.grandTotal || 0), 0);
  const totalTickets = yesterdayBookings.reduce((s, b) =>
    s + (b.lineItems || []).reduce((ss, l) => ss + l.quantity, 0), 0);

  const html = `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0A;color:#FAFAFA;border-radius:12px;overflow:hidden;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C9A84C,#9A7B2A);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#000;font-family:Georgia,serif;font-size:24px;">Good Morning, Ayman</h1>
      <p style="margin:8px 0 0;color:rgba(0,0,0,0.6);font-size:14px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>

    <div style="padding:24px;">
      <!-- Yesterday's Numbers -->
      <div style="background:#111;border:1px solid #2A2A2A;border-radius:8px;padding:20px;margin-bottom:20px;">
        <h3 style="color:#C9A84C;margin:0 0 12px;font-size:16px;">Yesterday's Performance</h3>
        <table style="width:100%;color:#FAFAFA;font-size:14px;">
          <tr><td style="padding:4px 0;color:#BCBCBC;">Bookings</td><td style="text-align:right;font-weight:700;">${yesterdayBookings.length}</td></tr>
          <tr><td style="padding:4px 0;color:#BCBCBC;">Tickets Sold</td><td style="text-align:right;font-weight:700;">${totalTickets}</td></tr>
          <tr><td style="padding:4px 0;color:#BCBCBC;">Revenue</td><td style="text-align:right;font-weight:700;color:#C9A84C;">$${totalBookingRevenue.toFixed(2)}</td></tr>
          <tr><td style="padding:4px 0;color:#BCBCBC;">New Reviews</td><td style="text-align:right;font-weight:700;">${newReviews.length}</td></tr>
        </table>
      </div>

      <!-- Today's Events -->
      <div style="background:#111;border:1px solid #2A2A2A;border-radius:8px;padding:20px;margin-bottom:20px;">
        <h3 style="color:#C9A84C;margin:0 0 12px;font-size:16px;">Today's Schedule</h3>
        ${todayEvents.length === 0
          ? '<p style="color:#888;font-size:14px;">No events scheduled today.</p>'
          : todayEvents.map(e => `
            <div style="padding:8px 0;border-bottom:1px solid #2A2A2A;">
              <strong>${e.title}</strong>
              <span style="float:right;color:#C9A84C;">${e.time}</span>
              <br><span style="color:#888;font-size:12px;">${e.totalSeats - e.bookedSeats} seats left of ${e.totalSeats}</span>
            </div>
          `).join('')
        }
      </div>

      <!-- Flash Sale Opportunities -->
      ${flashSaleOpportunities.length > 0 ? `
      <div style="background:rgba(255,167,38,0.1);border:1px solid rgba(255,167,38,0.3);border-radius:8px;padding:20px;margin-bottom:20px;">
        <h3 style="color:#FFA726;margin:0 0 12px;font-size:16px;">â¡ Flash Sale Opportunities</h3>
        ${flashSaleOpportunities.map(f => `
          <p style="color:#FAFAFA;font-size:14px;margin:4px 0;">"${f.eventTitle}" â ${f.occupancy}% sold, ${f.hoursUntil}h left. <strong style="color:#FFA726;">Recommend ${f.suggestedDiscount}% off.</strong></p>
        `).join('')}
      </div>` : ''}

      <!-- New Reviews -->
      ${newReviews.length > 0 ? `
      <div style="background:#111;border:1px solid #2A2A2A;border-radius:8px;padding:20px;margin-bottom:20px;">
        <h3 style="color:#C9A84C;margin:0 0 12px;font-size:16px;">New Reviews</h3>
        ${newReviews.slice(0, 5).map(r => `
          <div style="padding:8px 0;border-bottom:1px solid #2A2A2A;">
            <strong>${r.reviewerName}</strong> ${'â'.repeat(r.starRating)}${'â'.repeat(5 - r.starRating)}
            <p style="color:#BCBCBC;font-size:13px;margin:4px 0;">"${(r.reviewText || 'No text').slice(0, 100)}"</p>
            <p style="color:#C9A84C;font-size:12px;">AI Reply: ${(r.aiReply || '').slice(0, 100)}...</p>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Top Post -->
      ${topPost ? `
      <div style="background:#111;border:1px solid #2A2A2A;border-radius:8px;padding:20px;margin-bottom:20px;">
        <h3 style="color:#C9A84C;margin:0 0 12px;font-size:16px;">Top GBP Post Yesterday</h3>
        <p style="color:#FAFAFA;font-size:14px;">${topPost.text?.slice(0, 200)}</p>
      </div>` : ''}

      <!-- System Health -->
      <div style="text-align:center;padding:16px;background:#111;border-radius:8px;border:1px solid #2A2A2A;">
        <span style="color:${systemHealth.includes('error') ? '#E53935' : '#4CAF50'};font-size:14px;">â ${systemHealth}</span>
      </div>
    </div>

    <div style="text-align:center;padding:16px;border-top:1px solid #2A2A2A;">
      <a href="https://lighthousecinemapg.com/admin" style="color:#C9A84C;font-size:13px;">Open Admin Dashboard</a>
      <span style="color:#888;margin:0 8px;">|</span>
      <a href="https://lighthousecinemapg.com/admin/gbp" style="color:#C9A84C;font-size:13px;">CineMax AI Dashboard</a>
      <p style="color:#555;font-size:11px;margin-top:8px;">Lighthouse Cinema â 525 Lighthouse Ave, Pacific Grove, CA</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Lighthouse Cinema AI" <${process.env.SMTP_USER}>`,
    to: MANAGER_EMAIL,
    subject: `âï¸ Daily Digest â ${yesterdayBookings.length} bookings, ${newReviews.length} reviews, $${totalBookingRevenue.toFixed(0)} revenue`,
    html,
  });

  return { sent: true, to: MANAGER_EMAIL };
}
