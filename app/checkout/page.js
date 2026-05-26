'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADDONS, calculatePricing, formatPrice } from '@/lib/pricing';
import { CONCESSION_ITEMS, MODIFIER_GROUPS, COMBO_INCLUDES, calculateItemTotal } from '@/lib/concession-config';

const TAX_RATE = 0.0925;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [addonIds, setAddonIds] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lh_cart');
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    try {
      const conc = sessionStorage.getItem('lh_concessions');
      if (conc) setConcessions(JSON.parse(conc));
    } catch {}
    try {
      const tix = sessionStorage.getItem('lh_ticket_selection');
      if (tix) setTicketInfo(JSON.parse(tix));
    } catch {}
  }, []);

  const hasTickets = cart.length > 0 || ticketInfo;
  const hasConcessions = concessions.length > 0;

  if (!hasTickets && !hasConcessions) {
    return (
      <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: 80, textAlign: 'center' }}>
        <h1 style={{ color: '#d4af37' }}>Your cart is empty</h1>
        <p style={{ color: 'rgba(245,233,200,0.6)', marginTop: '12px' }}>Browse movies or order food to get started.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
          <a href="/" style={{ color: '#d4af37', padding: '12px 24px', border: '1px solid #d4af37', borderRadius: '999px', textDecoration: 'none' }}>Browse Movies</a>
          <a href="/concessions" style={{ color: '#d4af37', padding: '12px 24px', border: '1px solid #d4af37', borderRadius: '999px', textDecoration: 'none' }}>Order Food</a>
        </div>
      </main>
    );
  }

  const ticketItems = cart.map(c => ({ packageId: c.packageId, quantity: c.quantity, addonIds }));
  const ticketPricing = cart.length > 0 ? calculatePricing(ticketItems) : { lineItems: [], subtotal: 0, salesTax: 0, grandTotal: 0, salesTaxRate: TAX_RATE };

  let concessionSubtotal = 0;
  const concessionLineItems = concessions.map(ci => {
    const item = CONCESSION_ITEMS.find(i => i.id === ci.itemId);
    if (!item) return null;
    const lineTotal = calculateItemTotal(item, ci.quantity, ci.isCombo, ci.modifiers || []);
    concessionSubtotal += lineTotal;
    return {
      name: ci.isCombo ? `${item.name} COMBO` : item.name,
      quantity: ci.quantity,
      unitPrice: ci.isCombo ? item.comboPrice : item.price,
      lineTotal,
      modifiers: ci.modifiers || [],
      sauceChoice: ci.sauceChoice || '',
    };
  }).filter(Boolean);

  const combinedSubtotal = ticketPricing.subtotal + concessionSubtotal;
  const combinedTax = Math.round(combinedSubtotal * TAX_RATE * 100) / 100;
  const combinedTotal = Math.round((combinedSubtotal + combinedTax) * 100) / 100;

  function toggleAddon(id) {
    setAddonIds(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);
  }

  function removeConcessionItem(index) {
    const updated = concessions.filter((_, i) => i !== index);
    setConcessions(updated);
    sessionStorage.setItem('lh_concessions', JSON.stringify(updated));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setPlacing(true); setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cart, addonIds, customer,
          pricing: { ...ticketPricing, concessions: concessionLineItems, concessionSubtotal, combinedSubtotal, combinedTax, combinedTotal },
          concessions: concessionLineItems,
          ticketInfo,
        }),
      });
      if (!res.ok) throw new Error('Booking failed');
      const data = await res.json();
      sessionStorage.removeItem('lh_cart');
      sessionStorage.removeItem('lh_concessions');
      sessionStorage.removeItem('lh_ticket_selection');
      router.push(`/confirmation?ref=${data.bookingRef || ''}`);
    } catch (err) {
      setError('Could not place booking. Please try again.');
      setPlacing(false);
    }
  }

  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '32px 20px 140px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <a href="/" style={{ color: '#d4af37', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Movies</a>
        <h1 style={{ color: '#d4af37', fontSize: 36, marginBottom: 4, marginTop: 16 }}>Checkout</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>Review your order and complete your purchase.</p>

        {cart.length > 0 && (
          <section style={section}>
            <h3 style={sh}>Movie Tickets</h3>
            {cart.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2a2a' }}>
                <div>
                  <strong>{c.eventTitle || c.movieTitle || 'Movie Ticket'}</strong>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>{c.packageName} x {c.quantity}</div>
                </div>
                <div style={{ color: '#d4af37', fontWeight: 700 }}>{formatPrice(c.unitPrice * c.quantity)}</div>
              </div>
            ))}
          </section>
        )}

        {ticketInfo && !cart.length && (
          <section style={section}>
            <h3 style={sh}>Movie Tickets</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2a2a' }}>
              <div>
                <strong>{ticketInfo.movieTitle}</strong>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{ticketInfo.showtime} — {ticketInfo.ticketType} x {ticketInfo.quantity}</div>
              </div>
              <div style={{ color: '#d4af37', fontWeight: 700 }}>{formatPrice(ticketInfo.price * ticketInfo.quantity)}</div>
            </div>
          </section>
        )}

        {hasConcessions && (
          <section style={section}>
            <h3 style={sh}>Food & Drinks</h3>
            {concessionLineItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2a2a2a' }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.name}</strong>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    x {item.quantity}
                    {item.modifiers?.length > 0 && ` · ${item.modifiers.join(', ')}`}
                    {item.sauceChoice && ` · ${item.sauceChoice} sauce`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>{formatPrice(item.lineTotal)}</span>
                  <button onClick={() => removeConcessionItem(i)}
                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                </div>
              </div>
            ))}
            <a href="/concessions" style={{ display: 'inline-block', color: '#d4af37', fontSize: '0.85rem', marginTop: '12px', textDecoration: 'none' }}>
              + Add more food & drinks
            </a>
          </section>
        )}

        {!hasConcessions && (
          <section style={{ ...section, textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(212,175,55,0.3)' }}>
            <h3 style={{ color: '#d4af37', fontSize: '1.1rem', marginBottom: '8px' }}>Want food & drinks for your movie?</h3>
            <p style={{ color: 'rgba(245,233,200,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Skip the line — order ahead and have it ready when you arrive.
            </p>
            <a href="/concessions" style={{
              display: 'inline-block', padding: '12px 28px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid #d4af37',
              borderRadius: '999px', color: '#d4af37', textDecoration: 'none',
              fontWeight: 700, fontSize: '0.95rem',
            }}>Browse Menu →</a>
          </section>
        )}

        {cart.length > 0 && (
          <section style={section}>
            <h3 style={sh}>Premium Upgrades</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {ADDONS.map(a => (
                <label key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  border: `1px solid ${addonIds.includes(a.id) ? '#d4af37' : '#2a2a2a'}`,
                  borderRadius: 10, cursor: 'pointer',
                  background: addonIds.includes(a.id) ? 'rgba(212,175,55,0.08)' : 'transparent',
                }}>
                  <input type="checkbox" checked={addonIds.includes(a.id)} onChange={() => toggleAddon(a.id)}
                    style={{ accentColor: '#d4af37' }} />
                  <div style={{ flex: 1 }}>
                    <strong>{a.name}</strong>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{a.description}</div>
                  </div>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>+{formatPrice(a.price)}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <form onSubmit={placeOrder} style={section}>
          <h3 style={sh}>Your Details</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <Input label="Name" value={customer.name} onChange={v => setCustomer({ ...customer, name: v })} required />
            <Input label="Email" type="email" value={customer.email} onChange={v => setCustomer({ ...customer, email: v })} required />
            <Input label="Phone" type="tel" value={customer.phone} onChange={v => setCustomer({ ...customer, phone: v })} required />
          </div>

          <div style={{ marginTop: 20, padding: 16, background: '#0a0a0a', borderRadius: 10, border: '1px solid #2a2a2a' }}>
            {ticketPricing.subtotal > 0 && <Row label="Tickets" value={formatPrice(ticketPricing.subtotal)} />}
            {concessionSubtotal > 0 && <Row label="Food & Drinks" value={formatPrice(concessionSubtotal)} />}
            <Row label="Subtotal" value={formatPrice(combinedSubtotal)} />
            <Row label={`Sales Tax (${(TAX_RATE * 100).toFixed(2)}%)`} value={formatPrice(combinedTax)} />
            <div style={{ height: 1, background: '#2a2a2a', margin: '10px 0' }} />
            <Row bold label="Total" value={<span style={{ color: '#d4af37', fontSize: '1.15rem' }}>{formatPrice(combinedTotal)}</span>} />
          </div>

          {error && <p style={{ color: '#ff6b6b', marginTop: 12 }}>{error}</p>}
          <button type="submit" disabled={placing} style={{
            marginTop: 16, width: '100%', padding: 18,
            background: '#d4af37', color: '#0a0a0a', border: 0, borderRadius: 999,
            fontWeight: 800, fontSize: 17, cursor: 'pointer',
          }}>{placing ? 'Processing…' : `Pay ${formatPrice(combinedTotal)}`}</button>
        </form>
      </div>
    </main>
  );
}

const section = { background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, padding: 22, marginBottom: 18 };
const sh = { margin: '0 0 12px', color: '#d4af37', fontSize: 18 };

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#d4af37' }}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{
          background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#f5e9c8',
          padding: '12px 14px', borderRadius: 10, fontSize: 15,
        }} />
    </label>
  );
}
