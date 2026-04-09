export const metadata = { title: 'VIP Club | Lighthouse Cinema' };

const TIERS = [
  { name: 'Silver', price: 99, perks: ['10% off all events', 'Free popcorn every visit', 'Early-bird booking'] },
  { name: 'Gold', price: 199, perks: ['20% off all events', 'Free popcorn + drink', 'Priority booking', '1 free Date Night / yr'], featured: true },
  { name: 'Platinum', price: 399, perks: ['30% off all events', 'Free VIP snacks', 'Priority + guaranteed seats', '1 free private screening / yr'] },
];

export default function VipPage() {
  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '40px 20px 140px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ color: '#d4af37', fontSize: 44, marginBottom: 8 }}>VIP Club</h1>
        <p style={{ opacity: 0.85, fontSize: 18 }}>Annual membership. Bigger discounts, priority seating, free popcorn every visit.</p>

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginTop: 32 }}>
          {TIERS.map(t => (
            <div key={t.name} style={{
              background: t.featured ? 'linear-gradient(160deg,#1a1305,#0a0a0a)' : '#141414',
              border: `1px solid ${t.featured ? '#d4af37' : '#2a2a2a'}`,
              borderRadius: 18, padding: 26,
            }}>
              {t.featured && <div style={{ color: '#d4af37', fontSize: 11, letterSpacing: 1 }}>⭐ MOST POPULAR</div>}
              <h3 style={{ color: '#f5e9c8', fontSize: 28, margin: '6px 0' }}>{t.name}</h3>
              <div style={{ color: '#d4af37', fontSize: 32, fontWeight: 800 }}>${t.price}<span style={{ fontSize: 14, opacity: 0.7 }}>/yr</span></div>
              <ul style={{ paddingLeft: 18, marginTop: 16, lineHeight: 1.9, opacity: 0.9 }}>
                {t.perks.map(p => <li key={p}>{p}</li>)}
              </ul>
              <a href="/contact" style={{
                display: 'block', textAlign: 'center', marginTop: 18, padding: 14,
                background: '#d4af37', color: '#0a0a0a', borderRadius: 999,
                textDecoration: 'none', fontWeight: 800,
              }}>Join {t.name}</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
