'use client';
import { useState, useMemo, useCallback } from 'react';

/* -- constants --------------------------------------------------- */
const SQUARE_PAYMENT_LINK = 'https://square.link/u/pfGKjKqr';
const PHONE = '(831) 717-3124';
const WHATSAPP_CONTACTS = [
  { name: 'Ayman', number: '18316016907' },
  { name: 'Emy',   number: '18318693640' },
  { name: 'Manal', number: '18318695231' },
];

const SERVICE_FEE_RATE = 0.10;
const TAX_RATE = 0.0925;

const TIME_SLOTS = [
  { id: '1-4',  label: '1 PM - 4 PM',  hours: 3, start: 13, end: 16, type: '3hr' },
  { id: '4-7',  label: '4 PM - 7 PM',  hours: 3, start: 16, end: 19, type: '3hr' },
  { id: '7-10', label: '7 PM - 10 PM', hours: 3, start: 19, end: 22, type: '3hr' },
  { id: '1-7',  label: '1 PM - 7 PM',  hours: 6, start: 13, end: 19, type: '6hr' },
  { id: '4-10', label: '4 PM - 10 PM', hours: 6, start: 16, end: 22, type: '6hr' },
  { id: '1-10', label: '1 PM - 10 PM', hours: 9, start: 13, end: 22, type: '9hr' },
];

const DURATION_MULTIPLIER = { '3hr': 1, '6hr': 1.75, '9hr': 2.5 };

const PACKAGES = [
  {
    id: 'birthday', name: 'Birthday Party', icon: '',
    basePrice: 350, perGuest: 18, tag: '',
    desc: 'The ultimate birthday celebration with cinema magic',
    includes: ['Private auditorium','Movie of your choice','Party setup & cleanup','Dedicated event host'],
  },
  {
    id: 'screening', name: 'Private Screening', icon: '',
    basePrice: 300, perGuest: 15, tag: '',
    desc: 'Exclusive movie experience for your group',
    includes: ['Private auditorium','Movie of your choice','Premium sound system','Lobby access'],
  },
  {
    id: 'school', name: 'School / Field Trip', icon: '',
    basePrice: 200, perGuest: 10, tag: 'Best Value',
    desc: 'Educational & fun outing for students',
    includes: ['Private auditorium','Age-appropriate film','Group seating','Teacher lounge access'],
  },
  {
    id: 'premium', name: 'Premium Gala', icon: '',
    basePrice: 500, perGuest: 35, tag: 'Most Popular',
    desc: 'First-class event with VIP treatment',
    includes: ['Full venue access','Movie + live entertainment','Premium decor package','Dedicated event coordinator','VIP lounge'],
  },
];

const ADDONS = [
  { id: 'crepe',    name: 'Crepe Bar',        price: 13, unit: 'per guest', icon: '', perGuest: true },
  { id: 'pizza',    name: 'Pizza Buffet',      price: 10, unit: 'per guest', icon: '', perGuest: true },
  { id: 'popcorn',  name: 'Popcorn Tower',     price: 32, unit: 'flat',      icon: '', perGuest: false },
  { id: 'candy',    name: 'Candy Bar',         price: 5,  unit: 'per guest', icon: '', perGuest: true },
  { id: 'drinks',   name: 'Beer & Wine Bar',   price: 16, unit: 'per guest', icon: '', perGuest: true },
  { id: 'decor',    name: 'Custom Decor',      price: 140, unit: 'flat',     icon: '', perGuest: false },
  { id: 'dj',       name: 'DJ / Sound System', price: 325, unit: 'flat',     icon: '', perGuest: false },
  { id: 'photo',    name: 'Photographer',      price: 200, unit: 'flat',     icon: '', perGuest: false },
  { id: 'food-hotdogs',  name: 'Hot Dog Bar (per guest)',   price: 8.99, unit: 'per guest', icon: '', perGuest: true },
  { id: 'food-pizza',    name: 'Pizza Party (per guest)',   price: 5,    unit: 'per guest', icon: '', perGuest: true },
  { id: 'food-wings',    name: 'Wings Platter (5 per guest)', price: 11.95, unit: 'per guest', icon: '', perGuest: true },
  { id: 'food-nachos',   name: 'Nachos & Cheese (per guest)', price: 7.99, unit: 'per guest', icon: '', perGuest: true },
  { id: 'food-pretzels', name: 'Pretzel Basket (per guest)', price: 6, unit: 'per guest', icon: '', perGuest: true },
  { id: 'food-tenders',  name: 'Chicken Tenders (per guest)', price: 10, unit: 'per guest', icon: '', perGuest: true },
];

/* -- helpers ----------------------------------------------------- */
const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);            // 48-hour lead time
  return d.toISOString().split('T')[0];
}

function formatDateNice(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function buildWhatsAppMsg(data) {
  const lines = [
    ` *NEW BOOKING REQUEST*`,
    ``,
    ` *${data.name}*`,
    ` ${data.email}`,
    ` ${data.phone}`,
    ``,
    ` *Date:* ${formatDateNice(data.date)}`,
    ` *Time:* ${data.timeSlotLabel}`,
    ` *Package:* ${data.packageName}`,
    ` *Guests:* ${data.guests}`,
  ];
  if (data.addons.length) {
    lines.push(` *Add-ons:* ${data.addons.join(', ')}`);
  }
  if (data.notes) {
    lines.push(` *Notes:* ${data.notes}`);
  }
  lines.push(``, ` *Total: ${data.total}*`);
  lines.push(``, ` Awaiting Square payment confirmation.`);
  return encodeURIComponent(lines.join('\n'));
}

/* -- sub-components ---------------------------------------------- */
function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '32px 0' }}>
      {Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const active = s === step;
        const done = s < step;
        return (
          <div key={s} style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            background: active ? '#d4af37' : done ? '#b8942e' : 'rgba(212,175,55,0.15)',
            color: active || done ? '#0a0a0a' : '#d4af37',
            border: active ? '2px solid #d4af37' : '2px solid transparent',
            transition: 'all .3s',
          }}>
            {done ? '*' : s}
          </div>
        );
      })}
    </div>
  );
}

/* -- MAIN PAGE --------------------------------------------------- */
export default function PrivateEventsPage() {
  const [step, setStep] = useState(1);

  // Step 1 - date & time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Step 2 - package & guests
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [guests, setGuests] = useState(20);

  // Step 3 - add-ons
  const [addons, setAddons] = useState({});

  // Step 4 - contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Step 5 - review & pay
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [refId, setRefId] = useState('');

  /* -- pricing calc ----------------------------------- */
  const pricing = useMemo(() => {
    if (!selectedPkg || !selectedSlot) return null;
    const pkg = PACKAGES.find(p => p.id === selectedPkg);
    const slot = TIME_SLOTS.find(s => s.id === selectedSlot);
    if (!pkg || !slot) return null;

    const mult = DURATION_MULTIPLIER[slot.type];
    const base = Math.round(pkg.basePrice * mult);
    const guestFee = pkg.perGuest * guests;

    let addonsTotal = 0;
    ADDONS.forEach(a => {
      if (addons[a.id]) {
        addonsTotal += a.perGuest ? a.price * guests : a.price;
      }
    });

    const subtotal = base + guestFee + addonsTotal;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const taxable = subtotal + serviceFee;
    const tax = Math.round(taxable * TAX_RATE * 100) / 100;
    const total = taxable + tax;

    return { base, guestFee, addonsTotal, subtotal, serviceFee, tax, total, mult, pkg, slot };
  }, [selectedPkg, selectedSlot, guests, addons]);

  /* -- navigation guards ------------------------------ */
  const canStep2 = selectedDate && selectedSlot;
  const canStep3 = selectedPkg && guests >= 1;
  const canStep4 = true; // add-ons are optional
  const canStep5 = name.trim() && email.trim() && phone.trim();

  /* -- submit & notify -------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (!pricing || submitting) return;
    setSubmitError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setSubmitError('Please enter a valid email address so we can reach you.');
      return;
    }
    const slot = TIME_SLOTS.find(s => s.id === selectedSlot);
    const pkg = PACKAGES.find(p => p.id === selectedPkg);
    const addonNames = ADDONS.filter(a => addons[a.id]).map(a => a.name);

    const payload = {
      eventType: pkg?.name || 'Private Event',
      name: name.trim(), email: email.trim(), phone: phone.trim(), notes,
      date: selectedDate ? formatDateNice(selectedDate) : '',
      timeSlotLabel: slot?.label || '',
      packageName: pkg?.name || '',
      guests,
      addons: addonNames,
      total: fmt(pricing.total),
      company: '', // honeypot
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/event-inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setRefId(data.ref || '');
        setSubmitted(true);
      } else {
        setSubmitError(data.error || 'We could not submit your request. Please call (831) 717-3124.');
      }
    } catch (e) {
      setSubmitError('Network error — please try again, or call (831) 717-3124.');
    }
    setSubmitting(false);
  }, [pricing, submitting, selectedSlot, selectedPkg, addons, name, email, phone, notes, selectedDate, guests]);

  /* -- shared styles ---------------------------------- */
  const gold = '#d4af37';
  const goldDark = '#b8942e';
  const darkBg = '#111111';
  const cardBg = '#1a1a1a';
  const cardBorder = '#2a2a2a';

  const btnPrimary = {
    background: `linear-gradient(135deg, ${gold}, ${goldDark})`,
    color: '#0a0a0a', border: 'none', borderRadius: 8,
    padding: '14px 36px', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', transition: 'all .3s', letterSpacing: '0.5px',
  };

  const btnSecondary = {
    background: 'transparent', color: gold,
    border: `1px solid ${gold}`, borderRadius: 8,
    padding: '12px 28px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', transition: 'all .3s',
  };

  /* -- SUCCESS VIEW ----------------------------------- */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}></div>
          <h1 style={{ fontSize: 32, color: gold, marginBottom: 16 }}>Request Received!</h1>
          <p style={{ fontSize: 18, color: '#ccc', lineHeight: 1.6, marginBottom: 12 }}>
            Thank you! Your event request has been sent to our team and a confirmation email is on its way to you.
            We'll be in touch as soon as possible.
          </p>
          {refId && (
            <p style={{ fontSize: 16, color: gold, fontWeight: 700, marginBottom: 28 }}>
              Reference #: {refId}
            </p>
          )}
          <div style={{
            background: cardBg, border: `1px solid ${gold}`, borderRadius: 12,
            padding: 24, marginBottom: 32, textAlign: 'left',
          }}>
            <h3 style={{ color: gold, marginBottom: 16, fontSize: 18 }}>Next Steps:</h3>
            <div style={{ color: '#ccc', lineHeight: 1.8 }}>
              <p>1. Check your email for your confirmation (Reference #{refId ? ' ' + refId : ''})</p>
              <p>2. Our team will contact you to finalize the details</p>
              <p>3. To reserve your date now, you can pay your deposit on Square below</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={SQUARE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer"
              style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
               Pay on Square
            </a>
            <a href="/"
              style={{ ...btnSecondary, textDecoration: 'none', display: 'inline-block' }}>
               Back to Home
            </a>
          </div>
          <p style={{ marginTop: 40, color: '#888', fontSize: 14 }}>
            Questions? Call us at <a href={`tel:${PHONE}`} style={{ color: gold }}>{PHONE}</a>
          </p>
        </div>
      </div>
    );
  }

  /* -- MAIN RENDER ------------------------------------ */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, rgba(212,175,55,0.12) 0%, rgba(10,10,10,1) 100%)`,
        padding: '60px 20px 40px', textAlign: 'center',
      }}>
        <a href="/" style={{ color: gold, textDecoration: 'none', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>
           Back to Lighthouse Cinema
        </a>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, marginTop: 20,
          background: `linear-gradient(135deg, ${gold}, #f5e6a3, ${goldDark})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Book Your Private Event
        </h1>
        <p style={{ color: '#aaa', fontSize: 17, marginTop: 12, maxWidth: 600, margin: '12px auto 0' }}>
          Transform Lighthouse Cinema into your exclusive venue. Pick your date, choose your package, and book instantly.
        </p>
      </div>

      <StepIndicator step={step} total={5} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 80px' }}>

        {/*  STEP 1: Date & Time  */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, color: gold, marginBottom: 8 }}>Choose Your Date & Time</h2>
            <p style={{ color: '#888', marginBottom: 28 }}>Select when you'd like to host your event (minimum 48 hours advance booking).</p>

            {/* Date picker */}
            <label style={{ display: 'block', marginBottom: 8, color: '#ccc', fontSize: 14, fontWeight: 600 }}>
              EVENT DATE
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', fontSize: 16,
                background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 8,
                color: '#fff', marginBottom: 32, outline: 'none', cursor: 'pointer',
              }}
            />

            {/* Time slots */}
            <label style={{ display: 'block', marginBottom: 12, color: '#ccc', fontSize: 14, fontWeight: 600 }}>
              TIME SLOT
            </label>

            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>3-Hour Blocks</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {TIME_SLOTS.filter(s => s.type === '3hr').map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  style={{
                    padding: '16px 20px', borderRadius: 10, cursor: 'pointer',
                    fontSize: 15, fontWeight: 600, transition: 'all .3s',
                    background: selectedSlot === slot.id ? gold : cardBg,
                    color: selectedSlot === slot.id ? '#0a0a0a' : '#fff',
                    border: selectedSlot === slot.id ? `2px solid ${gold}` : `1px solid ${cardBorder}`,
                  }}
                >
                   {slot.label}
                  <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>
                    {slot.hours} hours
                  </div>
                </button>
              ))}
            </div>

            <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>Extended Blocks  <span style={{ color: gold }}>Best Value</span></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {TIME_SLOTS.filter(s => s.type !== '3hr').map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  style={{
                    padding: '16px 20px', borderRadius: 10, cursor: 'pointer',
                    fontSize: 15, fontWeight: 600, transition: 'all .3s',
                    background: selectedSlot === slot.id ? gold : cardBg,
                    color: selectedSlot === slot.id ? '#0a0a0a' : '#fff',
                    border: selectedSlot === slot.id ? `2px solid ${gold}` : `1px solid ${cardBorder}`,
                  }}
                >
                   {slot.label}
                  <div style={{ fontSize: 12, fontWeight: 400, marginTop: 4, opacity: 0.7 }}>
                    {slot.hours} hours {slot.type === '9hr' ? ' Full Day' : ' Half Day'}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
              <button
                disabled={!canStep2}
                onClick={() => setStep(2)}
                style={{
                  ...btnPrimary,
                  opacity: canStep2 ? 1 : 0.4,
                  cursor: canStep2 ? 'pointer' : 'not-allowed',
                }}
              >
                Next: Choose Package 
              </button>
            </div>
          </div>
        )}

        {/*  STEP 2: Package & Guests  */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, color: gold, marginBottom: 8 }}>Choose Your Package</h2>
            <p style={{ color: '#888', marginBottom: 28 }}>
              {formatDateNice(selectedDate)}  {TIME_SLOTS.find(s => s.id === selectedSlot)?.label}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
              {PACKAGES.map(pkg => {
                const slot = TIME_SLOTS.find(s => s.id === selectedSlot);
                const mult = DURATION_MULTIPLIER[slot?.type || '3hr'];
                const adjustedBase = Math.round(pkg.basePrice * mult);
                const active = selectedPkg === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg.id)}
                    style={{
                      position: 'relative', textAlign: 'left',
                      padding: '24px 20px', borderRadius: 12, cursor: 'pointer',
                      transition: 'all .3s',
                      background: active ? 'rgba(212,175,55,0.1)' : cardBg,
                      border: active ? `2px solid ${gold}` : `1px solid ${cardBorder}`,
                      color: '#fff',
                    }}
                  >
                    {pkg.tag && (
                      <span style={{
                        position: 'absolute', top: -10, right: 16,
                        background: gold, color: '#0a0a0a',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{pkg.tag}</span>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{pkg.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{pkg.desc}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: gold, marginBottom: 12 }}>
                      {fmt(adjustedBase)} <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>base + {fmt(pkg.perGuest)}/guest</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {pkg.includes.map(item => (
                        <li key={item} style={{ fontSize: 13, color: '#aaa', padding: '2px 0' }}>
                          * {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Guest count */}
            <div style={{
              background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12,
              padding: 24, marginBottom: 32,
            }}>
              <label style={{ display: 'block', marginBottom: 12, color: '#ccc', fontSize: 14, fontWeight: 600 }}>
                NUMBER OF GUESTS
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setGuests(Math.max(1, guests - 5))} style={{
                  width: 44, height: 44, borderRadius: '50%', fontSize: 20,
                  background: 'rgba(212,175,55,0.15)', color: gold, border: 'none', cursor: 'pointer',
                }}></button>
                <input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 80, textAlign: 'center', fontSize: 24, fontWeight: 700,
                    background: 'transparent', border: `1px solid ${cardBorder}`, borderRadius: 8,
                    color: gold, padding: '8px', outline: 'none',
                  }}
                />
                <button onClick={() => setGuests(guests + 5)} style={{
                  width: 44, height: 44, borderRadius: '50%', fontSize: 20,
                  background: 'rgba(212,175,55,0.15)', color: gold, border: 'none', cursor: 'pointer',
                }}>+</button>
                <span style={{ color: '#888', fontSize: 14 }}>guests</span>
              </div>
              <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                Any group size welcome. Adjust as needed.
              </p>
            </div>

            {/* Live price preview */}
            {pricing && (
              <div style={{
                background: 'rgba(212,175,55,0.08)', border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 12,
                padding: 20, marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc' }}>
                  <span>Estimated subtotal</span>
                  <span style={{ color: gold, fontWeight: 700, fontSize: 20 }}>{fmt(pricing.subtotal)}</span>
                </div>
                <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>+ service fee & tax calculated at checkout</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}> Back</button>
              <button
                disabled={!canStep3}
                onClick={() => setStep(3)}
                style={{ ...btnPrimary, opacity: canStep3 ? 1 : 0.4, cursor: canStep3 ? 'pointer' : 'not-allowed' }}
              >
                Next: Add-Ons 
              </button>
            </div>
          </div>
        )}

        {/*  STEP 3: Add-Ons  */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 24, color: gold, marginBottom: 8 }}>Enhance Your Event</h2>
            <p style={{ color: '#888', marginBottom: 28 }}>Optional add-ons to make your event extra special. Skip if you don't need any.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
              {ADDONS.map(addon => {
                const active = !!addons[addon.id];
                const cost = addon.perGuest ? addon.price * guests : addon.price;
                return (
                  <button
                    key={addon.id}
                    onClick={() => setAddons(prev => ({ ...prev, [addon.id]: !prev[addon.id] }))}
                    style={{
                      textAlign: 'left', padding: '18px 16px', borderRadius: 10, cursor: 'pointer',
                      transition: 'all .3s',
                      background: active ? 'rgba(212,175,55,0.12)' : cardBg,
                      border: active ? `2px solid ${gold}` : `1px solid ${cardBorder}`,
                      color: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 22 }}>{addon.icon}</span>
                      <span style={{
                        width: 22, height: 22, borderRadius: 4,
                        border: active ? `2px solid ${gold}` : '2px solid #444',
                        background: active ? gold : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, color: '#0a0a0a', fontWeight: 700,
                      }}>{active ? '*' : ''}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>{addon.name}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                      {fmt(addon.price)}{addon.perGuest ? '/guest' : ''}  <span style={{ color: gold }}>{fmt(cost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
              <button onClick={() => setStep(2)} style={btnSecondary}> Back</button>
              <button onClick={() => setStep(4)} style={btnPrimary}>
                Next: Your Details 
              </button>
            </div>
          </div>
        )}

        {/*  STEP 4: Contact Info  */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 24, color: gold, marginBottom: 8 }}>Your Details</h2>
            <p style={{ color: '#888', marginBottom: 28 }}>We'll send your booking confirmation to this info.</p>

            <div style={{
              background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12,
              padding: 28,
            }}>
              {[
                { label: 'FULL NAME', value: name, set: setName, type: 'text', placeholder: 'John Doe' },
                { label: 'EMAIL', value: email, set: setEmail, type: 'email', placeholder: 'john@example.com' },
                { label: 'PHONE NUMBER', value: phone, set: setPhone, type: 'tel', placeholder: '(831) 555-1234' },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 6, color: '#999', fontSize: 12, fontWeight: 600, letterSpacing: '1px' }}>
                    {field.label} *
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '12px 14px', fontSize: 15,
                      background: '#111', border: `1px solid ${cardBorder}`, borderRadius: 8,
                      color: '#fff', outline: 'none',
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: '#999', fontSize: 12, fontWeight: 600, letterSpacing: '1px' }}>
                  SPECIAL REQUESTS (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special arrangements, movie preferences, dietary needs..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: 15,
                    background: '#111', border: `1px solid ${cardBorder}`, borderRadius: 8,
                    color: '#fff', outline: 'none', resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, flexWrap: 'wrap', gap: 12 }}>
              <button onClick={() => setStep(3)} style={btnSecondary}> Back</button>
              <button
                disabled={!canStep5}
                onClick={() => setStep(5)}
                style={{ ...btnPrimary, opacity: canStep5 ? 1 : 0.4, cursor: canStep5 ? 'pointer' : 'not-allowed' }}
              >
                Next: Review & Pay 
              </button>
            </div>
          </div>
        )}

        {/*  STEP 5: Review & Pay  */}
        {step === 5 && pricing && (
          <div>
            <h2 style={{ fontSize: 24, color: gold, marginBottom: 8 }}>Review & Pay</h2>
            <p style={{ color: '#888', marginBottom: 28 }}>Double-check everything, then complete your booking.</p>

            {/* Summary card */}
            <div style={{
              background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12,
              padding: 28, marginBottom: 24,
            }}>
              {/* Event details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', marginBottom: 24 }}>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>DATE</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{formatDateNice(selectedDate)}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>TIME</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{pricing.slot.label} ({pricing.slot.hours}h)</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>PACKAGE</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{pricing.pkg.icon} {pricing.pkg.name}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>GUESTS</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{guests} guests</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>CONTACT</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{name}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{email}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>PHONE</div>
                  <div style={{ fontSize: 15, color: '#fff' }}>{phone}</div>
                </div>
              </div>

              {/* Add-ons */}
              {pricing.addonsTotal > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 8 }}>ADD-ONS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ADDONS.filter(a => addons[a.id]).map(a => (
                      <span key={a.id} style={{
                        background: 'rgba(212,175,55,0.15)', color: gold,
                        padding: '4px 12px', borderRadius: 20, fontSize: 13,
                      }}>
                        {a.icon} {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notes && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 4 }}>SPECIAL REQUESTS</div>
                  <div style={{ fontSize: 14, color: '#ccc' }}>{notes}</div>
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${cardBorder}`, margin: '20px 0' }} />

              {/* Price breakdown */}
              <div style={{ fontSize: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#ccc' }}>
                  <span>Base rate ({pricing.pkg.name}, {pricing.slot.hours}h)</span>
                  <span>{fmt(pricing.base)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#ccc' }}>
                  <span>{guests} guests  {fmt(pricing.pkg.perGuest)}</span>
                  <span>{fmt(pricing.guestFee)}</span>
                </div>
                {pricing.addonsTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#ccc' }}>
                    <span>Add-ons</span>
                    <span>{fmt(pricing.addonsTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#999' }}>
                  <span>Service fee (10%)</span>
                  <span>{fmt(pricing.serviceFee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#999' }}>
                  <span>Tax (9.25%)</span>
                  <span>{fmt(pricing.tax)}</span>
                </div>
                <div style={{ borderTop: `1px solid ${gold}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: gold }}>{fmt(pricing.total)}</span>
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div style={{
              background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)`, borderRadius: 10,
              padding: 16, marginBottom: 28, fontSize: 13, color: '#aaa', lineHeight: 1.6,
            }}>
              <strong style={{ color: gold }}>How it works:</strong> Clicking "Send Request" emails your event details straight to our team and sends you a confirmation with a reference number. Our team will contact you to finalize everything. You can pay your deposit on Square afterward to lock in your date.
            </div>

            {submitError && (
              <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.4)', color: '#ffb4b0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
                {submitError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <button onClick={() => setStep(4)} disabled={submitting} style={btnSecondary}> Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  ...btnPrimary, fontSize: 18, padding: '16px 48px',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
                  opacity: submitting ? 0.7 : 1, cursor: submitting ? 'default' : 'pointer',
                }}
              >
                {submitting ? 'Sending Request…' : 'Send Request'}
              </button>
            </div>
          </div>
        )}

        {/* -- FAQ (shown on all steps) -------------------- */}
        <div style={{ marginTop: 64, borderTop: `1px solid ${cardBorder}`, paddingTop: 40 }}>
          <h3 style={{ fontSize: 22, color: gold, textAlign: 'center', marginBottom: 28 }}>Frequently Asked Questions</h3>
          {[
            {
              q: 'How far in advance should I book?',
              a: 'We recommend booking at least 48 hours in advance. For weekends and holidays, 1-2 weeks is ideal.',
            },
            {
              q: 'Can I choose any movie for my screening?',
              a: 'Yes! You can choose from our current catalog or request a specific title. We\'ll do our best to accommodate your choice.',
            },
            {
              q: 'What\'s included in the base package?',
              a: 'Every package includes exclusive use of the auditorium, your chosen movie, a dedicated event host, and setup/cleanup.',
            },
            {
              q: 'Is there a minimum or maximum guest count?',
              a: 'No minimum! Our venue comfortably seats up to 200 guests. Any group size is welcome.',
            },
            {
              q: 'Can I bring my own food or decorations?',
              a: 'Outside food is allowed with prior arrangement. We also offer catering add-ons. Custom decor is welcome!',
            },
            {
              q: 'What\'s the cancellation policy?',
              a: 'Full refund if cancelled 7+ days before your event. 50% refund for 3-7 days. No refund within 72 hours.',
            },
            {
              q: 'Do longer time slots cost more?',
              a: 'Yes  6-hour blocks are 1.75 the base rate and 9-hour blocks (full day) are 2.5 the base rate. Great value for extended celebrations!',
            },
            {
              q: 'How do I pay?',
              a: 'All payments are processed securely through Square. You\'ll pay the full amount at booking to confirm your reservation.',
            },
          ].map((faq, i) => (
            <details key={i} style={{
              background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10,
              marginBottom: 8, overflow: 'hidden',
            }}>
              <summary style={{
                padding: '16px 20px', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                color: '#ddd', listStyle: 'none',
              }}>
                {faq.q}
              </summary>
              <div style={{ padding: '0 20px 16px', color: '#999', fontSize: 14, lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* Contact footer */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#666', fontSize: 14 }}>
          <p>Need help? Call <a href={`tel:${PHONE}`} style={{ color: gold }}>{PHONE}</a> or visit us at</p>
          <p style={{ color: '#888' }}>525 Lighthouse Ave, Pacific Grove, CA 93950</p>
        </div>
      </div>
    </div>
  );
}
