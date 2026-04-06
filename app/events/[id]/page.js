'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const PACKAGES = [
  { id: 'single', name: 'Single Ticket', desc: 'Standard admission', qty: 1 },
  { id: 'date-night', name: 'Date Night', desc: '2 tickets + 2 drinks + shared popcorn', qty: 2 },
  { id: 'group-5', name: 'Group of 5', desc: 'Buy 5, pay for 4 â save 20%', qty: 5 },
  { id: 'family-4', name: 'Family Pack', desc: '4 tickets + drinks + popcorn + kid combo â 15% off', qty: 4 },
  { id: 'season-pass', name: 'Season Pass', desc: '10 admissions, use anytime â save 30%', qty: 10 },
  { id: 'vip-screening', name: 'VIP Private Screening', desc: 'Full auditorium (140 seats) for your group â $2,500', qty: 1 },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState('single');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(r => r.json())
      .then(data => { setEvent(data.event); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const pkg = PACKAGES.find(p => p.id === selectedPkg);
    if (pkg) setQuantity(pkg.qty);
  }, [selectedPkg]);

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  function addToCart() {
    const cartItem = {
      eventId: event.id,
      eventTitle: event.title,
      ticketPrice: event.ticketPrice,
      quantity,
      packageId: selectedPkg,
      date: event.date,
      time: event.time,
      venue: event.venue,
    };

    // Store in localStorage-like approach via window
    const existing = JSON.parse(typeof window !== 'undefined' ? (window.__cart || '[]') : '[]');
    existing.push(cartItem);
    if (typeof window !== 'undefined') {
      window.__cart = JSON.stringify(existing);
      // Also use sessionStorage for persistence
      try { sessionStorage.setItem('lh_cart', JSON.stringify(existing)); } catch(e) {}
    }
    router.push('/checkout');
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0 32px' }}>This event may have been removed or doesn't exist.</p>
        <a href="/" className="btn btn-gold">Browse Events</a>
      </div>
    );
  }

  const available = event.totalSeats - event.bookedSeats;
  const pkg = PACKAGES.find(p => p.id === selectedPkg);

  return (
    <div className="animate-in">
      {/* Back */}
      <div className="container" style={{ padding: '24px 24px 0' }}>
        <a href="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>&larr; All Events</a>
      </div>

      <div className="container section" style={{ paddingTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'start' }}>

          {/* Left: Event Info */}
          <div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span className="badge badge-gold">{event.category}</span>
              {available < 20 && <span className="badge badge-red">Almost Full</span>}
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{event.title}</h1>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
              background: 'var(--dark-elevated)', borderRadius: 'var(--radius)',
              border: '1px solid var(--dark-border)', padding: '24px', marginBottom: '24px',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Date</div>
                <div style={{ fontWeight: '600' }}>{formatDate(event.date)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Time</div>
                <div style={{ fontWeight: '600' }}>{formatTime(event.time)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Venue</div>
                <div style={{ fontWeight: '600' }}>{event.venue}</div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '32px' }}>
              {event.description}
            </p>

            <div style={{
              background: 'var(--dark-elevated)', borderRadius: 'var(--radius)',
              border: '1px solid var(--dark-border)', padding: '24px',
            }}>
              <h3 style={{ marginBottom: '4px' }}>Venue Details</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Lighthouse Cinema &middot; 525 Lighthouse Ave, Pacific Grove, CA 93950
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {available} of {event.totalSeats} seats available
              </p>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div className="price-big" style={{ color: '#000' }}>${event.ticketPrice}</div>
              <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.85rem' }}>per ticket + taxes & fees</div>
            </div>

            <div className="card-body">
              {/* Package Selection */}
              <div className="form-group">
                <label className="form-label">Select Package</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PACKAGES.map(p => (
                    <label
                      key={p.id}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '12px', borderRadius: 'var(--radius-sm)',
                        border: selectedPkg === p.id
                          ? '1.5px solid var(--gold)'
                          : '1px solid var(--dark-border)',
                        background: selectedPkg === p.id
                          ? 'rgba(201,168,76,0.05)'
                          : 'var(--dark-elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="package"
                        value={p.id}
                        checked={selectedPkg === p.id}
                        onChange={() => setSelectedPkg(p.id)}
                        style={{ marginTop: '3px', accentColor: 'var(--gold)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity (only for single) */}
              {selectedPkg === 'single' && (
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <div className="qty-stepper">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="qty-value">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(available, quantity + 1))}>+</button>
                  </div>
                </div>
              )}

              {/* Quick Summary */}
              <div style={{
                background: 'var(--dark)', borderRadius: 'var(--radius-sm)',
                padding: '16px', margin: '16px 0',
                border: '1px solid var(--dark-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>{quantity} ticket{quantity > 1 ? 's' : ''} &times; ${event.ticketPrice}</span>
                  <span>${(quantity * event.ticketPrice).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>+ 18% service fee + 9.25% tax</span>
                </div>
                <div className="divider" style={{ margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '600' }}>
                  <span>Deposit due (20%)</span>
                  <span>calculated at checkout</span>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                className="btn btn-gold btn-lg"
                style={{ width: '100%' }}
                disabled={available === 0}
              >
                {available === 0 ? 'Sold Out' : 'Add to Cart & Checkout'}
              </button>

              <p style={{
                textAlign: 'center', fontSize: '0.75rem',
                color: 'var(--text-muted)', marginTop: '12px',
              }}>
                Only 20% deposit required now. Remaining balance invoiced via Square.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
