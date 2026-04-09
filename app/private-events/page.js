'use client';

import { useState, useEffect, useCallback } from 'react';

/* PRICING DATA (from official rate sheets) */
const AUDITORIUM_RATES = {
  smallNonprofit: {
    label: 'Small Nonprofit',
    sublabel: 'Under $5M annual revenue',
    day: { mon: 200, tue: 200, wed: 200, thu: 200, fri: 200, sat: 250, sun: 250 },
    evening: { mon: 250, tue: 300, wed: 350, thu: 400, fri: 450, sat: 500, sun: 400 },
  },
  largeNonprofit: {
    label: 'Large Nonprofit / Individual',
    sublabel: 'Over $5M revenue or personal events',
    day: { mon: 250, tue: 250, wed: 250, thu: 250, fri: 250, sat: 300, sun: 300 },
    evening: { mon: 300, tue: 350, wed: 400, thu: 450, fri: 500, sat: 600, sun: 450 },
  },
  corporate: {
    label: 'Corporate / Large Business',
    sublabel: 'Over $10M annual revenue',
    day: { mon: 300, tue: 300, wed: 300, thu: 300, fri: 300, sat: 400, sun: 400 },
    evening: { mon: 350, tue: 400, wed: 450, thu: 550, fri: 600, sat: 750, sun: 550 },
  },
};

const MEZZANINE_RATES = {
  smallNonprofit: { label: 'Small Nonprofit', sublabel: 'Under $5M annual revenue', day: 150, evening: 300, sunday: 200 },
  largeNonprofit: { label: 'Large Nonprofit / Individual', sublabel: 'Over $5M revenue or personal events', day: 175, evening: 400, sunday: 250 },
  corporate: { label: 'Corporate / Large Business', sublabel: 'Over $10M annual revenue', day: 200, evening: 500, sunday: 300 },
};

const EVENT_TYPES = [
  { id: 'birthday', icon: '\u{1F382}', label: 'Birthday Party' },
  { id: 'movie', icon: '\u{1F3AC}', label: 'Private Movie Screening' },
  { id: 'corporate', icon: '\u{1F4BC}', label: 'Corporate Event' },
  { id: 'wedding', icon: '\u{1F48D}', label: 'Wedding / Celebration' },
  { id: 'fundraiser', icon: '\u{1F91D}', label: 'Fundraiser / Gala' },
  { id: 'custom', icon: '\u{2728}', label: 'Custom Event' },
];

const CLEANING_FEE = 50;
const TECH_SUPPORT_RATE = 100;
const SERVICE_FEE_RATE = 0.18;
const TAX_RATE = 0.0925;
const SECURITY_DEPOSIT = 500;
const DAY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function getTimeOfDay(hour, dayOfWeek, space) {
  if (space === 'mezzanine') {
    if (dayOfWeek === 0) return 'sunday';
    return hour < 19 ? 'day' : 'evening';
  }
  if (dayOfWeek === 0) return hour < 17 ? 'day' : 'evening';
  if (dayOfWeek >= 4) return hour < 17 ? 'day' : 'evening';
  return hour < 18 ? 'day' : 'evening';
}

function getHourlyRate(space, rateType, dayOfWeek, timeOfDay) {
  const dayKey = DAY_MAP[dayOfWeek];
  if (space === 'auditorium') {
    const rates = AUDITORIUM_RATES[rateType];
    return rates[timeOfDay][dayKey];
  }
  const rates = MEZZANINE_RATES[rateType];
  if (timeOfDay === 'sunday') return rates.sunday;
  return rates[timeOfDay];
}

export default function PrivateEventsPage() {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState('');
  const [space, setSpace] = useState('');
  const [rateType, setRateType] = useState('largeNonprofit');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState(18);
  const [duration, setDuration] = useState(2);
  const [guests, setGuests] = useState(50);
  const [addTech, setAddTech] = useState(false);
  const [techHours, setTechHours] = useState(1);
  const [addMics, setAddMics] = useState(false);
  const [addCustomSetup, setAddCustomSetup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedDate = date ? new Date(date + 'T12:00:00') : null;
  const dayOfWeek = selectedDate ? selectedDate.getDay() : 5;
  const timeOfDay = getTimeOfDay(startHour, dayOfWeek, space || 'auditorium');
  const dayName = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const hourlyRate = space && rateType ? getHourlyRate(space, rateType, dayOfWeek, timeOfDay) : 0;
  const subtotal = hourlyRate * duration;
  const cleaningFee = CLEANING_FEE;
  const techCost = addTech ? TECH_SUPPORT_RATE * techHours : 0;
  const preServiceTotal = subtotal + cleaningFee + techCost;
  const serviceFee = Math.round(preServiceTotal * SERVICE_FEE_RATE * 100) / 100;
  const preTaxTotal = preServiceTotal + serviceFee;
  const tax = Math.round(preTaxTotal * TAX_RATE * 100) / 100;
  const total = Math.round((preTaxTotal + tax) * 100) / 100;

  const canProceed = (s) => {
    if (s === 1) return !!eventType;
    if (s === 2) return !!space && !!rateType;
    if (s === 3) return !!date;
    if (s === 4) return duration >= 1;
    if (s === 5) return guests >= 1;
    if (s === 6) return true;
    if (s === 7) return name && email && phone;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const booking = {
        cart: [{ eventType, space, rateType, date, startHour, duration, guests, hourlyRate, timeOfDay, dayName }],
        addonIds: [...(addTech ? ['tech-support'] : []), ...(addMics ? ['extra-mics'] : []), ...(addCustomSetup ? ['custom-setup'] : [])],
        customer: { name, email, phone, notes },
        pricing: { subtotal, cleaningFee, techCost, serviceFee, tax, total, securityDeposit: SECURITY_DEPOSIT },
      };
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) });
      if (res.ok) setSubmitted(true);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>\u{1F3AC}</div>
            <h1 style={styles.goldText}>Booking Request Received!</h1>
            <p style={styles.subText}>Thank you, {name}. We will confirm your event within 24 hours.</p>
            <p style={{ ...styles.subText, marginTop: 10, opacity: 0.6 }}>A confirmation has been sent to {email}</p>
            <div style={{ ...styles.priceBox, marginTop: 40, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              <div style={styles.priceRow}><span>Estimated Total</span><span style={styles.goldText}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
              <div style={{ ...styles.priceRow, opacity: 0.6, fontSize: 13 }}><span>+ $500 refundable security deposit</span></div>
            </div>
            <a href="/" style={{ ...styles.btn, display: 'inline-block', marginTop: 40 }}>Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <p style={styles.heroTag}>PRIVATE EVENTS AT LIGHTHOUSE CINEMA</p>
          <h1 style={styles.heroTitle}>Host Your Event Inside<br />a <span style={styles.goldText}>Real Cinema</span></h1>
          <p style={styles.heroSub}>Private. Cinematic. Unforgettable.</p>
          <a href="#booking" style={styles.heroCta}>Check Availability &amp; Price Instantly</a>
        </div>
      </section>

      <div style={styles.trustBar}>
        <span>\u{1F3AC} 145-Seat Auditorium</span>
        <span>\u{1F942} Luxury Mezzanine</span>
        <span>\u{1F3A4} Full AV System</span>
        <span>\u{1F37F} In-House Catering</span>
      </div>

      <section id="booking" style={styles.container}>
        <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginBottom: 10 }}>Book Your Private Event</h2>
        <p style={{ textAlign: 'center', color: '#999', marginBottom: 40, fontSize: 15 }}>Get an instant price estimate in under 60 seconds</p>

        <div style={styles.progressWrap}>
          {[1,2,3,4,5,6,7].map((s) => (
            <div key={s} style={{ ...styles.progressDot, background: step >= s ? '#D4AF37' : '#333', transform: step === s ? 'scale(1.3)' : 'scale(1)' }} />
          ))}
        </div>

        <div style={styles.wizardCard}>
          {step === 1 && (
            <div>
              <h3 style={styles.stepTitle}>What type of event?</h3>
              <div style={styles.optionGrid}>
                {EVENT_TYPES.map((et) => (
                  <button key={et.id} onClick={() => setEventType(et.id)} style={{ ...styles.optionCard, borderColor: eventType === et.id ? '#D4AF37' : '#333', background: eventType === et.id ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                    <span style={{ fontSize: 32 }}>{et.icon}</span>
                    <span style={{ marginTop: 8, fontSize: 14, fontWeight: 500 }}>{et.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={styles.stepTitle}>Choose your space</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 30 }}>
                <button onClick={() => setSpace('auditorium')} style={{ ...styles.spaceCard, borderColor: space === 'auditorium' ? '#D4AF37' : '#333', background: space === 'auditorium' ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                  <span style={{ fontSize: 40 }}>\u{1F3AC}</span>
                  <strong style={{ fontSize: 18 }}>Auditorium</strong>
                  <span style={{ fontSize: 13, color: '#999' }}>145 or 130 seats</span>
                  <span style={{ fontSize: 13, color: '#999' }}>Full projection + PA</span>
                </button>
                <button onClick={() => setSpace('mezzanine')} style={{ ...styles.spaceCard, borderColor: space === 'mezzanine' ? '#D4AF37' : '#333', background: space === 'mezzanine' ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                  <span style={{ fontSize: 40 }}>\u{1F942}</span>
                  <strong style={{ fontSize: 18 }}>Mezzanine</strong>
                  <span style={{ fontSize: 13, color: '#999' }}>Intimate luxury lounge</span>
                  <span style={{ fontSize: 13, color: '#999' }}>Perfect for receptions</span>
                </button>
              </div>
              <h3 style={{ ...styles.stepTitle, marginTop: 20 }}>Organization type</h3>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>This determines your rate tier</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(space === 'mezzanine' ? MEZZANINE_RATES : AUDITORIUM_RATES).map(([key, val]) => (
                  <button key={key} onClick={() => setRateType(key)} style={{ ...styles.rateOption, borderColor: rateType === key ? '#D4AF37' : '#333', background: rateType === key ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                    <strong>{val.label}</strong>
                    <span style={{ fontSize: 12, color: '#888' }}>{val.sublabel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={styles.stepTitle}>Pick your date &amp; start time</h3>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={styles.label}>Event Date</label>
                  <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} style={styles.input} />
                  {dayName && <p style={{ color: '#D4AF37', fontSize: 14, marginTop: 8 }}>{dayName} \u{2014} {timeOfDay === 'sunday' ? 'Sunday' : timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} rate</p>}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={styles.label}>Start Time</label>
                  <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} style={styles.input}>
                    {Array.from({ length: 15 }, (_, i) => i + 9).map((h) => (
                      <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>
                    ))}
                  </select>
                </div>
              </div>
              {date && (
                <div style={{ ...styles.rateHighlight, marginTop: 20 }}>
                  <span style={{ fontSize: 13, color: '#ccc' }}>Hourly rate for your selection:</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37' }}>${hourlyRate}/hr</span>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={styles.stepTitle}>How long is your event?</h3>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Includes setup and teardown time</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
                <button onClick={() => setDuration(Math.max(1, duration - 1))} style={styles.durationBtn}>\u{2212}</button>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: '#D4AF37' }}>{duration}</span>
                  <span style={{ display: 'block', fontSize: 14, color: '#999' }}>{duration === 1 ? 'hour' : 'hours'}</span>
                </div>
                <button onClick={() => setDuration(Math.min(8, duration + 1))} style={styles.durationBtn}>+</button>
              </div>
              <input type="range" min="1" max="8" value={duration} onChange={(e) => setDuration(Number(e.target.value))} style={{ width: '100%', marginTop: 20, accentColor: '#D4AF37' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}><span>1 hr</span><span>8 hrs</span></div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 style={styles.stepTitle}>Expected number of guests</h3>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <input type="number" min="1" max={space === 'mezzanine' ? 80 : 145} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value)))} style={{ ...styles.input, textAlign: 'center', fontSize: 32, maxWidth: 150, margin: '0 auto' }} />
                <p style={{ color: '#888', fontSize: 13, marginTop: 10 }}>{space === 'auditorium' ? 'Auditorium seats up to 145 guests' : 'Mezzanine accommodates intimate groups'}</p>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h3 style={styles.stepTitle}>Optional add-ons</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                <label style={{ ...styles.addonCard, borderColor: addTech ? '#D4AF37' : '#333', background: addTech ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                  <input type="checkbox" checked={addTech} onChange={(e) => setAddTech(e.target.checked)} style={{ accentColor: '#D4AF37', width: 18, height: 18 }} />
                  <div style={{ flex: 1 }}>
                    <strong>\u{1F39B}\u{FE0F} Tech Support</strong>
                    <span style={{ display: 'block', fontSize: 12, color: '#999' }}>Dedicated technician \u{2014} $100/hr</span>
                  </div>
                  {addTech && <select value={techHours} onChange={(e) => setTechHours(Number(e.target.value))} onClick={(e) => e.stopPropagation()} style={{ ...styles.input, width: 70, padding: '6px 8px', fontSize: 13 }}>{[1,2,3,4,5,6].map((h) => <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''}</option>)}</select>}
                </label>
                <label style={{ ...styles.addonCard, borderColor: addMics ? '#D4AF37' : '#333', background: addMics ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                  <input type="checkbox" checked={addMics} onChange={(e) => setAddMics(e.target.checked)} style={{ accentColor: '#D4AF37', width: 18, height: 18 }} />
                  <div style={{ flex: 1 }}>
                    <strong>\u{1F3A4} Extra Microphones</strong>
                    <span style={{ display: 'block', fontSize: 12, color: '#999' }}>Additional wireless mics (included: 1-2 standard)</span>
                  </div>
                </label>
                <label style={{ ...styles.addonCard, borderColor: addCustomSetup ? '#D4AF37' : '#333', background: addCustomSetup ? 'rgba(212,175,55,0.08)' : '#1a1a1a' }}>
                  <input type="checkbox" checked={addCustomSetup} onChange={(e) => setAddCustomSetup(e.target.checked)} style={{ accentColor: '#D4AF37', width: 18, height: 18 }} />
                  <div style={{ flex: 1 }}>
                    <strong>\u{2728} Custom Setup / Decor</strong>
                    <span style={{ display: 'block', fontSize: 12, color: '#999' }}>Custom arrangement, signage, or decorations</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h3 style={styles.stepTitle}>Almost there \u{2014} your details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 10 }}>
                <div><label style={styles.label}>Full Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" style={styles.input} /></div>
                <div><label style={styles.label}>Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" style={styles.input} /></div>
                <div><label style={styles.label}>Phone *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(831) 555-1234" style={styles.input} /></div>
                <div><label style={styles.label}>Special Requests (optional)</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us about your vision..." rows={3} style={{ ...styles.input, resize: 'vertical' }} /></div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, gap: 12 }}>
            {step > 1 ? <button onClick={() => setStep(step - 1)} style={styles.btnOutline}>\u{2190} Back</button> : <div />}
            {step < 7 ? (
              <button onClick={() => canProceed(step) && setStep(step + 1)} disabled={!canProceed(step)} style={{ ...styles.btn, opacity: canProceed(step) ? 1 : 0.4, cursor: canProceed(step) ? 'pointer' : 'not-allowed' }}>Continue \u{2192}</button>
            ) : (
              <button onClick={handleSubmit} disabled={!canProceed(7) || submitting} style={{ ...styles.btn, opacity: canProceed(7) && !submitting ? 1 : 0.4, cursor: canProceed(7) && !submitting ? 'pointer' : 'not-allowed', fontSize: 16, padding: '14px 32px' }}>
                {submitting ? 'Submitting...' : '\u{1F3AC} Submit Booking Request'}
              </button>
            )}
          </div>
        </div>

        {step >= 2 && space && (
          <div style={styles.priceBox}>
            <h4 style={{ color: '#D4AF37', margin: '0 0 16px', fontSize: 16, letterSpacing: 1 }}>YOUR ESTIMATE</h4>
            <div style={styles.priceRow}><span>{space === 'auditorium' ? 'Auditorium' : 'Mezzanine'} \u{2014} {duration}hr \u{00D7} ${hourlyRate}</span><span>${subtotal.toLocaleString()}</span></div>
            <div style={styles.priceRow}><span>Cleaning fee</span><span>${cleaningFee}</span></div>
            {addTech && <div style={styles.priceRow}><span>Tech support \u{2014} {techHours}hr \u{00D7} $100</span><span>${techCost.toLocaleString()}</span></div>}
            <div style={{ ...styles.priceRow, borderTop: '1px solid #333', paddingTop: 10, marginTop: 6 }}><span>Service fee (18%)</span><span>${serviceFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div style={styles.priceRow}><span>Sales tax (9.25%)</span><span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
            <div style={{ ...styles.priceRow, borderTop: '2px solid #D4AF37', paddingTop: 12, marginTop: 8 }}><strong style={{ fontSize: 18 }}>TOTAL</strong><strong style={{ fontSize: 24, color: '#D4AF37' }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <p style={{ fontSize: 11, color: '#777', marginTop: 12, lineHeight: 1.5 }}>+ $500 refundable security deposit. Licensing fees not included.</p>
          </div>
        )}
      </section>

      <section style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 }}>
          <h4 style={{ color: '#D4AF37', marginTop: 0, fontSize: 14, letterSpacing: 1 }}>IMPORTANT POLICIES</h4>
          <div style={{ fontSize: 13, color: '#999', lineHeight: 1.8 }}>
            <p>\u{1F6AB} No outside food or drink (cakes permitted with written approval)</p>
            <p>\u{1F4B3} Full payment required at time of contract signing</p>
            <p>\u{1F512} $500 refundable security deposit (returned within 3 weeks)</p>
            <p>\u{1F4DC} Renter is responsible for all applicable licensing fees</p>
            <p>\u{23F0} Rental time includes setup and teardown</p>
            <p>\u{1F3AC} Basic projection and PA system with 1-2 microphones included</p>
            <p>\u{1F4CB} One complimentary site visit or content testing session (30 min)</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#0a0a0a', color: '#eee', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  hero: { position: 'relative', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1206 50%, #0a0a0a 100%)', padding: '100px 20px 80px', textAlign: 'center', borderBottom: '1px solid #222' },
  heroOverlay: { position: 'relative', zIndex: 1 },
  heroTag: { color: '#D4AF37', fontSize: 12, letterSpacing: 3, fontWeight: 600, marginBottom: 16 },
  heroTitle: { fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', fontFamily: "'Playfair Display', serif", color: '#fff' },
  heroSub: { fontSize: 18, color: '#bbb', margin: '0 0 32px', fontStyle: 'italic' },
  heroCta: { display: 'inline-block', background: 'linear-gradient(135deg, #D4AF37, #B8962E)', color: '#0a0a0a', padding: '16px 36px', borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(212,175,55,0.3)' },
  goldText: { color: '#D4AF37' },
  subText: { color: '#bbb', fontSize: 16, lineHeight: 1.6 },
  trustBar: { display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', padding: '20px', background: '#111', borderBottom: '1px solid #222', fontSize: 14, color: '#ccc' },
  container: { maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#fff' },
  progressWrap: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32, position: 'relative', alignItems: 'center' },
  progressDot: { width: 12, height: 12, borderRadius: '50%', transition: 'all 0.3s', zIndex: 1 },
  wizardCard: { background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, marginBottom: 24 },
  stepTitle: { fontSize: 20, fontWeight: 600, marginTop: 0, marginBottom: 20, color: '#fff' },
  optionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  optionCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 12px', border: '2px solid #333', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', color: '#eee', textAlign: 'center' },
  spaceCard: { flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '24px 16px', border: '2px solid #333', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', color: '#eee', textAlign: 'center' },
  rateOption: { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 18px', border: '2px solid #333', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: '#eee', textAlign: 'left' },
  label: { display: 'block', fontSize: 13, color: '#999', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#eee', fontSize: 15, outline: 'none', boxSizing: 'border-box' },
  durationBtn: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #D4AF37', background: 'transparent', color: '#D4AF37', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addonCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', border: '2px solid #333', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', color: '#eee' },
  priceBox: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginTop: 24 },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 14, color: '#ccc' },
  rateHighlight: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btn: { background: 'linear-gradient(135deg, #D4AF37, #B8962E)', color: '#0a0a0a', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' },
  btnOutline: { background: 'transparent', color: '#D4AF37', padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15, border: '1px solid #D4AF37', cursor: 'pointer', transition: 'all 0.2s' },
};
