'use client';
import { useState } from 'react';

export const metadata = undefined; // metadata moved to layout or handled separately

/* ── DATA ────────────────────────────────────────────────────── */

const packages = [
  {
    id: 'birthday',
    name: 'Birthday & Family Party',
    emoji: '🎂',
    tagline: 'Perfect for kids & family celebrations',
    basePrice: 350,
    perGuest: 18,
    includes: [
      'Private theater for 2 hours',
      'Movie of your choice on the big screen',
      'Popcorn & drinks for every guest',
      'Birthday marquee sign with your name',
      'Party music before the show',
      'Bring your own cake — no charge',
    ],
    capacity: '15–60 guests',
    bestFor: 'Kids birthdays, family reunions, quinceaneras',
    color: '#f472b6',
  },
  {
    id: 'screening',
    name: 'Private Movie Screening',
    emoji: '🎬',
    tagline: 'The whole theater, just for your group',
    basePrice: 300,
    perGuest: 15,
    includes: [
      'Private theater for 2 hours',
      'Any movie — new release, classic, or your own video',
      'Popcorn + 1 drink per guest',
      'Full concession bar available',
      'Lobby welcome sign',
    ],
    capacity: '10–110 guests',
    bestFor: 'Watch parties, date nights, friend groups, memorials',
    color: '#60a5fa',
  },
  {
    id: 'school',
    name: 'School & Group Event',
    emoji: '🎒',
    tagline: 'Field trips, clubs, and youth groups',
    basePrice: 200,
    perGuest: 10,
    includes: [
      'Private theater for 2 hours',
      'Educational or age-appropriate movie',
      'Popcorn + Coca-Cola for every student',
      'Free teacher/chaperone entry (1 per 10 students)',
      'Flexible scheduling Mon–Thu',
    ],
    capacity: '20–200 students',
    bestFor: 'Schools, churches, scouts, summer camps, nonprofits',
    color: '#4ade80',
    note: 'Weekdays only — best rates guaranteed',
  },
  {
    id: 'premium',
    name: 'Premium Celebration',
    emoji: '✨',
    tagline: 'Red-carpet treatment for special occasions',
    basePrice: 500,
    perGuest: 35,
    badge: 'Most Popular',
    includes: [
      'Private theater for 3 hours',
      'Movie or presentation on the big screen',
      'Full food & drink package (hot food, snacks, drinks)',
      'Dedicated event coordinator',
      'Custom marquee & lobby decor',
      'Sound system for speeches & toasts',
      'Priority booking on any day',
    ],
    capacity: '20–200 guests',
    bestFor: 'Corporate events, weddings, galas, fundraisers, milestone birthdays',
    color: '#fbbf24',
  },
];

const addOns = [
  { name: 'Crepe Bar (Manasiri)', price: 13, unit: 'per guest', emoji: '🥞' },
  { name: 'Pizza & Hot Dog Buffet', price: 10, unit: 'per guest', emoji: '🍕' },
  { name: 'Popcorn Bucket Tower', price: 32, unit: 'each', emoji: '🍿' },
  { name: 'Candy Bar Spread', price: 5, unit: 'per guest', emoji: '🍬' },
  { name: 'Beer & Wine Bar (21+)', price: 16, unit: 'per guest', emoji: '🍷' },
  { name: 'Decor & Balloon Package', price: 140, unit: 'flat fee', emoji: '🎈' },
  { name: 'DJ + Dance Floor Lighting', price: 325, unit: 'flat fee', emoji: '🎧' },
  { name: 'Event Photographer (1 hr)', price: 200, unit: 'flat fee', emoji: '📸' },
];

const faqs = [
  { q: 'Is the deposit refundable?', a: 'Deposits are non-refundable but can be applied to a rescheduled date if you give us at least 7 days notice. We want to work with you!' },
  { q: 'Can I bring my own cake?', a: 'Absolutely! Bring your own cake or cupcakes at no extra charge. We will even store it in our fridge until it is time to celebrate.' },
  { q: 'Can I bring outside food?', a: 'We ask that all food and drinks come from our concession menu so we can keep our prices low for everyone. We have a great selection and can customize for your group!' },
  { q: 'Do you provide popcorn and drinks?', a: 'Yes! Every package includes popcorn and drinks. Upgraded packages add hot food, candy bars, and even a full crepe station.' },
  { q: 'How many guests can attend?', a: 'Our theaters seat 100 to 200 people. For larger events, we can open multiple theaters or use our lobby and banquet spaces.' },
  { q: 'Can I rent only the room without food?', a: 'Yes — room-only rentals start at $250/hr. Text us at (831) 241-6617 and we will put together a custom quote.' },
  { q: 'What movies can we watch?', a: 'Any current release, classic film, or even your own content (home videos, presentations, slideshows). It is your screen!' },
  { q: 'How do I book?', a: 'Choose your package, pick a date, and pay a deposit right here on this page. Or text us at (831) 241-6617 and we will take care of everything.' },
];

const SQUARE_DEPOSIT_LINK = 'https://square.link/u/pfGKjKqr';
const PHONE = '(831) 241-6617';
const TAX_RATE = 0.0925;
const SERVICE_FEE_RATE = 0.10;

/* ── COMPONENT ───────────────────────────────────────────────── */

export default function PrivateEventsPage() {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [guests, setGuests] = useState(25);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  /* Calculator logic */
  const pkg = packages.find(p => p.id === selectedPkg);
  const addOnTotal = selectedAddOns.reduce((sum, idx) => {
    const a = addOns[idx];
    return sum + (a.unit === 'per guest' ? a.price * guests : a.price);
  }, 0);
  const subtotal = pkg ? (pkg.basePrice + pkg.perGuest * guests + addOnTotal) : 0;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const taxable = subtotal + serviceFee;
  const tax = Math.round(taxable * TAX_RATE * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const deposit = pkg ? (pkg.id === 'premium' ? 500 : pkg.id === 'birthday' ? 250 : pkg.id === 'school' ? 100 : 250) : 100;
  const balance = Math.max(0, Math.round((total - deposit) * 100) / 100);

  const toggleAddOn = (idx) => {
    setSelectedAddOns(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  /* Shared styles */
  const gold = '#d4af37';
  const darkBg = '#0a0a0a';
  const cardBg = '#111';
  const borderColor = '#222';
  const mutedText = '#999';

  const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' };
  const headingStyle = { textAlign: 'center', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: '12px' };
  const subheadStyle = { textAlign: 'center', color: mutedText, fontSize: '17px', maxWidth: '600px', margin: '0 auto 40px' };
  const btnPrimary = { display: 'inline-block', background: gold, color: '#000', padding: '16px 36px', borderRadius: '10px', fontWeight: 700, fontSize: '17px', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', textAlign: 'center' };
  const btnOutline = { display: 'inline-block', background: 'transparent', color: gold, padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '16px', textDecoration: 'none', border: `2px solid ${gold}`, cursor: 'pointer', textAlign: 'center' };

  return (
    <div style={{ minHeight: '100vh', background: darkBg, color: '#fff', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ══════ HERO ══════ */}
      <section style={{ textAlign: 'center', padding: '90px 20px 60px', background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0f0f 100%)' }}>
        <p style={{ color: gold, fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>
          Lighthouse Cinema & Event Center &bull; Pacific Grove
        </p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.05 }}>
          Host Your Next <span style={{ color: gold }}>Celebration</span> With Us
        </h1>
        <p style={{ color: '#bbb', fontSize: '19px', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Birthday parties, movie nights, corporate events, and everything in between.
          Pick a package, choose your date, and we handle the rest.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#packages" style={btnPrimary}>See Packages & Pricing</a>
          <a href={`sms:8312416617`} style={btnOutline}>Text Us Now</a>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section style={{ ...sectionStyle, paddingBottom: '40px' }}>
        <h2 style={headingStyle}>Book in 5 Easy Steps</h2>
        <p style={subheadStyle}>No complicated forms. No waiting for callbacks. Book your event in minutes.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '1', icon: '📦', title: 'Choose Package', desc: 'Pick the package that fits your event' },
            { step: '2', icon: '📅', title: 'Pick a Date', desc: 'Wed–Sun, daytime or evening' },
            { step: '3', icon: '🍿', title: 'Add Extras', desc: 'Food, drinks, decor, DJ — your call' },
            { step: '4', icon: '💳', title: 'Pay Deposit', desc: 'Lock in your date with a deposit' },
            { step: '5', icon: '✅', title: 'We Confirm', desc: 'You will get a text confirmation same day' },
          ].map((s) => (
            <div key={s.step} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '14px', fontWeight: 800, color: gold }}>{s.step}</div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{s.title}</p>
              <p style={{ color: mutedText, fontSize: '13px', lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ PACKAGES ══════ */}
      <section id="packages" style={{ ...sectionStyle, paddingTop: '40px' }}>
        <h2 style={headingStyle}>Event Packages</h2>
        <p style={subheadStyle}>Simple, all-inclusive pricing. Every package includes a private theater and concessions.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {packages.map((p) => (
            <div
              key={p.id}
              onClick={() => { setSelectedPkg(p.id); setTimeout(() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              style={{
                background: selectedPkg === p.id ? '#1a1520' : cardBg,
                border: selectedPkg === p.id ? `2px solid ${p.color}` : `1px solid ${borderColor}`,
                borderRadius: '20px', padding: '32px 28px', cursor: 'pointer',
                transition: 'all 0.3s', position: 'relative',
                transform: selectedPkg === p.id ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {p.badge && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: gold, color: '#000', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{p.badge}</span>}
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{p.emoji}</div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>{p.name}</h3>
              <p style={{ color: p.color, fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>{p.tagline}</p>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 800, color: gold }}>${p.basePrice}</span>
                <span style={{ color: mutedText, fontSize: '15px' }}> base</span>
                <span style={{ color: mutedText, fontSize: '15px' }}> + ${p.perGuest}/guest</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {p.includes.map((item, i) => (
                  <li key={i} style={{ padding: '5px 0', fontSize: '14px', color: '#ccc', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: p.color, flexShrink: 0 }}>&#10003;</span> {item}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '14px', fontSize: '13px', color: mutedText }}>
                <p><strong style={{ color: '#ddd' }}>Capacity:</strong> {p.capacity}</p>
                <p style={{ marginTop: '4px' }}><strong style={{ color: '#ddd' }}>Great for:</strong> {p.bestFor}</p>
                {p.note && <p style={{ marginTop: '6px', color: '#4ade80', fontWeight: 600 }}>{p.note}</p>}
              </div>
              <button
                style={{ ...btnPrimary, width: '100%', marginTop: '20px', padding: '14px', fontSize: '15px', background: selectedPkg === p.id ? gold : 'rgba(212,175,55,0.15)', color: selectedPkg === p.id ? '#000' : gold, border: `1px solid ${gold}` }}
              >
                {selectedPkg === p.id ? '✓ Selected — See Price Below' : 'Select This Package'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ PRICE CALCULATOR ══════ */}
      <section id="calculator" style={{ ...sectionStyle, paddingTop: '50px' }}>
        <h2 style={headingStyle}>Price Estimator</h2>
        <p style={subheadStyle}>Get an instant estimate. No surprises — what you see is what you pay.</p>

        <div style={{ maxWidth: '700px', margin: '0 auto', background: '#111', border: `1px solid ${borderColor}`, borderRadius: '24px', padding: '36px 32px', boxShadow: '0 0 40px rgba(212,175,55,0.06)' }}>

          {/* Package selector */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontWeight: 700, fontSize: '15px', display: 'block', marginBottom: '10px', color: '#ddd' }}>1. Choose Your Package</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {packages.map(p => (
                <button key={p.id} onClick={() => setSelectedPkg(p.id)}
                  style={{ background: selectedPkg === p.id ? 'rgba(212,175,55,0.2)' : '#1a1a1a', border: selectedPkg === p.id ? `2px solid ${gold}` : '1px solid #333', borderRadius: '12px', padding: '14px 12px', color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>{p.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guest count */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontWeight: 700, fontSize: '15px', display: 'block', marginBottom: '10px', color: '#ddd' }}>2. How Many Guests?</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="range" min="10" max="200" value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: gold, height: '8px' }}
              />
              <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', padding: '10px 18px', fontWeight: 800, fontSize: '22px', minWidth: '70px', textAlign: 'center', color: gold }}>{guests}</div>
            </div>
          </div>

          {/* Add-ons */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontWeight: 700, fontSize: '15px', display: 'block', marginBottom: '10px', color: '#ddd' }}>3. Add Extras <span style={{ color: mutedText, fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {addOns.map((a, idx) => (
                <button key={idx} onClick={() => toggleAddOn(idx)}
                  style={{ background: selectedAddOns.includes(idx) ? 'rgba(212,175,55,0.15)' : '#1a1a1a', border: selectedAddOns.includes(idx) ? `1px solid ${gold}` : '1px solid #333', borderRadius: '10px', padding: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '20px' }}>{a.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{a.name}</p>
                    <p style={{ color: gold, fontSize: '12px' }}>${a.price} {a.unit}</p>
                  </div>
                  {selectedAddOns.includes(idx) && <span style={{ marginLeft: 'auto', color: gold, fontWeight: 800 }}>&#10003;</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          {pkg && (
            <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '28px 24px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: gold }}>Your Estimate</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>{pkg.name} (base)</span>
                  <span style={{ fontWeight: 600 }}>${pkg.basePrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#ccc' }}>{guests} guests x ${pkg.perGuest}</span>
                  <span style={{ fontWeight: 600 }}>${pkg.perGuest * guests}</span>
                </div>
                {selectedAddOns.map(idx => {
                  const a = addOns[idx];
                  const cost = a.unit === 'per guest' ? a.price * guests : a.price;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#ccc' }}>{a.emoji} {a.name}</span>
                      <span style={{ fontWeight: 600 }}>${cost}</span>
                    </div>
                  );
                })}
                <div style={{ borderTop: '1px solid #333', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: mutedText }}>Service fee (10%)</span>
                  <span>${serviceFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: mutedText }}>Sales tax (9.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: `2px solid ${gold}`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
                  <span style={{ fontWeight: 800 }}>Estimated Total</span>
                  <span style={{ fontWeight: 800, color: gold }}>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Deposit / Balance */}
              <div style={{ marginTop: '24px', background: 'rgba(212,175,55,0.08)', borderRadius: '12px', padding: '20px', border: `1px solid rgba(212,175,55,0.2)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700 }}>Deposit due today</span>
                  <span style={{ fontWeight: 800, color: gold, fontSize: '20px' }}>${deposit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: mutedText }}>Balance due at event</span>
                  <span style={{ fontWeight: 600 }}>${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {!pkg && (
            <div style={{ background: '#0a0a0a', borderRadius: '16px', padding: '40px 24px', border: `1px dashed #333`, textAlign: 'center' }}>
              <p style={{ fontSize: '36px', marginBottom: '12px' }}>👆</p>
              <p style={{ color: mutedText, fontSize: '16px' }}>Select a package above to see your price estimate</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════ PAYMENT BUTTONS ══════ */}
      <section style={{ ...sectionStyle, paddingTop: '20px' }}>
        <h2 style={headingStyle}>Pay Your Deposit & Lock In Your Date</h2>
        <p style={subheadStyle}>Secure your event with a deposit through Square. Fast, safe, and easy.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto 30px' }}>
          {[
            { amount: '$100', label: 'School / Group Events', sub: 'Minimum deposit' },
            { amount: '$250', label: 'Birthdays & Screenings', sub: 'Standard deposit' },
            { amount: '$500', label: 'Premium & Corporate', sub: 'Full deposit' },
            { amount: 'Custom', label: 'Pay Any Amount', sub: 'You choose the amount' },
          ].map((d) => (
            <a
              key={d.amount}
              href={SQUARE_DEPOSIT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: d.amount === 'Custom' ? gold : cardBg,
                border: `1px solid ${d.amount === 'Custom' ? gold : borderColor}`,
                borderRadius: '16px', padding: '28px 20px', textAlign: 'center',
                textDecoration: 'none', color: d.amount === 'Custom' ? '#000' : '#fff',
                transition: 'transform 0.2s', display: 'block',
              }}
            >
              <p style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px', color: d.amount === 'Custom' ? '#000' : gold }}>{d.amount}</p>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{d.label}</p>
              <p style={{ fontSize: '12px', color: d.amount === 'Custom' ? 'rgba(0,0,0,0.6)' : mutedText }}>{d.sub}</p>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: mutedText, fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px' }}>
            All deposits are applied to your event total. Balance is due the day of your event.
            Need help? Text us anytime.
          </p>
          <a href={`sms:8312416617`} style={{ ...btnOutline, fontSize: '15px', padding: '14px 40px' }}>
            💬 Text Us: {PHONE}
          </a>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section style={{ ...sectionStyle }}>
        <h2 style={headingStyle}>Frequently Asked Questions</h2>
        <p style={subheadStyle}>Got questions? We have answers.</p>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {faqs.map((f, idx) => (
            <div key={idx} style={{ borderBottom: `1px solid ${borderColor}` }}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%', background: 'transparent', border: 'none', color: '#fff',
                  padding: '20px 0', fontSize: '16px', fontWeight: 600, textAlign: 'left',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>{f.q}</span>
                <span style={{ color: gold, fontSize: '22px', fontWeight: 300, transition: 'transform 0.3s', transform: openFaq === idx ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 0 20px', color: '#bbb', fontSize: '15px', lineHeight: 1.7 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section style={{ textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 100%)' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '16px' }}>
          Ready to Make It <span style={{ color: gold }}>Unforgettable</span>?
        </h2>
        <p style={{ color: '#bbb', fontSize: '18px', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Your community cinema is here for your biggest moments.
          Let&apos;s plan something amazing together.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#packages" style={btnPrimary}>Book Your Event</a>
          <a href={SQUARE_DEPOSIT_LINK} target="_blank" rel="noopener noreferrer" style={{ ...btnPrimary, background: '#fff', color: '#000' }}>Pay Deposit Now</a>
          <a href={`sms:8312416617`} style={btnOutline}>Text Us: {PHONE}</a>
        </div>
        <p style={{ color: mutedText, fontSize: '13px', marginTop: '30px' }}>
          525 Lighthouse Ave, Pacific Grove, CA 93950 &bull; Open Wed–Sun
        </p>
      </section>

    </div>
  );
}
