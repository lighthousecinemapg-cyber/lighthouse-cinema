import { NextResponse } from 'next/server';
import { getEvent, createBooking, getBookings, getBooking } from '@/lib/events-db';
import { calculatePricing } from '@/lib/pricing';
import { findOrCreateCustomer, processDeposit, createInvoice } from '@/lib/square';
import { createCalendarEvent } from '@/lib/google-calendar';
import { sendBookingConfirmation } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');

  if (ref) {
    const booking = getBooking(ref);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    return NextResponse.json({ booking });
  }

  return NextResponse.json({ bookings: getBookings() });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      items, // [{ eventId, quantity, packageId }]
      paymentToken, // Square Web Payments SDK nonce
    } = body;

    // ââ Validate ââ
    if (!customerName || !customerEmail || !customerPhone || !items?.length || !paymentToken) {
      return NextResponse.json({ error: 'Missing required fields: name, email, phone, items, paymentToken' }, { status: 400 });
    }

    // ââ Resolve events & build pricing items ââ
    const pricingItems = [];
    for (const item of items) {
      const event = getEvent(item.eventId);
      if (!event) {
        return NextResponse.json({ error: `Event ${item.eventId} not found` }, { status: 404 });
      }
      const availableSeats = event.totalSeats - event.bookedSeats;
      if (item.quantity > availableSeats) {
        return NextResponse.json({
          error: `Only ${availableSeats} seats available for "${event.title}"`,
        }, { status: 400 });
      }
      pricingItems.push({
        eventId: event.id,
        eventTitle: event.title,
        ticketPrice: event.ticketPrice,
        quantity: item.quantity,
        packageId: item.packageId || 'single',
      });
    }

    // ââ Calculate pricing ââ
    const pricing = calculatePricing(pricingItems);
    const bookingRef = 'LH-' + Date.now().toString(36).toUpperCase();

    // ââ Square: find or create customer ââ
    let squareCustomer;
    try {
      squareCustomer = await findOrCreateCustomer({
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      });
    } catch (err) {
      console.error('Square customer error:', err);
      return NextResponse.json({ error: 'Payment setup failed. Please try again.' }, { status: 500 });
    }

    // ââ Square: process 20% deposit ââ
    let payment;
    try {
      payment = await processDeposit({
        sourceId: paymentToken,
        amountCents: Math.round(pricing.depositAmount * 100),
        customerId: squareCustomer.id,
        customerEmail,
        bookingRef,
        note: `Lighthouse Cinema â 20% Deposit â ${pricing.lineItems.map(l => l.eventTitle).join(', ')}`,
      });
    } catch (err) {
      console.error('Square payment error:', err);
      return NextResponse.json({ error: 'Payment failed. Please check your card and try again.' }, { status: 402 });
    }

    // ââ Square: create invoice for remaining 80% ââ
    let invoice = null;
    try {
      const firstEvent = pricingItems[0];
      const event = getEvent(firstEvent.eventId);
      const eventDate = new Date(event.date);
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() - 14);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      invoice = await createInvoice({
        customerId: squareCustomer.id,
        customerEmail,
        amountCents: Math.round(pricing.remainingBalance * 100),
        bookingRef,
        lineItems: pricing.lineItems,
        dueDate: dueDateStr,
      });
    } catch (err) {
      console.error('Square invoice error (non-fatal):', err);
    }

    // ââ Google Calendar ââ
    let calendarResult = { calendarEventId: null, calendarLink: null, meetLink: null };
    try {
      const firstItem = pricing.lineItems[0];
      const event = getEvent(firstItem.eventId);
      calendarResult = await createCalendarEvent({
        customerName,
        customerEmail,
        customerPhone,
        eventTitle: firstItem.eventTitle,
        eventDate: event.date,
        eventTime: event.time,
        seatCount: firstItem.quantity,
        packageName: firstItem.packageName,
        bookingRef,
        totalAmount: pricing.grandTotal,
        depositPaid: pricing.depositAmount,
        remainingBalance: pricing.remainingBalance,
      });
    } catch (err) {
      console.error('Calendar error (non-fatal):', err);
    }

    // ââ Email confirmation ââ
    try {
      const firstItem = pricing.lineItems[0];
      const event = getEvent(firstItem.eventId);
      await sendBookingConfirmation({
        customerName,
        customerEmail,
        bookingRef,
        eventTitle: firstItem.eventTitle,
        eventDate: event.date,
        eventTime: event.time,
        seatCount: firstItem.quantity,
        packageName: firstItem.packageName,
        totalAmount: pricing.grandTotal,
        depositPaid: pricing.depositAmount,
        remainingBalance: pricing.remainingBalance,
        calendarLink: calendarResult.calendarLink,
        meetLink: calendarResult.meetLink,
      });
    } catch (err) {
      console.error('Email error (non-fatal):', err);
    }

    // ââ Save booking ââ
    const bookingRecord = {
      bookingRef,
      customerName,
      customerEmail,
      customerPhone,
      lineItems: pricing.lineItems,
      subtotal: pricing.subtotal,
      serviceFee: pricing.serviceFee,
      salesTax: pricing.salesTax,
      grandTotal: pricing.grandTotal,
      depositAmount: pricing.depositAmount,
      remainingBalance: pricing.remainingBalance,
      totalDiscount: pricing.totalDiscount,
      squarePaymentId: payment.id,
      squareCustomerId: squareCustomer.id,
      squareInvoiceId: invoice?.id || null,
      calendarEventId: calendarResult.calendarEventId,
      calendarLink: calendarResult.calendarLink,
      meetLink: calendarResult.meetLink,
      createdAt: new Date().toISOString(),
    };

    createBooking(bookingRecord);

    return NextResponse.json({
      success: true,
      booking: bookingRecord,
    }, { status: 201 });

  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
  }
}
