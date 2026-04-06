// ================================================================
// EMAIL â Booking confirmations via Nodemailer
// ================================================================
import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendBookingConfirmation({
  customerName,
  customerEmail,
  bookingRef,
  eventTitle,
  eventDate,
  eventTime,
  seatCount,
  packageName,
  totalAmount,
  depositPaid,
  remainingBalance,
  calendarLink,
  meetLink,
}) {
  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0A0A0A;color:#FAFAFA;padding:40px 20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#C9A84C,#9A7B2A);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;color:#000;">ð¬ Booking Confirmed!</h1>
          <p style="margin:8px 0 0;color:#000;opacity:0.8;">Lighthouse Cinema Â· Pacific Grove</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;color:#FAFAFA;">Hi ${customerName},</p>
          <p style="color:#BCBCBC;line-height:1.6;">Your booking is confirmed! Here are your details:</p>

          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:8px;padding:24px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Booking Ref</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${bookingRef}</td></tr>
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Event</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${eventTitle}</td></tr>
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Date</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${eventDate}</td></tr>
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Time</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${eventTime}</td></tr>
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Seats</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${seatCount}</td></tr>
              <tr><td style="padding:8px 0;color:#C9A84C;font-weight:600;">Package</td><td style="padding:8px 0;color:#FAFAFA;text-align:right;">${packageName}</td></tr>
            </table>
          </div>

          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:8px;padding:24px;margin:24px 0;">
            <h3 style="margin:0 0 16px;color:#C9A84C;">Payment Summary</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;color:#BCBCBC;">Total</td><td style="padding:6px 0;color:#FAFAFA;text-align:right;font-weight:600;">$${totalAmount.toFixed(2)}</td></tr>
              <tr><td style="padding:6px 0;color:#BCBCBC;">Deposit Paid (20%)</td><td style="padding:6px 0;color:#4CAF50;text-align:right;font-weight:600;">-$${depositPaid.toFixed(2)}</td></tr>
              <tr style="border-top:1px solid #2A2A2A;"><td style="padding:12px 0 6px;color:#C9A84C;font-weight:700;">Remaining Balance</td><td style="padding:12px 0 6px;color:#C9A84C;text-align:right;font-weight:700;font-size:18px;">$${remainingBalance.toFixed(2)}</td></tr>
            </table>
            <p style="color:#888;font-size:12px;margin-top:12px;">An invoice for the remaining balance has been sent to your email via Square. Payment is due 14 days before the event.</p>
          </div>

          ${calendarLink ? `<a href="${calendarLink}" style="display:block;background:#C9A84C;color:#000;text-align:center;padding:14px 24px;border-radius:6px;text-decoration:none;font-weight:700;margin:24px 0;">Add to Google Calendar</a>` : ''}
          ${meetLink ? `<p style="text-align:center;"><a href="${meetLink}" style="color:#C9A84C;">Join Virtual Screening Room (Google Meet)</a></p>` : ''}

          <div style="border-top:1px solid #2A2A2A;margin-top:32px;padding-top:24px;text-align:center;">
            <p style="color:#888;font-size:13px;">
              Lighthouse Cinema Â· 525 Lighthouse Ave Â· Pacific Grove, CA 93950<br>
              (831) 717-3124 Â· lighthousecinemapg@gmail.com
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Lighthouse Cinema" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `ð¬ Booking Confirmed â ${eventTitle} | Ref: ${bookingRef}`,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email Error:', error);
    return false;
  }
}
