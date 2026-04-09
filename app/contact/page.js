'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      e.target.reset();
    } catch {
      setStatus('err');
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '40px 20px 140px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ color: '#d4af37', fontSize: 40, marginBottom: 8 }}>Contact Us</h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          Questions, private events, group bookings — send us a message and we'll reply within a few hours.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <Field name="name" label="Name" required />
          <Field name="phone" label="Phone" type="tel" required />
          <Field name="email" label="Email" type="email" required />
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#d4af37' }}>Message</span>
            <textarea name="message" required rows={5} style={inputStyle} />
          </label>
          <button disabled={sending} type="submit" style={{
            background: '#d4af37', color: '#0a0a0a', border: 0, padding: '16px',
            borderRadius: 999, fontWeight: 800, fontSize: 16, cursor: 'pointer',
          }}>{sending ? 'Sending…' : 'Send Message'}</button>
        </form>
        {status === 'ok' && <p style={{ color: '#7ed957', marginTop: 16 }}>Thanks — message received. We'll reply shortly.</p>}
        {status === 'err' && <p style={{ color: '#ff6b6b', marginTop: 16 }}>Something went wrong. Call us at (831) 717-3124.</p>}
        <p style={{ marginTop: 32, opacity: 0.7, fontSize: 14 }}>
          📞 (831) 717-3124 · ✉️ lighthousecinemapg@gmail.com<br />
          📍 525 Lighthouse Ave, Pacific Grove, CA 93950
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  background: '#141414', border: '1px solid #2a2a2a', color: '#f5e9c8',
  padding: '12px 14px', borderRadius: 10, fontSize: 15, fontFamily: 'inherit',
};

function Field({ name, label, type = 'text', required }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 13, color: '#d4af37' }}>{label}</span>
      <input name={name} type={type} required={required} style={inputStyle} />
    </label>
  );
}
