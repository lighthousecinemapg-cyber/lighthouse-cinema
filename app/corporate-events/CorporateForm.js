'use client';
// Enterprise corporate/private-event inquiry form -> /api/event-inquiry
import { useState } from 'react';

const gold = '#d4af37';
const darkCard = '#141414';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#8a8a8a';

const EVENT_TYPES = ['Corporate Event', 'Private Theater Rental', 'Private Screening', 'Product Launch / Brand Reveal', 'Company Meeting / Presentation', 'Holiday Party', 'Client Appreciation', 'Employee Event', 'Film Premiere / VIP Screening', 'Fundraiser', 'Film Festival', 'Watch Party / Live Sports', 'Gaming / Esports', 'Other'];
const BUDGETS = ['Under $1,000', '$1,000 – $2,500', '$2,500 – $5,000', '$5,000 – $10,000', '$10,000+'];
const FOOD = ['None', 'Popcorn & snacks', 'Pizza party', 'Hot dog / nacho bar', 'Chicken tenders & wings', 'Full catering (discuss)'];
const BAR = ['None', 'Beer & wine', 'Full bar', 'Discuss options'];

const field = { width: '100%', background: '#0a0a0a', border: '1px solid ' + darkBorder, color: '#fff', padding: '12px 14px', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' };
const label = { display: 'block', color: gold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 };

function Field({ l, children }) {
  return <label style={{ display: 'block' }}><span style={label}>{l}</span>{children}</label>;
}

export default function CorporateForm() {
  const [f, setF] = useState({ companyName: '', industry: '', name: '', email: '', phone: '', preferredContact: 'Email', eventType: 'Corporate Event', date: '', altDate: '', guests: '', budget: '', foodPackage: '', barPackage: '', brandingNeeds: '', avNeeds: '', notes: '', marketingSource: '', company: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ref, setRef] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!f.name.trim() || !f.email.trim() || !f.phone.trim()) { setError('Please provide your name, email, and phone.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) { setError('Please enter a valid email address.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/event-inquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(f) });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) setRef(d.ref || 'received');
      else setError(d.error || 'We could not submit your request. Please call (831) 717-3124.');
    } catch (err) { setError('Network error — please try again or call (831) 717-3124.'); }
    setSubmitting(false);
  }

  if (ref) {
    return (
      <div style={{ background: darkCard, border: '1px solid ' + gold, borderRadius: 16, padding: '36px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem' }}>✅</div>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: '8px 0' }}>Request Received</h3>
        <p style={{ color: textLight, lineHeight: 1.6 }}>Thank you. Our events team has your inquiry and a confirmation is on its way to your inbox. We typically respond within one business day.</p>
        {ref !== 'received' && <p style={{ color: gold, fontWeight: 700, marginTop: 10 }}>Reference #: {ref}</p>}
        <p style={{ color: textMuted, fontSize: '0.9rem', marginTop: 16 }}>Need to reach us sooner? Call <a href="tel:+18317173124" style={{ color: gold }}>(831) 717-3124</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 16, padding: '28px 24px' }}>
      <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 4px' }}>Request a Proposal</h3>
      <p style={{ color: textMuted, margin: '0 0 20px', fontSize: '0.92rem' }}>Tell us about your event and our concierge will send a tailored quote — no obligation.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <Field l="Company / Organization"><input style={field} value={f.companyName} onChange={set('companyName')} placeholder="Acme Inc." /></Field>
        <Field l="Industry"><input style={field} value={f.industry} onChange={set('industry')} placeholder="Technology, Finance…" /></Field>
        <Field l="Contact Name *"><input style={field} value={f.name} onChange={set('name')} required /></Field>
        <Field l="Email *"><input type="email" style={field} value={f.email} onChange={set('email')} required /></Field>
        <Field l="Phone *"><input type="tel" style={field} value={f.phone} onChange={set('phone')} required /></Field>
        <Field l="Preferred Contact"><select style={field} value={f.preferredContact} onChange={set('preferredContact')}><option>Email</option><option>Phone</option><option>Text</option></select></Field>
        <Field l="Event Type"><select style={field} value={f.eventType} onChange={set('eventType')}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field l="Number of Guests"><input style={field} value={f.guests} onChange={set('guests')} placeholder="e.g. 80" /></Field>
        <Field l="Preferred Date"><input type="date" style={field} value={f.date} onChange={set('date')} /></Field>
        <Field l="Alternative Date"><input type="date" style={field} value={f.altDate} onChange={set('altDate')} /></Field>
        <Field l="Budget"><select style={field} value={f.budget} onChange={set('budget')}><option value="">Select…</option>{BUDGETS.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Field l="Food Package"><select style={field} value={f.foodPackage} onChange={set('foodPackage')}><option value="">Select…</option>{FOOD.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Field l="Bar / Alcohol"><select style={field} value={f.barPackage} onChange={set('barPackage')}><option value="">Select…</option>{BAR.map((b) => <option key={b}>{b}</option>)}</select></Field>
        <Field l="How did you hear about us?"><input style={field} value={f.marketingSource} onChange={set('marketingSource')} placeholder="Google, referral…" /></Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field l="Branding / Logo & AV / Presentation Needs"><input style={field} value={f.brandingNeeds} onChange={set('brandingNeeds')} placeholder="Custom branding, projector, mics, presentation…" /></Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field l="Special Requests / Details"><textarea style={{ ...field, minHeight: 90, resize: 'vertical' }} value={f.notes} onChange={set('notes')} placeholder="Anything else that will help us tailor your proposal." /></Field>
      </div>
      {/* honeypot */}
      <input type="text" name="company" value={f.company} onChange={set('company')} tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
      {error && <div style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.4)', color: '#ffb4b0', borderRadius: 8, padding: '12px 14px', marginTop: 16, fontSize: '0.9rem' }}>{error}</div>}
      <button type="submit" disabled={submitting} style={{ marginTop: 18, width: '100%', background: gold, color: '#000', border: 'none', padding: '15px', borderRadius: 10, fontWeight: 800, fontSize: '1.05rem', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
        {submitting ? 'Sending…' : 'Send My Request'}
      </button>
      <p style={{ color: textMuted, fontSize: '0.8rem', textAlign: 'center', marginTop: 12 }}>We respond within one business day. Prefer to talk now? Call (831) 717-3124.</p>
    </form>
  );
}
