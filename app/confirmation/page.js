'use client';
import { useState, useEffect } from 'react';

export default function ConfirmationPage() {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lh_booking');
      if (stored) setBooking(JSON.parse(stored));
    } catch (e) {}
  }, []);

  if (!booking) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h2>No Booking Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 32px' }}>
          Looking for your booking? Contact us with your reference number.
        </p>
        <a href="/" className="btn btn-gold">Browse Events</a>
      </div>
    );
  }

  const firstItem = booking.lineItems?.[0];

  return (
    <div className="animate-in">
      <div className="container section" style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Success Header */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.1), transparent)',
          borderRadius: 'var(--radius)',
          padding: '48px 24px',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>&#127916;</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Booking Confirmed!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Your tickets are secured. Check your email for the full confirmation.
          </p>
        </div>

        {/* Booking Reference */}
        <div style={{
          textAlign: 'center', padding: '20px',
          background: 'var(--dark-card)', border: '2px solid var(--gold)',
          borderRadius: 'var(--radius)', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Booking Reference
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--gold)', fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>
            {booking.bookingRef}
          </div>
        </div>

        {/* Details Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '20px' }}>Booking Details</h3>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--gold)', fontWeight: '600', width: '40%' }}>Event</td>
                  <td style={{ padding: '8px 0' }}>{firstItem?.eventTitle || 'â'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--gold)', fontWeight: '600' }}>Tickets</td>
                  <td style={{ padding: '8px 0' }}>{firstItem?.quantity || 'â'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--gold)', fontWeight: '600' }}>Package</td>
                  <td style={{ padding: '8px 0' }}>{firstItem?.packageName || 'â'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--gold)', fontWeight: '600' }}>Customer</td>
                  <td style={{ padding: '8px 0' }}>{booking.customerName}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: 'var(--gold)', fontWeight: '600' }}>Email</td>
                  <td style={{ padding: '8px 0' }}>{booking.customerEmail}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <h3 style={{ marginBottom: '20px' }}>Payment Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>${booking.subtotal?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Service Fee (18%)</span>
              <span>${booking.serviceFee?.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sales Tax (9.25%)</span>
              <span>${booking.salesTax?.toFixed(2)}</span>
            </div>
            <div className="divider"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginBottom: '16px' }}>
              <span>Grand Total</span>
              <span className="gold-text">${booking.grandTotal?.toFixed(2)}</span>
            </div>
            <div style={{
              background: 'var(--dark-elevated)', borderRadius: 'var(--radius-sm)',
              padding: '16px', border: '1px solid var(--dark-border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--success)', fontWeight: '600' }}>Deposit Paid</span>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>-${booking.depositAmount?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gold)', fontWeight: '600' }}>Remaining Balance</span>
                <span style={{ color: 'var(--gold)', fontWeight: '700', fontSize: '1.1rem' }}>${booking.remainingBalance?.toFixed(2)}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              A Square invoice for the remaining balance has been sent to your email. Payment is due 14 days before the event.
            </p>
          </div>
        </div>

        {/* Calendar & Meet Links */}
        {(booking.calendarLink || booking.meetLink) && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {booking.calendarLink && (
              <a href={booking.calendarLink} target="_blank" rel="noopener noreferrer" className="btn btn-gold" style={{ flex: 1 }}>
                Add to Google Calendar
              </a>
            )}
            {booking.meetLink && (
              <a href={booking.meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1 }}>
                Join Virtual Screening Room
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/" className="btn btn-dark" style={{ flex: 1 }}>Browse More Events</a>
          <a
            href="https://messages.squareup.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ flex: 1 }}
          >
            Message Us on Square
          </a>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '32px',
        }}>
          Questions? Contact us at (831) 717-3124 or lighthousecinemapg@gmail.com
        </p>
      </div>
    </div>
  );
}
