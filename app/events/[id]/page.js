'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PACKAGES, formatPrice } from '@/lib/pricing';

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

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }
  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  function bookNow() {
    const pkg = PACKAGES.find(p => p.id === selectedPkg);
    const item = {
      eventId: event.id,
      eventTitle: event.title,
      date: event.date,
      time: event.time,
      packageId: pkg.id,
      packageName: pkg.name,
      ticketPrice: pkg.price,
      quantity,
    };
    try { sessionStorage.setItem('lh_cart', JSON.stringify([item])); } catch {}
    router.push('/checkout');
  }

  if (loading) return <div style={{ padding: 120, textAlign: 'center', color: '#d4af37' }}>Loading…</div>;
  if (!event) return (
    <div style={{ padding: 120, textAlign: 'center', color: '#f5e9c8', background: '#0a0a0a' }}>
      <h2>Event not found</h2>
      <a href="/events" style={{ color: '#d4af37' }}>Browse all events</a>
    </div>
  );

  const pkg = PACKAGES.find(p => p.id === selectedPkg);

  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '28px 20px 140px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <a href="/events" style={{ color: '#d4af37', textDecoration: 'none' }}>← All Events</a>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 32, marginTop: 20 }} className="event-grid">
          <section>
            <h1 style={{ fontSize: 40, margin: '8px 0 12px', color: '#f5e9c8' }}>{event.title}</h1>
            <div style={{ opacity: 0.85, marginBottom: 16 }}>
              📅 {formatDate(event.date)} · ⏰ {formatTime(event.time)} · 📍 {event.venue}
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.7, opacity: 0.9 }}>{event.description}</p>
          </section>

          <aside style={{
            background: '#141414', border: '1px solid #2a2a2a', borderRadius: 18, padding: 22,
            position: 'sticky', top: 100, alignSelf: 'start',
          }}>
            <h3 style={{ marginTop: 0, color: '#d4af37' }}>Choose a package</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {PACKAGES.map(p => (
                <label key={p.id} style={{
                  display: 'block', padding: 14, borderRadius: 12, cursor: 'pointer',
                  background: selectedPkg === p.id ? 'rgba(212,175,55,0.1)' : '#0f0f0f',
                  border: `1px solid ${selectedPkg === p.id ? '#d4af37' : '#2a2a2a'}`,
                }}>
                  <input type="radio" name="pkg" checked={selectedPkg === p.id}
                    onChange={() => setSelectedPkg(p.id)} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ color: '#f5e9c8' }}>{p.name}</strong>
                    <span style={{ color: '#d4af37', fontWeight: 700 }}>{formatPrice(p.price)}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{p.description}</div>
                  {p.badge && <div style={{ fontSize: 11, color: '#d4af37', marginTop: 6 }}>{p.badge}</div>}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, opacity: 0.8 }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={stepBtn}>−</button>
                <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={stepBtn}>+</button>
              </div>
            </div>

            <div style={{
              marginTop: 16, padding: 14, background: '#0a0a0a', borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', fontWeight: 700,
            }}>
              <span>Total</span>
              <span style={{ color: '#d4af37' }}>{formatPrice(pkg.price * quantity)}</span>
            </div>

            <button onClick={bookNow} style={{
              marginTop: 14, width: '100%', padding: '16px',
              background: '#d4af37', color: '#0a0a0a', border: 0,
              borderRadius: 999, fontWeight: 800, fontSize: 16, cursor: 'pointer',
            }}>Book Now →</button>
            <p style={{ fontSize: 11, opacity: 0.6, textAlign: 'center', marginTop: 8 }}>Limited availability</p>
          </aside>
        </div>
      </div>
      <style>{`@media (max-width:860px){.event-grid{grid-template-columns:1fr!important}}`}</style>
    </main>
  );
}

const stepBtn = {
  width: 32, height: 32, borderRadius: 999, border: '1px solid #d4af37',
  background: 'transparent', color: '#d4af37', fontSize: 18, cursor: 'pointer',
};
