import Link from 'next/link';
import { getEvents } from '@/lib/events-db';

export const metadata = {
  title: 'Events | Lighthouse Cinema',
  description: 'Weekly events, special nights, and private screenings at Lighthouse Cinema, Pacific Grove.',
};

/* ââ helpers ââ */
function fmtDay(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/* ââ styles ââ */
const gold = '#D4AF37';
const cream = '#F0E9D7';
const dark = '#0a0a0a';
const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, overflow: 'hidden' };
const goldBtn = { display: 'inline-block', background: `linear-gradient(135deg, ${gold}, #F5D76E)`, color: dark, padding: '12px 28px', borderRadius: 999, fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: 0.3 };
const ghostBtn = { display: 'inline-block', border: `1px solid ${gold}`, color: gold, padding: '10px 22px', borderRadius: 999, fontWeight: 600, fontSize: 13, textDecoration: 'none' };
const badge = (bg, color) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', background: bg, color });
const sectionHead = { color: gold, fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 };
const sectionTitle = { fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 32px', fontFamily: "'Playfair Display', serif" };

export default function EventsPage() {
  const events = getEvents();

  /* ââ group Now Playing showtimes by title ââ */
  const npRaw = events.filter(e => e.description?.includes('NOW SHOWING'));
  const npMap = {};
  npRaw.forEach(e => {
    if (!npMap[e.title]) npMap[e.title] = { ...e, showtimes: [] };
    npMap[e.title].showtimes.push({ id: e.id, date: e.date, time: e.time, day: fmtDay(e.date) });
  });
  const nowPlaying = Object.values(npMap);

  /* ââ group showtimes by day ââ */
  function groupByDay(showtimes) {
    const map = {};
    showtimes.forEach(s => {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    });
    return Object.entries(map);
  }

  /* ââ weekly & special ââ */
  const weekly = events.filter(e => e.category === 'weekly');
  const special = events.filter(e => e.category !== 'weekly' && !e.description?.includes('NOW SHOWING'));

  return (
    <main style={{ background: dark, color: cream, minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ padding: '80px 24px 48px', textAlign: 'center', background: `radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%), ${dark}`, borderBottom: '1px solid #1a1a1a' }}>
        <div style={sectionHead}>Lighthouse Cinema Â· Pacific Grove</div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#fff', margin: '12px 0 16px', fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
          What&apos;s <span style={{ color: gold }}>On</span>
        </h1>
        <p style={{ color: '#888', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
          Movies, live events, and community nights. Book your seat in seconds.
        </p>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 120px' }}>

        {/* NOW PLAYING */}
        {nowPlaying.length > 0 && (
          <section style={{ paddingTop: 56 }}>
            <div style={sectionHead}>Now Playing</div>
            <h2 style={sectionTitle}>On the Big Screen</h2>

            {nowPlaying.map(movie => {
              const days = groupByDay(movie.showtimes);
              const posterUrl = movie.image?.startsWith('http')
                ? movie.image
                : `https://img.youtube.com/vi/m08TxIsFTRI/maxresdefault.jpg`;

              return (
                <article key={movie.title} style={{ ...card, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, marginBottom: 24 }}>
                  {/* poster */}
                  <div style={{ position: 'relative', overflow: 'hidden', minHeight: 320 }}>
                    <img src={posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span style={badge('rgba(212,175,55,0.95)', dark)}>Now Showing</span>
                    </div>
                  </div>

                  {/* info */}
                  <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 12px', fontFamily: "'Playfair Display', serif" }}>{movie.title}</h3>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                      <span style={badge('rgba(212,175,55,0.12)', gold)}>PG-13</span>
                      <span style={badge('rgba(212,175,55,0.12)', gold)}>2h 19m</span>
                      <span style={badge('rgba(212,175,55,0.12)', gold)}>Sci-Fi</span>
                      <span style={badge('rgba(212,175,55,0.12)', gold)}>94% RT</span>
                    </div>

                    <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7, margin: '0 0 20px' }}>
                      Ryan Gosling stars as a science teacher who wakes up alone on a spaceship light-years from Earth. Based on Andy Weir&apos;s bestselling novel. Directed by Phil Lord &amp; Christopher Miller.
                    </p>

                    <div style={{ fontSize: 12, color: gold, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Showtimes This Week</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                      {days.map(([day, times]) => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#ccc', minWidth: 90 }}>{day}</span>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {times.map(t => (
                              <Link key={t.id} href={`/events/${t.id}`} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#eee', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                                {fmtTime(t.time)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: gold }}>${movie.ticketPrice}</span>
                      <Link href={`/events/${movie.showtimes[0].id}`} style={goldBtn}>Book Now</Link>
                      {movie.trailerUrl && (
                        <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer" style={ghostBtn}>â¶ Trailer</a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* THIS WEEK */}
        <section style={{ paddingTop: 56 }}>
          <div style={sectionHead}>Weekly Events</div>
          <h2 style={sectionTitle}>This Week at the Cinema</h2>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {weekly.map(e => (
              <article key={e.id} style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: `linear-gradient(135deg, #151515, #1a1508)`, padding: '28px 24px 20px', borderBottom: '1px solid #1e1e1e' }}>
                  <div style={{ fontSize: 11, color: gold, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                    {fmtDay(e.date)}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{e.title}</h3>
                </div>
                <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, margin: 0 }}>{e.description}</p>
                  <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>â° {fmtTime(e.time)}</div>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: gold }}>
                      {e.ticketPrice === 0 ? 'FREE' : `$${e.ticketPrice}`}
                    </span>
                    <Link href={`/events/${e.id}`} style={{ ...goldBtn, padding: '8px 20px', fontSize: 13 }}>Book Now</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SPECIAL EVENTS */}
        {special.length > 0 && (
          <section style={{ paddingTop: 56 }}>
            <div style={sectionHead}>Coming Up</div>
            <h2 style={sectionTitle}>Special Events</h2>

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {special.map(e => {
                const hasImg = e.image?.startsWith('http');
                return (
                  <article key={e.id} style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                    {hasImg ? (
                      <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                        <img src={e.image} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #2a1f0a)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 48, opacity: 0.5 }}>ð­</span>
                      </div>
                    )}
                    <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={badge('rgba(212,175,55,0.12)', gold)}>
                          {fmtDay(e.date)}
                        </span>
                        <span style={{ fontSize: 12, color: '#666' }}>at {fmtTime(e.time)}</span>
                      </div>
                      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{e.title}</h3>
                      <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6, margin: 0 }}>{e.description}</p>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: gold }}>
                          {e.ticketPrice === 0 ? 'FREE' : `$${e.ticketPrice}`}
                        </span>
                        {e.bookingUrl ? (
                          <a href={e.bookingUrl} target="_blank" rel="noopener noreferrer" style={goldBtn}>Book Tickets</a>
                        ) : (
                          <Link href={`/events/${e.id}`} style={goldBtn}>Book Now</Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ marginTop: 64, padding: '40px 32px', background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: gold, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Don&apos;t Miss a Thing</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px', fontFamily: "'Playfair Display', serif" }}>Text JOIN to (831) 747-4470</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Get showtimes, event alerts, and VIP deals straight to your phone.</p>
          <Link href="/contact" style={goldBtn}>Contact Us</Link>
        </section>

      </div>
    </main>
  );
}
