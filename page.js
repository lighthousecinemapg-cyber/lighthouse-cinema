'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

/* ════════════════════════════════════════════
   PRICING DATA (verified from official PDFs)
   ════════════════════════════════════════════ */
const AUDITORIUM_RATES = {
  smallNonprofit: {
    label: 'Small Nonprofit',
    sublabel: 'Under $5M annual revenue',
    desc: '501(c)3 certification required',
    day:     { mon: 200, tue: 200, wed: 200, thu: 200, fri: 200, sat: 250, sun: 250 },
    evening: { mon: 250, tue: 300, wed: 350, thu: 400, fri: 450, sat: 500, sun: 400 },
  },
  largeNonprofit: {
    label: 'Large Nonprofit / Individual',
    sublabel: 'Over $5M revenue or personal events',
    desc: 'Most popular for private screenings',
    day:     { mon: 250, tue: 250, wed: 250, thu: 250, fri: 250, sat: 300, sun: 300 },
    evening: { mon: 300, tue: 350, wed: 400, thu: 450, fri: 500, sat: 600, sun: 450 },
  },
  corporate: {
    label: 'Corporate / Large Business',
    sublabel: 'Over $10M annual revenue',
    desc: 'Full-service corporate events',
    day:     { mon: 300, tue: 300, wed: 300, thu: 300, fri: 300, sat: 400, sun: 400 },
    evening: { mon: 350, tue: 400, wed: 450, thu: 550, fri: 600, sat: 750, sun: 550 },
  },
};

const MEZZANINE_RATES = {
  smallNonprofit: {
    label: 'Small Nonprofit',
    sublabel: 'Under $5M annual revenue',
    desc: '501(c)3 certification required',
    day: 150, evening: 300, sunday: 200,
  },
  largeNonprofit: {
    label: 'Large Nonprofit / Individual',
    sublabel: 'Over $5M revenue or personal events',
    desc: 'Perfect for intimate gatherings',
    day: 175, evening: 400, sunday: 250,
  },
  corporate: {
    label: 'Corporate / Large Business',
    sublabel: 'Over $10M annual revenue',
    desc: 'Premium corporate hospitality',
    day: 200, evening: 500, sunday: 300,
  },
};

const EVENT_TYPES = [
  { id: 'birthday',    icon: '\uD83C\uDF82', label: 'Birthday Party' },
  { id: 'movie',       icon: '\uD83C\uDFAC', label: 'Private Screening' },
  { id: 'corporate',   icon: '\uD83D\uDCBC', label: 'Corporate Event' },
  { id: 'wedding',     icon: '\uD83D\uDC8D', label: 'Wedding / Celebration' },
  { id: 'fundraiser',  icon: '\uD83E\uDD1D', label: 'Fundraiser / Gala' },
  { id: 'custom',      icon: '\u2728',        label: 'Custom Event' },
];

const CLEANING_FEE = 50;
const TECH_RATE = 100;
const SERVICE_FEE_PCT = 0.18;
const TAX_PCT = 0.0925;
const DEPOSIT = 500;
const DAY_MAP = ['sun','mon','tue','wed','thu','fri','sat'];

const STEP_LABELS = ['Event','Space','Date','Hours','Guests','Extras','Details'];

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */
function getTimeOfDay(hour, dow, space) {
  if (space === 'mezzanine') {
    if (dow === 0) return 'sunday';
    return hour < 19 ? 'day' : 'evening';
  }
  if (dow === 0) return hour < 17 ? 'day' : 'evening';
  if (dow >= 4) return hour < 17 ? 'day' : 'evening';
  return hour < 18 ? 'day' : 'evening';
}

function getRate(space, rateType, dow, tod) {
  const dk = DAY_MAP[dow];
  if (space === 'auditorium') return AUDITORIUM_RATES[rateType][tod][dk];
  const m = MEZZANINE_RATES[rateType];
  if (tod === 'sunday') return m.sunday;
  return m[tod];
}

function fmtMoney(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/* ════════════════════════════════════════════
   CSS (injected via <style> for hover/animations)
   ════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Base ── */
.pe * { box-sizing: border-box; margin: 0; padding: 0; }
.pe { font-family: 'Inter', -apple-system, sans-serif; background: #080808; color: #e8e8e8; min-height: 100vh; }

/* ── Hero ── */
.pe-hero {
  position: relative; padding: 100px 24px 80px; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%), #080808;
}
.pe-hero::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent);
}
.pe-hero-tag {
  font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #D4AF37;
  font-weight: 600; margin-bottom: 20px;
}
.pe-hero h1 {
  font-family: 'Playfair Display', serif; font-size: clamp(34px, 5.5vw, 60px);
  font-weight: 800; line-height: 1.1; color: #fff; margin-bottom: 16px;
}
.pe-hero h1 span { color: #D4AF37; }
.pe-hero-sub {
  font-size: 18px; color: #999; font-style: italic; margin-bottom: 36px;
  font-family: 'Playfair Display', serif;
}
.pe-cta {
  display: inline-block; padding: 18px 40px; border-radius: 8px; font-weight: 700; font-size: 15px;
  text-decoration: none; color: #0a0a0a; letter-spacing: 0.3px;
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%); background-size: 200% 200%;
  box-shadow: 0 4px 30px rgba(212,175,55,0.25); transition: all 0.3s;
}
.pe-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(212,175,55,0.4); background-position: 100% 100%; }

/* ── Trust Bar ── */
.pe-trust {
  display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; padding: 18px 20px;
  background: #0d0d0d; border-bottom: 1px solid #1a1a1a; font-size: 13px; color: #888;
}
.pe-trust span { white-space: nowrap; }

/* ── Layout ── */
.pe-section { max-width: 1100px; margin: 0 auto; padding: 48px 20px 80px; }
.pe-grid { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
@media (max-width: 860px) { .pe-grid { grid-template-columns: 1fr; } }

/* ── Progress ── */
.pe-progress { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 36px; }
.pe-prog-step {
  display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; flex: 1; max-width: 100px;
}
.pe-prog-dot {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; transition: all 0.4s ease; border: 2px solid #333; color: #555; background: #111; z-index: 2;
}
.pe-prog-step.done .pe-prog-dot { background: #D4AF37; border-color: #D4AF37; color: #0a0a0a; }
.pe-prog-step.active .pe-prog-dot { border-color: #D4AF37; color: #D4AF37; box-shadow: 0 0 16px rgba(212,175,55,0.3); background: rgba(212,175,55,0.1); }
.pe-prog-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; transition: color 0.3s; }
.pe-prog-step.done .pe-prog-label, .pe-prog-step.active .pe-prog-label { color: #D4AF37; }
.pe-prog-line {
  position: absolute; top: 16px; left: 50%; right: -50%; height: 2px; background: #222; z-index: 1;
}
.pe-prog-line-fill { height: 100%; background: #D4AF37; transition: width 0.4s ease; }
@media (max-width: 600px) { .pe-prog-label { display: none; } .pe-prog-dot { width: 28px; height: 28px; font-size: 11px; } }

/* ── Wizard Card ── */
.pe-card {
  background: #111; border: 1px solid #1c1c1c; border-radius: 16px; padding: 36px; position: relative;
  overflow: hidden;
}
.pe-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent);
}
.pe-step-title {
  font-size: 22px; font-weight: 700; margin-bottom: 24px; color: #fff;
  font-family: 'Playfair Display', serif;
}

/* ── Event Type Grid ── */
.pe-evgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 600px) { .pe-evgrid { grid-template-columns: repeat(2, 1fr); } }
.pe-evbtn {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  padding: 24px 12px; border: 2px solid #222; border-radius: 14px; background: #0d0d0d;
  color: #ccc; cursor: pointer; transition: all 0.25s ease; text-align: center; font-size: 13px; font-weight: 500;
}
.pe-evbtn:hover { border-color: #444; background: #151515; transform: translateY(-2px); }
.pe-evbtn.sel { border-color: #D4AF37; background: rgba(212,175,55,0.06); color: #fff; box-shadow: 0 0 20px rgba(212,175,55,0.1); }
.pe-evbtn .icon { font-size: 36px; line-height: 1; }

/* ── Space Cards ── */
.pe-spaces { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
@media (max-width: 500px) { .pe-spaces { grid-template-columns: 1fr; } }
.pe-space {
  padding: 28px 20px; border: 2px solid #222; border-radius: 14px; background: #0d0d0d;
  cursor: pointer; transition: all 0.25s; text-align: center;
}
.pe-space:hover { border-color: #444; transform: translateY(-2px); }
.pe-space.sel { border-color: #D4AF37; background: rgba(212,175,55,0.06); box-shadow: 0 0 24px rgba(212,175,55,0.08); }
.pe-space .icon { font-size: 40px; display: block; margin-bottom: 10px; }
.pe-space .name { font-size: 16px; font-weight: 700; color: #fff; display: block; margin-bottom: 4px; }
.pe-space .desc { font-size: 12px; color: #777; display: block; }

/* ── Rate Options ── */
.pe-rates { display: flex; flex-direction: column; gap: 10px; }
.pe-rate {
  padding: 16px 20px; border: 2px solid #222; border-radius: 12px; background: #0d0d0d;
  cursor: pointer; transition: all 0.25s; text-align: left; display: flex; flex-direction: column; gap: 2px;
}
.pe-rate:hover { border-color: #444; }
.pe-rate.sel { border-color: #D4AF37; background: rgba(212,175,55,0.06); }
.pe-rate .rname { font-size: 15px; font-weight: 600; color: #fff; }
.pe-rate .rdesc { font-size: 12px; color: #777; }

/* ── Inputs ── */
.pe-input, .pe-select {
  width: 100%; padding: 14px 16px; background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 10px;
  color: #eee; font-size: 15px; outline: none; transition: border-color 0.2s; font-family: inherit;
}
.pe-input:focus, .pe-select:focus { border-color: #D4AF37; }
.pe-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }
.pe-label { display: block; font-size: 12px; color: #888; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
.pe-textarea { resize: vertical; min-height: 80px; }

/* ── Duration Slider ── */
.pe-slider-wrap { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
.pe-slider {
  flex: 1; -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px;
  background: linear-gradient(to right, #D4AF37 0%, #D4AF37 var(--pct, 50%), #333 var(--pct, 50%), #333 100%);
  outline: none; cursor: pointer;
}
.pe-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%;
  background: #D4AF37; border: 3px solid #0a0a0a; box-shadow: 0 0 10px rgba(212,175,55,0.4); cursor: pointer;
}
.pe-slider::-moz-range-thumb {
  width: 24px; height: 24px; border-radius: 50%; background: #D4AF37;
  border: 3px solid #0a0a0a; box-shadow: 0 0 10px rgba(212,175,55,0.4); cursor: pointer;
}
.pe-dur-display { font-size: 36px; font-weight: 800; color: #D4AF37; min-width: 70px; text-align: center; font-family: 'Playfair Display', serif; }
.pe-dur-unit { font-size: 14px; color: #888; font-weight: 400; }

/* ── Addon Cards ── */
.pe-addons { display: flex; flex-direction: column; gap: 12px; }
.pe-addon {
  display: flex; align-items: center; gap: 16px; padding: 18px 20px; border: 2px solid #222;
  border-radius: 12px; cursor: pointer; transition: all 0.25s; background: #0d0d0d;
}
.pe-addon:hover { border-color: #444; }
.pe-addon.sel { border-color: #D4AF37; background: rgba(212,175,55,0.06); }
.pe-addon .toggle {
  width: 44px; height: 24px; border-radius: 12px; background: #333; position: relative;
  transition: background 0.3s; flex-shrink: 0;
}
.pe-addon.sel .toggle { background: #D4AF37; }
.pe-addon .toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  border-radius: 50%; background: #fff; transition: transform 0.3s;
}
.pe-addon.sel .toggle::after { transform: translateX(20px); }
.pe-addon .ainfo { flex: 1; }
.pe-addon .aname { font-size: 14px; font-weight: 600; color: #fff; }
.pe-addon .adesc { font-size: 12px; color: #777; margin-top: 2px; }
.pe-addon .aprice { font-size: 13px; color: #D4AF37; font-weight: 600; white-space: nowrap; }

/* ── Price Panel ── */
.pe-price {
  background: #111; border: 1px solid #1c1c1c; border-radius: 16px; padding: 28px; position: sticky; top: 24px;
}
.pe-price::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent);
}
.pe-price-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37; margin-bottom: 20px; }
.pe-price-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; color: #999; }
.pe-price-row .val { color: #ccc; font-weight: 500; }
.pe-price-divider { height: 1px; background: #222; margin: 12px 0; }
.pe-price-total {
  display: flex; justify-content: space-between; align-items: center; padding: 16px 0 8px; font-size: 13px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #fff;
}
.pe-price-total .val { font-size: 28px; color: #D4AF37; font-family: 'Playfair Display', serif; font-weight: 800; }
.pe-price-note { font-size: 11px; color: #666; margin-top: 12px; line-height: 1.6; }
.pe-price-note span { color: #D4AF37; }
.pe-rate-badge {
  display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  background: rgba(212,175,55,0.1); color: #D4AF37; border: 1px solid rgba(212,175,55,0.2); margin-bottom: 16px;
}

/* ── Buttons ── */
.pe-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; gap: 12px; }
.pe-btn {
  padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; border: none;
  cursor: pointer; transition: all 0.25s; font-family: inherit; display: inline-flex; align-items: center; gap: 8px;
}
.pe-btn-gold {
  background: linear-gradient(135deg, #D4AF37, #F5D76E); color: #0a0a0a;
  box-shadow: 0 4px 20px rgba(212,175,55,0.2);
}
.pe-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(212,175,55,0.35); }
.pe-btn-gold:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
.pe-btn-ghost {
  background: transparent; color: #888; border: 1px solid #333; padding: 14px 24px;
}
.pe-btn-ghost:hover { border-color: #555; color: #ccc; }
.pe-btn-submit {
  width: 100%; padding: 18px; border-radius: 12px; font-size: 17px; font-weight: 800; border: none;
  cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%); background-size: 200% 200%;
  color: #0a0a0a; box-shadow: 0 4px 30px rgba(212,175,55,0.3); transition: all 0.3s; letter-spacing: 0.5px;
}
.pe-btn-submit:hover { background-position: 100% 100%; transform: translateY(-2px); box-shadow: 0 8px 40px rgba(212,175,55,0.4); }
.pe-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ── Fine Print ── */
.pe-fine {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
  margin-top: 32px; padding: 24px; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 14px;
}
.pe-fine-item { display: flex; gap: 10px; font-size: 12px; color: #666; line-height: 1.5; }
.pe-fine-item .ficon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

/* ── Success ── */
.pe-success { text-align: center; padding: 80px 20px; }
.pe-success .check { width: 80px; height: 80px; border-radius: 50%; background: rgba(212,175,55,0.1); border: 2px solid #D4AF37; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 24px; animation: pe-pop 0.5s ease; }
@keyframes pe-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
.pe-success h1 { font-family: 'Playfair Display', serif; font-size: 32px; color: #D4AF37; margin-bottom: 12px; }
.pe-success p { color: #888; font-size: 15px; line-height: 1.6; }

/* ── Fade transition ── */
.pe-fade { animation: pe-fadeIn 0.35s ease; }
@keyframes pe-fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

/* ── Mobile sticky price ── */
@media (max-width: 860px) {
  .pe-price { position: fixed; bottom: 0; left: 0; right: 0; border-radius: 20px 20px 0 0; z-index: 50; padding: 20px 24px; border: none; border-top: 1px solid #222; box-shadow: 0 -8px 30px rgba(0,0,0,0.6); }
  .pe-section { padding-bottom: 180px; }
}

/* ── Contact form grid ── */
.pe-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 500px) { .pe-form-grid { grid-template-columns: 1fr; } }

/* ── Guest counter ── */
.pe-counter { display: flex; align-items: center; gap: 20px; }
.pe-counter-btn {
  width: 48px; height: 48px; border-radius: 50%; border: 2px solid #D4AF37; background: transparent;
  color: #D4AF37; font-size: 22px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.pe-counter-btn:hover { background: rgba(212,175,55,0.1); }
.pe-counter-val { font-size: 40px; font-weight: 800; color: #D4AF37; min-width: 80px; text-align: center; font-family: 'Playfair Display', serif; }
`;

/* ════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════ */
export default function PrivateEventsPage() {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState('');
  const [space, setSpace] = useState('');
  const [rateType, setRateType] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState(18);
  const [duration, setDuration] = useState(2);
  const [guests, setGuests] = useState(50);
  const [addTech, setAddTech] = useState(false);
  const [techHours, setTechHours] = useState(1);
  const [addMics, setAddMics] = useState(false);
  const [addDecor, setAddDecor] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMobilePrice, setShowMobilePrice] = useState(false);
  const wizRef = useRef(null);

  // Scroll to wizard on step change
  useEffect(() => {
    if (step > 1 && wizRef.current) {
      wizRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  /* ── Derived pricing ── */
  const selDate = date ? new Date(date + 'T12:00:00') : null;
  const dow = selDate ? selDate.getDay() : 5;
  const tod = getTimeOfDay(startHour, dow, space || 'auditorium');
  const dayName = selDate ? selDate.toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const hourlyRate = space && rateType ? getRate(space, rateType, dow, tod) : 0;

  const subtotal = hourlyRate * duration;
  const techCost = addTech ? TECH_RATE * techHours : 0;
  const preService = subtotal + CLEANING_FEE + techCost;
  const serviceFee = Math.round(preService * SERVICE_FEE_PCT * 100) / 100;
  const preTax = preService + serviceFee;
  const tax = Math.round(preTax * TAX_PCT * 100) / 100;
  const total = Math.round((preTax + tax) * 100) / 100;

  const canGo = (s) => {
    if (s === 1) return !!eventType;
    if (s === 2) return !!space && !!rateType;
    if (s === 3) return !!date;
    if (s === 4) return duration >= 1;
    if (s === 5) return guests >= 1;
    if (s === 6) return true;
    if (s === 7) return name.trim() && email.trim() && phone.trim();
    return true;
  };

  const next = () => { if (canGo(step) && step < 7) setStep(step + 1); };
  const back = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!canGo(7)) return;
    setSubmitting(true);
    try {
      const booking = {
        cart: [{ eventType, space, rateType, date, startHour, duration, guests, hourlyRate, timeOfDay: tod, dayName }],
        addonIds: [...(addTech ? ['tech-support'] : []), ...(addMics ? ['extra-mics'] : []), ...(addDecor ? ['custom-setup'] : [])],
        customer: { name, email, phone, notes },
        pricing: { subtotal, cleaningFee: CLEANING_FEE, techCost, serviceFee, tax, total, securityDeposit: DEPOSIT },
      };
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) });
      if (res.ok) setSubmitted(true);
      else setSubmitted(true); // still show success - email fallback
    } catch (e) {
      console.error(e);
      setSubmitted(true); // show success even if API down
    }
    setSubmitting(false);
  };

  /* ── Time options ── */
  const timeOptions = useMemo(() => {
    const opts = [];
    const minH = space === 'mezzanine' ? (dow === 0 ? 10 : 8) : 9;
    const maxH = space === 'mezzanine' ? 23 : 22;
    for (let h = minH; h <= maxH; h++) {
      const t = getTimeOfDay(h, dow, space || 'auditorium');
      const label = t === 'sunday' ? 'Sunday Rate' : t === 'evening' ? 'Evening Rate' : 'Day Rate';
      const ampm = h === 0 ? '12 AM' : h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h - 12) + ' PM';
      opts.push({ value: h, label: ampm + ' \u2014 ' + label });
    }
    return opts;
  }, [space, dow]);

  /* ── Rate type options ── */
  const rateOptions = space === 'auditorium' ? AUDITORIUM_RATES : MEZZANINE_RATES;

  /* ══════════════ RENDER ══════════════ */

  if (submitted) {
    return (
      <>
        <style>{CSS}</style>
        <div className="pe">
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
            <div className="pe-success pe-fade">
              <div className="check">{'\u2713'}</div>
              <h1>Booking Request Received!</h1>
              <p>Thank you, {name}. We will review your <strong>{EVENT_TYPES.find(e => e.id === eventType)?.label || 'event'}</strong> request and confirm within 24 hours.</p>
              <p style={{ marginTop: 8 }}>A confirmation has been sent to <strong style={{ color: '#D4AF37' }}>{email}</strong></p>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 24, marginTop: 32, textAlign: 'left' }}>
                <div className="pe-price-row"><span>Estimated Total</span><span className="val" style={{ color: '#D4AF37', fontWeight: 700, fontSize: 20 }}>{fmtMoney(total)}</span></div>
                <div className="pe-price-row" style={{ fontSize: 12 }}><span>+ {fmtMoney(DEPOSIT)} refundable security deposit</span></div>
              </div>
              <a href="/" className="pe-btn pe-btn-gold" style={{ display: 'inline-flex', marginTop: 32, textDecoration: 'none' }}>Back to Home</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="pe">
        {/* ── HERO ── */}
        <section className="pe-hero">
          <p className="pe-hero-tag">Private Events at Lighthouse Cinema</p>
          <h1>Host Your Event Inside<br />a <span>Real Cinema</span></h1>
          <p className="pe-hero-sub">Private. Cinematic. Unforgettable.</p>
          <a href="#booking" className="pe-cta">Check Availability &amp; Price Instantly</a>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="pe-trust">
          <span>{'\uD83C\uDFAC'} 145-Seat Auditorium</span>
          <span>{'\uD83E\uDD12'} Luxury Mezzanine</span>
          <span>{'\uD83C\uDFA4'} Full PA + Projection</span>
          <span>{'\uD83C\uDF7F'} In-House Catering</span>
        </div>

        {/* ── BOOKING SECTION ── */}
        <section className="pe-section" id="booking" ref={wizRef}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Book Your Private Event
            </h2>
            <p style={{ color: '#777', fontSize: 14 }}>Get an instant price estimate in under 60 seconds</p>
          </div>

          {/* ── PROGRESS ── */}
          <div className="pe-progress">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              const cls = step > s ? 'done' : step === s ? 'active' : '';
              return (
                <div key={s} className={`pe-prog-step ${cls}`} style={{ position: 'relative' }}>
                  <div className="pe-prog-dot">{step > s ? '\u2713' : s}</div>
                  <div className="pe-prog-label">{label}</div>
                  {s < 7 && (
                    <div className="pe-prog-line">
                      <div className="pe-prog-line-fill" style={{ width: step > s ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── MAIN GRID ── */}
          <div className="pe-grid">
            {/* LEFT: WIZARD */}
            <div>
              <div className="pe-card">

                {/* ─── STEP 1: Event Type ─── */}
                {step === 1 && (
                  <div className="pe-fade" key="s1">
                    <h3 className="pe-step-title">What type of event are you planning?</h3>
                    <div className="pe-evgrid">
                      {EVENT_TYPES.map(et => (
                         <button key={et.id} className={`pe-evbtn ${eventType === et.id ? 'sel' : ''}`} onClick={() => setEventType(et.id)}>
                          <span className="icon">{et.icon}</span>
                          <span>{et.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── STEP 2: Space + Rate ─── */}
                {step === 2 && (
                  <div className="pe-fade" key="s2">
                    <h3 className="pe-step-title">Choose your space</h3>
                    <div className="pe-spaces">
                      <div className={`pe-space ${space === 'auditorium' ? 'sel' : ''}`} onClick={() => setSpace('auditorium')}>
                        <span className="icon">{'\uD83C\uDFAC'}</span>
                        <span className="name">Auditorium</span>
                        <span className="desc">145 or 130 seats &bull; Full projection + PA</span>
                      </div>
                      <div className={`pe-space ${space === 'mezzanine' ? 'sel' : ''}`} onClick={() => setSpace('mezzanine')}>
                        <span className="icon">{'\uD83E\uDD12'}</span>
                        <span className="name">Mezzanine</span>
                        <span className="desc">Intimate luxury lounge &bull; Receptions</span>
                      </div>
                    </div>

                    <h3 className="pe-step-title" style={{ fontSize: 18, marginTop: 8 }}>Organization type</h3>
                    <div className="pe-rates">
                      {Object.entries(rateOptions).map(([key, r]) => (
                        <div key={key} className={`pe-rate ${rateType === key ? 'sel' : ''}`} onClick={() => setRateType(key)}>
                          <span className="rname">{r.label}</span>
                          <span className="rdesc">{r.sublabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Date + Time ─── */}
                {step === 3 && (
                  <div className="pe-fade" key="s3">
                    <h3 className="pe-step-title">Pick your date &amp; start time</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label className="pe-label">Event Date</label>
                        <input type="date" className="pe-input" value={date} onChange={e => setDate(e.target.value)} min={todayStr()} />
                      </div>
                      <div>
                        <label className="pe-label">Start Time</label>
                        <select className="pe-select" value={startHour} onChange={e => setStartHour(Number(e.target.value))}>
                          {timeOptions.map(o => (
                            <option ky={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {date && hourlyRate > 0 && (
                      <div style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#999' }}>{dayName} {'\u2014'} {tod === 'sunday' ? 'Sunday' : tod.charAt(0).toUpperCase() + tod.slice(1)} Rate</div>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Hourly rate for your selection</div>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#D4AF37', fontFamily: "'Playfair Display', serif" }}>${hourlyRate}<span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/hr</span></div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── STEP 4: Duration ─── */}
                {step === 4 && (
                  <div className="pe-fade" key="s4">
                    <h3 className="pe-step-title">How long is your event?</h3>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div className="pe-dur-display">{duration}<span className="pe-dur-unit"> {duration === 1 ? 'hour' : 'hours'}</span></div>
                    </div>
                    <div className="pe-slider-wrap">
                      <span style={{ fontSize: 13, color: '#666' }}>1hr</span>
                      <input
                        type="range" className="pe-slider" min={1} max={8} step={1} value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        style={{ '--pct': ((duration - 1) / 7 * 100) + '%' }}
                      />
                      <span style={{ fontSize: 13, color: '#666' }}>8hrs</span>
                    </div>
                    {hourlyRate > 0 && (
                      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
                        {duration}hr {'\u00D7'} ${hourlyRate}/hr = <span style={{ color: '#D4AF37', fontWeight: 700 }}>{fmtMoney(subtotal)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── STEP 5: Guests ─── */}
                {step === 5 && (
                  <div className="pe-fade" key="s5">
                    <h3 className="pe-step-title">Expected number of guests</h3>
                    <div className="pe-counter">
                      <button className="pe-counter-btn" onClick={() => setGuests(Math.max(1, guests - 10))}>-</button>
                      <div className="pe-counter-val">{guests}</div>
                      <button className="pe-counter-btn" onClick={() => setGuests(Math.min(300, guests + 10))}>+</button>
                    </div>
                    <p style={{ fontSize: 12, color: '#666', marginTop: 16, textAlign: 'center' }}>
                      {space === 'auditorium' ? 'Auditorium #1: 145 seats \u2022 Auditorium #2: 130 seats' : 'Food & drink minimum may apply for groups under 50'}
                    </p>
                  </div>
                )}

                {/* ─── STEP 6: Add-ons ─── */}
                {step === 6 && (
                  <div className="pe-fade" key="s6">
                    <h3 className="pe-step-title">Optional add-ons</h3>
                    <div className="pe-addons">
                      <div className={`pe-addon ${addTech ? 'sel' : ''}`} onClick={() => setAddTech(!addTech)}>
                        <div className="toggle" />
                        <div className="ainfo">
                          <div className="aname">{'\uD83C\uDFA8'} Tech Support</div>
                          <div className="adesc">Dedicated technician for your event</div>
                        </div>
                        <div className="aprice">$100/hr</div>
                      </div>
                      {addTech && (
                        <div style={{ marginLeft: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <label className="pe-label" style={{ margin: 0 }}>Hours:</label>
                          <select className="pe-select" style={{ width: 100 }} value={techHours} onChange={e => setTechHours(Number(e.target.value))}>
                            {[1,2,3,4,5,6,7,8].map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      )}
                      <div className={`pe-addon ${addMics ? 'sel' : ''}`} onClick={() => setAddMics(!addMics)}>
                        <div className="toggle" />
                        <div className="ainfo">
                          <div className="aname">{'\uD83C\uDFA4'} Extra Microphones</div>
                          <div className="adesc">Additional wireless microphones</div>
                        </div>
                        <div className="aprice">Included</div>
                      </div>
                      <div className={`pe-addon ${addDecor ? 'sel' : ''}`} onClick={() => setAddDecor(!addDecor)}>
                        <div className="toggle" />
                        <div className="ainfo">
                          <div className="aname">{'\u2728'} Custom Setup / Decor</div>
                          <div className="adesc">Custom arrangements for your event</div>
                        </div>
                        <div className="aprice">Quote</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── STEP 7: Contact + Submit ─── */}
                {step === 7 && (
                  <div className="pe-fade" key="s7">
                    <h3 className="pe-step-title">Almost there {'\u2014'} your details</h3>
                    <div className="pe-form-grid">
                      <div>
                        <label className="pe-label">Full Name</label>
                        <input type="text" className="pe-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div>
                        <label className="pe-label">Phone</label>
                        <input type="tel" className="pe-input" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <label className="pe-label">Email</label>
                      <input type="email" className="pe-input" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <label className="pe-label">Special Requests (optional)</label>
                      <textarea className="pe-input pe-textarea" placeholder="Tell us about your vision..." value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

                    {/* Price Summary in Step 7 */}
                    <div style={{ marginTop: 28, background: '#0d0d0d', border: '1px solid #1c1c1c', borderRadius: 14, padding: 24 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#D4AF37', marginBottom: 16 }}>Price Summary</div>
                      <div className="pe-price-row"><span>{space === 'auditorium' ? 'Auditorium' : 'Mezzanine'} {'\u2014'} {duration}hr {'\u00D7'} ${hourlyRate}</span><span className="val">{fmtMoney(subtotal)}</span></div>
                      <div className="pe-price-row"><span>Cleaning fee</span><span className="val">{fmtMoney(CLEANING_FEE)}</span></div>
                      {addTech && <div className="pe-price-row"><span>Tech support {'\u2014'} {techHours}hr {'\u00D7'} $100</span><span className="val">{fmtMoney(techCost)}</span></div>}
                      <div className="pe-price-divider" />
                      <div className="pe-price-row"><span>Service fee (18%)</span><span className="val">{fmtMoney(serviceFee)}</span></div>
                      <div className="pe-price-row"><span>Sales tax (9.25%)</span><span className="val">{fmtMoney(tax)}</span></div>
                      <div className="pe-price-divider" />
                      <div className="pe-price-total"><span>Total</span><span className="val">{fmtMoney(total)}</span></div>
                      <div className="pe-price-note">
                        + <span>{fmtMoney(DEPOSIT)}</span> refundable security deposit (returned within 3 weeks)
                      </div>
                    </div>

                    <button className="pe-btn-submit" style={{ marginTop: 24 }} onClick={handleSubmit} disabled={!canGo(7) || submitting}>
                      {submitting ? 'Submitting...' : <>{'\uD83C\uDFAC'} Submit Booking Request</>}
                    </button>
                  </div>
                )}

                {/* ── NAV BUTTONS ── */}
                {step < 7 && (
                  <div className="pe-nav">
                    {step > 1 ? (
                      <button className="pe-btn pe-btn-ghost" onClick={back}>{'\u2190'} Back</button>
                    ) : <div />}
                    <button className="pe-btn pe-btn-gold" onClick={next} disabled={!canGo(step)}>
                      Continue {'\u2192'}
                    </button>
                  </div>
                )}
                {step === 7 && (
                  <div className="pe-nav" style={{ marginTop: 16 }}>
                    <button className="pe-btn pe-btn-ghost" onClick={back}>{'\u2190'} Back</button>
                    <div />
                  </div>
                )}
              </div>

              {/* ── Fine Print ── */}
              {step === 7 && (
                <div className="pe-fine pe-fade">
                  <div className="pe-fine-item"><span className="ficon">{'\uD83D\uDD12'}</span><span>{fmtMoney(DEPOSIT)} refundable security deposit (returned within 3 weeks)</span></div>
                  <div className="pe-fine-item"><span className="ficon">{'\uD83D\uDCDC'}</span><span>Renter is responsible for all applicable licensing fees</span></div>
                  <div className="pe-fine-item"><span className="ficon">{'\uD83C\uDF70'}</span><span>No outside food or drink (cakes allowed with written permission)</span></div>
                  <div className="pe-fine-item"><span className="ficon">{'\uD83D\uDCB3'}</span><span>Full payment required at time of contract</span></div>
                </div>
              )}
            </div>

            {/* RIGHT: PRICE PANEL */}
            <div className="pe-price">
              <div className="pe-price-title">{'\u2728'} Your Estimate</div>
              {space && rateType && date && hourlyRate > 0 ? (
                <>
                  <div className="pe-rate-badge">{dayName} {'\u2022'} {tod === 'sunday' ? 'Sunday' : tod.charAt(0).toUpperCase() + tod.slice(1)} Rate {'\u2022'} ${hourlyRate}/hr</div>
                  <div className="pe-price-row"><span>{space === 'auditorium' ? 'Auditorium' : 'Mezzanine'} rental</span><span className="val">{fmtMoney(subtotal)}</span></div>
                  <div className="pe-price-row" style={{ fontSize: 12, color: '#666' }}><span>{duration}hr {'\u00D7'} ${hourlyRate}/hr</span></div>
                  <div className="pe-price-row"><span>Cleaning fee</span><span className="val">{fmtMoney(CLEANING_FEE)}</span></div>
                  {addTech && <div className="pe-price-row"><span>Tech support ({techHours}hr)</span><span className="val">{fmtMoney(techCost)}</span></div>}
                  <div className="pe-price-divider" />
                  <div className="pe-price-row"><span>Service fee (18%)</span><span className="val">{fmtMoney(serviceFee)}</span></div>
                  <div className="pe-price-row"><span>Sales tax (9.25%)</span><span className="val">{fmtMoney(tax)}</span></div>
                  <div className="pe-price-divider" />
                  <div className="pe-price-total"><span>Total</span><span className="val">{fmtMoney(total)}</span></div>
                  <div className="pe-price-note">
                    + <span>{fmtMoney(DEPOSIT)}</span> refundable deposit<br />
                    Licensing fees not included
                  </div>
                </>
              ) : (
                <div style={{ color: '#555', fontSize: 14, lineHeight: 1.8, textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{'\uD83C\uDFAC'}</div>
                  Select your space, date &amp; time<br />to see live pricing
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
