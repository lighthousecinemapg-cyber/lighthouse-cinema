'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TAX_RATE = 0.0925;
const DEPOSIT_RATE = 0.20;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [squareReady, setSquareReady] = useState(false);
  const cardRef = useRef(null);
  const paymentRef = useRef(null);

  // Load cart from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lh_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Initialize Square Web Payments SDK
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
    if (!appId || !locationId) return;

    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = async () => {
      try {
        const payments = window.Square.payments(appId, locationId);
        paymentRef.current = payments;
        const card = await payments.card();
        await card.attach('#square-card');
        cardRef.current = card;
        setSquareReady(true);
      } catch (err) {
        console.error('Square init error:', err);
      }
    };
    document.head.appendChild(script);
  }, []);

  // Pricing calculations
  function calcPricing() {
    let subtotal = 0;
    for (const item of cart) {
      subtotal += item.ticketPrice * item.quantity;
    }
    const taxableAmount = subtotal;
    const salesTax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
    const grandTotal = Math.round((subtotal + salesTax) * 100) / 100;
    const deposit = Math.round(grandTotal * DEPOSIT_RATE * 100) / 100;
    const remaining = Math.round((grandTotal - deposit) * 100) / 100;
    return { subtotal, salesTax, grandTotal, deposit, remaining };
  }

  function removeItem(index) {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    try { sessionStorage.setItem('lh_cart', JSON.stringify(updated)); } catch (e) {}
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone) {
      setError('Please fill in all contact fields.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setProcessing(true);

    try {
      // Get payment token from Square
      let paymentToken = 'DEMO_TOKEN'; // fallback for testing
      if (cardRef.current) {
        const tokenResult = await cardRef.current.tokenize();
        if (tokenResult.status === 'OK') {
          paymentToken = tokenResult.token;
        } else {
          setError('Payment card error. Please check your card details.');
          setProcessing(false);
          return;
        }
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          items: cart.map(item => ({
            eventId: item.eventId,
            quantity: item.quantity,
            packageId: item.packageId,
          })),
          paymentToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Booking failed. Please try again.');
        setProcessing(false);
        return;
      }

      // Clear cart and redirect to confirmation
      try { sessionStorage.removeItem('lh_cart'); } catch (e) {}

      // Store booking ref for confirmation page
      try { sessionStorage.setItem('lh_booking_ref', data.booking.bookingRef); } catch (e) {}
      try { sessionStorage.setItem('lh_booking', JSON.stringify(data.booking)); } catch (e) {}

      router.push('/confirmation');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  }

  const pricing = calcPricing();

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div className="animate-in">
      <div className="container section">
        <h1 style={{ fontSize: '2rem', marginBottom: '32px' }}>
          <span className="gold-text">Checkout</span>
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Your cart is empty</p>
            <a href="/" className="btn btn-gold">Browse Events</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'start' }}>

            {/* Left: Cart + Form */}
            <div>
              {/* Cart Items */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Your Tickets</h3>
                {cart.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px', marginBottom: '8px',
                    background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{item.eventTitle}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatDate(item.date)} &middot; {formatTime(item.time)} &middot; {item.quantity} ticket{item.quantity > 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                        {item.packageId !== 'single' ? item.packageId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Standard'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontWeight: '600' }}>${(item.ticketPrice * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItem(idx)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--error)',
                          cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
                        }}
                        aria-label="Remove item"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div style={{
                background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                borderRadius: 'var(--radius)', padding: '24px',
              }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Contact Information</h3>
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(831) 555-1234"
                      required
                    />
                  </div>

                  {/* Square Card Element */}
                  <div className="form-group">
                    <label className="form-label">Payment Card</label>
                    <div
                      id="square-card"
                      style={{
                        minHeight: '50px',
                        background: 'var(--dark-elevated)',
                        border: '1px solid var(--dark-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px',
                      }}
                    >
                      {!squareReady && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Loading secure payment form...
                        </p>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Secured by Square. Only 20% deposit is charged now.
                    </p>
                  </div>

                  {error && <div className="alert alert-error">{error}</div>}

                  <button
                    type="submit"
                    className="btn btn-gold btn-lg"
                    style={{ width: '100%' }}
                    disabled={processing}
                  >
                    {processing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="spinner"></span>
                        Processing...
                      </span>
                    ) : (
                      `Pay $${pricing.deposit.toFixed(2)} Deposit`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                padding: '20px 24px',
              }}>
                <h3 style={{ color: '#000', margin: 0, fontSize: '1.1rem' }}>Order Summary</h3>
              </div>
              <div className="card-body">
                {cart.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.9rem', marginBottom: '8px',
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.eventTitle} &times; {item.quantity}
                    </span>
                    <span>${(item.ticketPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="divider"></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Sales Tax (9.25%)</span>
                  <span>${pricing.salesTax.toFixed(2)}</span>
                </div>

                <div className="divider"></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>
                  <span>Total</span>
                  <span className="gold-text">${pricing.grandTotal.toFixed(2)}</span>
                </div>

                <div style={{
                  background: 'var(--dark)', borderRadius: 'var(--radius-sm)',
                  padding: '16px', border: '1px solid var(--dark-border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>Deposit Due Now (20%)</span>
                    <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem' }}>${pricing.deposit.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Remaining (invoiced)</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>${pricing.remaining.toFixed(2)}</span>
                  </div>
                </div>

                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  textAlign: 'center', marginTop: '16px', lineHeight: '1.5',
                }}>
                  A Square invoice for the remaining ${pricing.remaining.toFixed(2)} will be emailed to you. Payment is due 14 days before the event.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
