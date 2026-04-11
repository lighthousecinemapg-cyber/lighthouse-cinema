import Link from 'next/link';
import { getEvents } from '@/lib/events-db';

export const metadata = {
  title: 'Events | Lighthouse Cinema',
  description: 'Weekly events, special nights, and private screenings at Lighthouse Cinema, Pacific Grove.',
};

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

const HYPE = ['🔥 Almost Sold Out', '⭐ Most Popular', '🎟 This Weekend', '✨ Selling Fast'];

export default function EventsPage() {
  const events = getEvents();
  const weekly = events.filter(e => e.category === 'weekly');
  const special = events.filter(e => e.category !== 'weekly');

  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '32px 20px 120px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#d4af37', textDecoration: 'none' }}>← Home</Link>
        <h1 style={{ fontSize: 42, margin: '12px 0 8px', color: '#d4af37' }}>What&apos;s On</h1>
        <p style={{ opacity: 0.8, marginBottom: 32 }}>Book in under 10 seconds. Luxury cinema, Pacific Grove.</p>

        <h2 style={{ color: '#d4af37', marginTop: 32 }}>This Week</h2>
        <Grid events={weekly} />

        <h2 style={{ color: '#d4af37', marginTop: 48 }}>Special Events</h2>
        <Grid events={special} />
      </div>
    </main>
  );
}

function Grid({ events }) {
  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {events.map((e, i) => (
        <article key={e.id} style={{
          background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16,
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {e.image && e.image.startsWith('http') ? (
            <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
              <img
                src={e.image}
                alt={e.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {e.trailerUrl && (
                <a href={e.trailerUrl} target="_blank" rel="noopener noreferrer" style={{
                  position: 'absolute', bottom: 10, right: 10,
                  background: 'rgba(212,175,55,0.95)', color: '#0a0a0a',
                  padding: '6px 14px', borderRadius: 999, fontSize: 12,
                  fontWeight: 700, textDecoration: 'none',
                }}>▶ Watch Trailer</a>
              )}
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg,#1a1a1a,#2a1f0a)',
              height: 160, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 42,
            }}>🎬</div>
          )}
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <span style={{ fontSize: 11, color: '#d4af37', letterSpacing: 1 }}>{HYPE[i % HYPE.length]}</span>
            <h3 style={{ margin: 0, fontSize: 22, color: '#f5e9c8' }}>{e.title}</h3>
            <p style={{ fontSize: 13, opacity: 0.75, margin: '4px 0 8px' }}>{e.description}</p>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              📅 {formatDate(e.date)} · ⏰ {e.time}
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#d4af37' }}>From ${e.ticketPrice}</span>
              <Link href={`/events/${e.id}`} style={{
                background: '#d4af37', color: '#0a0a0a', padding: '10px 18px',
                borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}>Book Now</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
