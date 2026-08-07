// app/tickets/page.js -> lighthousepgcinema.com/tickets
// Fewest-clicks ticketing hub: every current showtime with a direct Buy button
// that routes into the live dynamic Square checkout. Ideal Google/Maps destination.
import { movies, isMovieActive, isComingSoon, pacificTodayStr, pacificWeekday } from '../showtime-config';
import TicketButton from './TicketButton';

export const dynamic = 'force-dynamic';

const BASE = 'https://lighthousepgcinema.com';
const gold = '#d4af37';
const textLight = '#e0e0e0';
const textMuted = '#9a9a9a';
const darkBorder = '#2a2a2a';
const darkCard = '#141414';

const DEALS = { Tuesday: '$7', Wednesday: '$10', Thursday: '$10', Friday: '$15', Saturday: '$15', Sunday: '$10' };

export function generateMetadata() {
  const title = 'Buy Movie Tickets — Today’s Showtimes | Lighthouse Cinema Pacific Grove';
  const description = 'See what’s playing today at Lighthouse Cinema in Pacific Grove and buy tickets in one tap. Showtimes, prices, and instant checkout.';
  return { title, description, alternates: { canonical: BASE + '/tickets' }, openGraph: { title, description, url: BASE + '/tickets', siteName: 'Lighthouse Cinema' } };
}

function timesFor(movie, ymd, weekday) {
  if (movie.showDates) { const m = movie.showDates.find((sd) => sd.date === ymd); if (m) return m.times; }
  if (movie.showtimes && movie.showtimes[weekday]) return movie.showtimes[weekday];
  return [];
}

export default function TicketsPage() {
  const ymd = pacificTodayStr();
  const weekday = pacificWeekday();
  const dateLabel = new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', month: 'long', day: 'numeric' });
  const closed = weekday === 'Monday';
  const price = DEALS[weekday] || '$15';

  const nowPlaying = movies
    .filter((m) => m.active && isMovieActive(m) && !isComingSoon(m))
    .map((m) => ({ m, times: timesFor(m, ymd, weekday) }))
    .filter((x) => x.times.length > 0);

  const upcoming = movies.filter((m) => m.active && isComingSoon(m)).slice(0, 6);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'MovieTheater',
    name: 'Lighthouse Cinema', url: BASE + '/tickets',
    telephone: '+1-831-717-3124',
    address: { '@type': 'PostalAddress', streetAddress: '525 Lighthouse Ave', addressLocality: 'Pacific Grove', addressRegion: 'CA', postalCode: '93950', addressCountry: 'US' },
  };

  return (
    <div style={{ background: '#0a0a0a', color: textLight, minHeight: '80vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '32px 18px 60px' }}>
        <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', fontWeight: 900, color: '#fff', margin: '0 0 4px', fontFamily: 'Playfair Display, serif' }}>Buy Tickets</h1>
        <p style={{ color: gold, fontWeight: 700, margin: '0 0 4px' }}>{dateLabel}{closed ? '' : ' · All movies ' + price + ' today'}</p>
        <p style={{ color: textMuted, margin: '0 0 24px', fontSize: '0.9rem' }}>Tap a showtime to check out securely. 525 Lighthouse Ave, Pacific Grove · (831) 717-3124</p>

        {closed && (
          <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <strong style={{ color: '#fff' }}>We’re closed Mondays.</strong>
            <p style={{ color: textMuted, margin: '6px 0 0' }}>See you tomorrow — and it’s $7 Movie Day every Tuesday!</p>
          </div>
        )}

        {!closed && nowPlaying.map(({ m, times }) => (
          <div key={m.slug} style={{ display: 'flex', gap: 14, background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 14, padding: 14, marginBottom: 14, alignItems: 'flex-start' }}>
            <img src={m.poster} alt={m.title + ' poster'} style={{ width: 84, height: 126, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <a href={'/movies/' + m.slug} style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none' }}>{m.title}</a>
              <div style={{ color: textMuted, fontSize: '0.82rem', margin: '2px 0 10px' }}>{m.rating || 'NR'}{m.runtime ? ' · ' + m.runtime : ''}{m.genre ? ' · ' + m.genre : ''}{m.screen ? ' · Screen ' + m.screen : ''}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {times.map((t) => (
                  <TicketButton key={t} slug={m.slug} movieTitle={m.title} time={t} screen={m.screen || null} price={price} dateLabel={dateLabel} fallbackLink={(m.ticketLinks && m.ticketLinks.default) || 'https://square.link/u/YqvdJLdp'} />
                ))}
              </div>
            </div>
          </div>
        ))}

        {!closed && nowPlaying.length === 0 && (
          <p style={{ color: textMuted }}>Today’s showtimes are being finalized — please check back shortly or call (831) 717-3124.</p>
        )}

        {upcoming.length > 0 && (
          <div style={{ marginTop: 30 }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 12px' }}>Coming this week</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 12 }}>
              {upcoming.map((m) => (
                <a key={m.slug} href={'/movies/' + m.slug} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <img src={m.poster} alt={m.title + ' poster'} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginTop: 6 }}>{m.title}</div>
                  <div style={{ color: textMuted, fontSize: '0.72rem' }}>Opens {new Date(m.startDate + 'T12:00:00Z').toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', month: 'short', day: 'numeric' })}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
