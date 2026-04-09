import { NextResponse } from 'next/server';
import { calculatePricing } from '@/lib/pricing';
import { subscribeToMailchimp, triggerBookingEmail } from '@/lib/mailchimp';

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, addonIds = [], customer } = body || {};

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return NextResponse.json({ error: 'Missing customer info (name, email, phone)' }, { status: 400 });
    }

    const pricing = calculatePricing(cart, addonIds);

    const booking = {
      id: 'LH-' + Date.now(),
      createdAt: new Date().toISOString(),
      cart,
      addonIds,
      customer,
      pricing,
      status: 'pending_payment',
    };

    // Fire-and-forget email + mailchimp (don't block response)
    try { await triggerBookingEmail(booking); } catch (e) { console.error('email err', e); }
    try { await subscribeToMailchimp({ email: customer.email, name: customer.name, tags: ['Website-Booking'] }); } catch (e) { console.error('mc err', e); }

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error('booking error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
