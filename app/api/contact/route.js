import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { subscribeToMailchimp } from '@/lib/mailchimp';

export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Email to staff
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || 'lighthousecinemapg@gmail.com',
        subject: `New contact form: ${name}`,
        html: `
          <h2>New contact form submission</h2>
          <p><b>Name:</b> ${escape(name)}</p>
          <p><b>Email:</b> ${escape(email)}</p>
          <p><b>Phone:</b> ${escape(phone || '')}</p>
          <p><b>Message:</b><br/>${escape(message).replace(/\n/g, '<br/>')}</p>
        `,
      });
    } catch (e) { console.error('email send', e); }

    // Push to Mailchimp
    try {
      await subscribeToMailchimp({ email, name, tags: ['Website-Contact'] });
    } catch (e) { console.error('mailchimp', e); }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
