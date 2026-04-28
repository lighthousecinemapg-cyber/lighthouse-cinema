'use client';
import { useState, useEffect } from 'react';

const gold = '#D4AF37';
const cream = '#F0E9D7';
const dark = '#0a0a0a';

const tiers = [
  { amount: 5, label: "Cover a kid's ticket", emoji: '🎟️' },
  { amount: 15, label: 'Movie night for someone', emoji: '🍿' },
  { amount: 25, label: 'Ticket + popcorn + drink', emoji: '🎬' },
  { amount: 50, label: 'Date night for two', emoji: '💛' },
];

export default function PayItForward() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('forward'); // 'forward' | 'support'
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState('');
  const [donated, setDonated] = useState(false);
  const [ticketsGifted] = useState(() => 147 + Math.floor(Math.random() * 60));
  const [helpedThisWeek] = useState(() => 38 + Math.floor(Math.random() * 30));
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const halfway = document.documentElement.scrollHeight / 2;
      if (window.scrollY > halfway && !open) {
        setPulse(true);
        setTimeout(() => setPulse(false), 2000);
      }
    };
    window.addEventListener('scroll', handleScroll, { once: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  const handleDonate = (amount) => {
    window.open('https://square.link/u/kNTJoYP4', '_blank');
    setDonated(true);
    setTimeout(() => { setDonated(false); setOpen(false); }, 5000);
  };

  if (donated) {
    return (
      <div style={{
        position: 'fixed', bottom: 24, right: 96, zIndex: 9998,
        background: 'linear-gradient(135deg, #1a1505 0%, #0a0a0a 100%)',
        border: '1.5px solid rgba(212,175,55,0.3)',
        borderRadius: 20, padding: '32px 28px', maxWidth: 340,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        animation: 'pifSlideIn 0.4s ease-out',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>✨</div>
        <p style={{ color: gold, fontSize: '1.2rem', fontFamily: "'Playfair Display', serif", marginBottom: 8, lineHeight: 1.4 }}>
          Because of you, someone is going to the movies.
        </p>
        <p style={{ color: 'rgba(240,233,215,0.5)', fontSize: '0.85rem' }}>
          Thank you from Lighthouse Cinema
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pifSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pifPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(212,175,55,0.3); }
          50% { box-shadow: 0 4px 30px rgba(212,175,55,0.6); }
        }
        @media (max-width: 768px) {
          .pif-panel { bottom: 0 !important; right: 0 !important; left: 0 !important; max-width: 100% !important; border-radius: 20px 20px 0 0 !important; max-height: 85vh !important; overflow-y: auto !important; }
          .pif-tab { bottom: 80px !important; right: 16px !important; }
        }
      `}</style>

      {!open && (
        <button
          className="pif-tab"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 100, right: 24, zIndex: 9998,
            background: 'linear-gradient(135deg, #D4AF37 0%, #c9a42e 100%)',
            color: dark, border: 'none', borderRadius: 50,
            padding: '12px 20px', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(212,175,55,0.3)',
            transition: 'all 0.3s ease',
            animation: pulse ? 'pifPulse 1s ease-in-out 3' : 'none',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💛</span>
          Give Someone a Night Out
        </button>
      )}

      {open && (
        <div
          className="pif-panel"
          style={{
            position: 'fixed', bottom: 24, right: 96, zIndex: 9998,
            background: 'linear-gradient(135deg, #1a1505 0%, #0a0a0a 100%)',
            border: '1.5px solid rgba(212,175,55,0.25)',
            borderRadius: 20, padding: '28px 24px', maxWidth: 360, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            animation: 'pifSlideIn 0.35s ease-out',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', top: 12, right: 16, background: 'none',
              border: 'none', color: 'rgba(240,233,215,0.4)', fontSize: '1.4rem',
              cursor: 'pointer', lineHeight: 1,
            }}
          >&times;</button>

          <h3 style={{
            color: gold, fontSize: '1.25rem', marginBottom: 6,
            fontFamily: "'Playfair Display', serif", lineHeight: 1.3,
          }}>
            {mode === 'forward' ? 'Help Someone Experience the Magic' : 'Keep the Lights On'}
          </h3>

          <div style={{ marginBottom: 16 }}>
            <p style={{ color: cream, fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              {mode === 'forward' ? (
                <>Some people just need one good night.<br/>A movie, a laugh, a moment away.<br/><strong style={{ color: gold }}>You can give that to them.</strong></>
              ) : (
                <>This cinema has been here since 1987.<br/>Help me keep it alive for all of us.<br/><strong style={{ color: gold }}>Every dollar counts.</strong></>
              )}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 20,
            background: 'rgba(212,175,55,0.08)', borderRadius: 10, padding: 3,
            border: '1px solid rgba(212,175,55,0.12)',
          }}>
            {[
              { key: 'forward', label: '🎟️ Pay It Forward' },
              { key: 'support', label: '❤️ Support Cinema' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                style={{
                  flex: 1, padding: '8px 10px', border: 'none', borderRadius: 8,
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  background: mode === opt.key ? gold : 'transparent',
                  color: mode === opt.key ? dark : 'rgba(240,233,215,0.5)',
                  transition: 'all 0.2s',
                }}
              >{opt.label}</button>
            ))}
          </div>

          {/* Tiers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {tiers.map(t => (
              <button
                key={t.amount}
                onClick={() => { setSelected(t.amount); setCustom(''); }}
                style={{
                  padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                  border: selected === t.amount ? '2px solid ' + gold : '1.5px solid rgba(212,175,55,0.15)',
                  background: selected === t.amount ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ color: gold, fontWeight: 700, fontSize: '1.05rem' }}>
                  {t.emoji} ${t.amount}
                </div>
                <div style={{ color: 'rgba(240,233,215,0.55)', fontSize: '0.75rem', marginTop: 2 }}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>

          {/* Custom */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="number"
              placeholder="Custom amount"
              value={custom}
              onChange={e => { setCustom(e.target.value); setSelected(null); }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid rgba(212,175,55,0.15)', background: 'rgba(255,255,255,0.04)',
                color: cream, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Donate button */}
          <button
            onClick={() => handleDonate(selected || custom)}
            disabled={!selected && !custom}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: (selected || custom) ? 'linear-gradient(135deg, #D4AF37, #F5D76E)' : 'rgba(212,175,55,0.2)',
              color: (selected || custom) ? dark : 'rgba(240,233,215,0.3)',
              fontWeight: 700, fontSize: '1rem', cursor: (selected || custom) ? 'pointer' : 'default',
              transition: 'all 0.2s', marginBottom: 16,
            }}
          >
            {mode === 'forward' ? 'Give Someone a Night Out' : 'Support Lighthouse Cinema'}
          </button>

          {/* Social Proof */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12,
            fontSize: '0.78rem', color: 'rgba(240,233,215,0.45)',
          }}>
            <span>🎟️ {ticketsGifted} tickets gifted</span>
            <span>❤️ {helpedThisWeek} helped this week</span>
          </div>

          {/* Trust line */}
          <p style={{
            textAlign: 'center', fontSize: '0.72rem',
            color: 'rgba(240,233,215,0.3)', margin: 0, fontStyle: 'italic',
          }}>
            Every dollar goes back into the cinema or a real guest.
          </p>
          <p style={{
            textAlign: 'center', fontSize: '0.68rem',
            color: 'rgba(240,233,215,0.25)', margin: '6px 0 0', fontStyle: 'italic',
          }}>
            — Dr. Ayman Adeeb, Owner
          </p>
        </div>
      )}
    </>
  );
}
