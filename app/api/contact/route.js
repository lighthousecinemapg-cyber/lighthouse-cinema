import { NextResponse } from 'next/server';
import { submitInquiry } from '@/lib/inquiry';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    const page = request.headers.get('referer') || '';
    const { name, email, phone, message, company } = await request.json();

    if (company) return NextResponse.json({ ok: true }); // honeypot
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please provide your name, email, and a message.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const result = await submitInquiry({
      type: 'Contact',
      name, email, phone,
      fields: { 'Message': message },
      page, ip,
    });

    return NextResponse.json({ ok: true, ref: result.ref });
  } catch (e) {
    console.error('[contact] error:', e.message);
    return NextResponse.json({ error: 'Server error. Please call (831) 717-3124.' }, { status: 500 });
  }
}
