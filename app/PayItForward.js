'use client';
import { useState } from 'react';

const gold = '#D4AF37';
const cream = '#F0E9D7';
const dark = '#0a0a0a';

// Pre-filled, tax-free Square checkout links
const TICKETS = [
  { n: 1, price: 15, label: '1 ticket', impact: 'one neighbor', url: 'https://square.link/u/L2yCGOGv' },
  { n: 2, price: 30, label: '2 tickets', impact: 'a parent + child', url: 'https://square.link/u/UtYHkgJs' },
  { n: 5, price: 75, label: '5 tickets', impact: 'a whole family', best: true, url: 'https://square.link/u/O0Ed9BF3' },
  { n: 10, price: 150, label: '10 tickets', impact: 'spread the magic', url: 'https://square.link/u/GkDlz2RB' },
];
const TICKETS_CUSTOM = 'https://square.link/u/L2yCGOGv';
const DONATIONS = [
  { price: 5, url: 'https://square.link/u/OLVnKAfx' },
  { price: 15, url: 'https://square.link/u/VZxtW8AG' },
  { price: 25, url: 'https://square.link/u/sHt1frSo' },
  { price: 50, url: 'https://square.link/u/hQKfZbOc' },
];
const DONATE_CUSTOM = 'https://square.link/u/kNTJoYP4';

export default function PayItForward() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('tickets');
  const [sent, setSent] = useState(false);

  const go = (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
    setSent(true);
    setTimeout(() => { setSent(false); setOpen(false); }, 4000);
  };

  const card = {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
    width: 'calc(100vw - 32px)', maxWidth: 360,
    background: 'linear-gradient(135deg,#1a1505,#0a0a0a)',
    border: '1.5px solid rgba(212,175,55,0.25)', borderRadius: 20,
    padding: '26px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  };
  const moreBtn = {
    width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer', marginBottom: 14,
    border: '1px dashed rgba(212,175,55,0.4)', background: 'transparent', color: cream, fontSize: '0.85rem',
  };

  if (sent) {
    return (
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={{ color: gold, fontSize: '1.15rem', marginBottom: 6, lineHeight: 1.4 }}>You just made someone&rsquo;s night.</p>
        <p style={{ color: cream, fontSize: '0.9rem', marginBottom: 6 }}>Finish in the secure window that just opened.</p>
        <p style={{ color: 'rgba(240,233,215,0.5)', fontSize: '0.82rem' }}>Thank you, from all of us at Lighthouse Cinema</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: 100, right: 24, zIndex: 9998,
        background: 'linear-gradient(135deg,#D4AF37,#c9a42e)', color: dark, border: 'none',
        borderRadius: 50, padding: '12px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
        boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
      }}>
        Gift Movie Tickets &hearts;
      </button>
    );
  }

  return (
    <div style={card}>
      <button onClick={() => setOpen(false)} style={{
        position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
        color: 'rgba(240,233,215,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
      }}>&times;</button>

      <h3 style={{ color: gold, fontSize: '1.2rem', margin: '0 0 6px', fontFamily: "'Playfair Display', serif" }}>
        {mode === 'tickets' ? 'Gift the Magic of Movies' : 'Support the Cinema'}
      </h3>
      <p style={{ color: cream, fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 10px' }}>
        {mode === 'tickets'
          ? 'Buy movie tickets for neighbors who need one &mdash; families, seniors, veterans. Choose how many to gift:'
          : 'Help keep Pacific Grove&rsquo;s last cinema alive. Every dollar counts:'}
      </p>

      {mode === 'tickets' && (
        <p style={{ color: gold, fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 16px', fontStyle: 'italic' }}>
          &hearts; Most neighbors gift 2 or more &mdash; one ticket is a night out, but a few can lift a whole family.
        </p>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 18, background: 'rgba(212,175,55,0.08)', borderRadius: 10, padding: 3, border: '1px solid rgba(212,175,55,0.12)' }}>
        {[{ k: 'tickets', l: 'Gift Tickets' }, { k: 'support', l: 'Support Cinema' }].map((o) => (
          <button key={o.k} onClick={() => setMode(o.k)} style={{
            flex: 1, padding: '8px 10px', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            background: mode === o.k ? gold : 'transparent', color: mode === o.k ? dark : 'rgba(240,233,215,0.5)',
          }}>{o.l}</button>
        ))}
      </div>

      {mode === 'tickets' ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {TICKETS.map((t) => (
              <button key={t.n} onClick={() => go(t.url)} style={{
                position: 'relative', padding: '14px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: t.best ? '2px solid ' + gold : '1.5px solid rgba(212,175,55,0.3)',
                background: t.best ? 'rgba(212,175,55,0.16)' : 'rgba(212,175,55,0.06)',
                boxShadow: t.best ? '0 0 18px rgba(212,175,55,0.25)' : 'none',
              }}>
                {t.best && (
                  <div style={{
                    position: 'absolute', top: -9, right: 8, background: gold, color: dark,
                    fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5, padding: '2px 7px', borderRadius: 6,
                  }}>MOST LOVED</div>
                )}
                <div style={{ color: gold, fontWeight: 700, fontSize: '1.05rem' }}>{t.label}</div>
                <div style={{ color: cream, fontSize: '0.82rem', marginTop: 2 }}>${t.price}</div>
                <div style={{ color: 'rgba(240,233,215,0.55)', fontSize: '0.72rem', marginTop: 3 }}>{t.impact}</div>
              </button>
            ))}
          </div>
          <button onClick={() => go(TICKETS_CUSTOM)} style={moreBtn}>Other number of tickets &rarr;</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {DONATIONS.map((d) => (
              <button key={d.price} onClick={() => go(d.url)} style={{
                padding: '14px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: '1.5px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)',
                color: gold, fontWeight: 700, fontSize: '1.05rem',
              }}>${d.price}</button>
            ))}
          </div>
          <button onClick={() => go(DONATE_CUSTOM)} style={moreBtn}>Other amount &rarr;</button>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(240,233,215,0.35)', margin: 0, fontStyle: 'italic' }}>
        Secure checkout by Square &middot; every gift goes to a real guest or the cinema.
      </p>
      <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'rgba(240,233,215,0.25)', margin: '6px 0 0', fontStyle: 'italic' }}>
        &mdash; Dr. Ayman Adeeb, Owner
      </p>
    </div>
  );
}
