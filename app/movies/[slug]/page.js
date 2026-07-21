// app/movies/[slug]/page.js  ->  lighthousepgcinema.com/movies/<slug>
// Full movie detail page: hero, synopsis, trailer, all showtimes + tickets,
// share, add-to-calendar, related movies, per-page SEO metadata + Movie schema.

import { notFound } from 'next/navigation';
import { movies, isMovieActive, isComingSoon } from '../../showtime-config';
import MovieClient from './MovieClient';

export const dynamic = 'force-dynamic';

const gold = '#d4af37';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';
const BASE = 'https://lighthousepgcinema.com';

export function generateStaticParams() {
  return movies.filter((m) => m.active).map((m) => ({ slug: m.slug }));
}

function findMovie(slug) {
  return movies.find((m) => m.slug === slug && m.active);
}

// Build the list of show days for the client component.
function buildShowdays(movie) {
  if (movie.showtimes) {
    const order = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];
    return order
      .filter((d) => movie.showtimes[d] && movie.showtimes[d].length)
      .map((d) => ({ day: d, times: movie.showtimes[d] }));
  }
  if (movie.showDates) {
    return movie.showDates.map((sd) => {
      const dt = new Date(sd.date + 'T00:00:00');
      const day = dt.toLocaleDateString('en-US', { weekday: 'long' });
      const label = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      return { day, label, times: sd.times };
    });
  }
  return [];
}

export function generateMetadata({ params }) {
  const movie = findMovie(params.slug);
  if (!movie) return { title: 'Movie Not Found | Lighthouse Cinema' };
  const title = `${movie.title} (${movie.rating || 'NR'}) — Showtimes & Tickets | Lighthouse Cinema Pacific Grove`;
  const desc =
    (movie.description ? movie.description.slice(0, 155) : `See ${movie.title} at Lighthouse Cinema in Pacific Grove.`) +
    ' Showtimes, trailer & tickets.';
  const url = `${BASE}/movies/${movie.slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url, type: 'video.movie',
      images: movie.poster ? [{ url: movie.poster }] : [],
      siteName: 'Lighthouse Cinema',
    },
    twitter: {
      card: 'summary_large_image', title, description: desc,
      images: movie.poster ? [movie.poster] : [],
    },
  };
}

export default function MoviePage({ params }) {
  const movie = findMovie(params.slug);
  if (!movie) notFound();
  // Past its run (not currently playing and not upcoming) — no longer purchasable.
  if (!isMovieActive(movie) && !isComingSoon(movie)) notFound();

  const showdays = buildShowdays(movie);
  const comingSoon = isComingSoon(movie);
  const related = movies
    .filter((m) => m.active && m.slug !== movie.slug && (isMovieActive(m) || isComingSoon(m)))
    .slice(0, 4);

  const openDate = movie.startDate
    ? new Date(movie.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    image: movie.poster || undefined,
    description: movie.description || undefined,
    genre: movie.genre || undefined,
    contentRating: movie.rating || undefined,
    datePublished: movie.startDate || undefined,
    url: `${BASE}/movies/${movie.slug}`,
  };

  return (
    <div style={{ background: '#0a0a0a', color: textLight }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 24px 0' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '0.82rem', color: textMuted }}>
          <a href="/" style={{ color: textMuted, textDecoration: 'none' }}>Home</a>
          <span> / </span>
          <a href="/#showtimes" style={{ color: textMuted, textDecoration: 'none' }}>Movies</a>
          <span> / </span>
          <span style={{ color: gold }}>{movie.title}</span>
        </nav>
      </div>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 8px' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <img
            src={movie.poster}
            alt={`${movie.title} movie poster`}
            style={{ width: 260, maxWidth: '100%', borderRadius: 14, border: '1px solid ' + darkBorder, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          />
          <div style={{ flex: 1, minWidth: 280 }}>
            {comingSoon && (
              <span style={{ display: 'inline-block', background: gold, color: '#000', padding: '3px 12px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.5, marginBottom: 12 }}>
                {openDate ? 'COMING ' + openDate.toUpperCase() : 'COMING SOON'}
              </span>
            )}
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', margin: '0 0 10px', fontFamily: 'Playfair Display, serif' }}>{movie.title}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', color: textMuted, fontSize: '0.9rem', marginBottom: 16 }}>
              {movie.rating && <span style={{ border: '1px solid ' + darkBorder, borderRadius: 6, padding: '2px 8px' }}>{movie.rating}</span>}
              {movie.runtime && <span>{movie.runtime}</span>}
              {movie.genre && <span>· {movie.genre}</span>}
              {movie.rottenTomatoes && <span>· 🍅 {movie.rottenTomatoes}</span>}
            </div>
            {movie.director && <p style={{ margin: '0 0 4px', color: textLight }}><strong style={{ color: gold }}>Director:</strong> {movie.director}</p>}
            {movie.cast && <p style={{ margin: '0 0 14px', color: textLight }}><strong style={{ color: gold }}>Cast:</strong> {movie.cast}</p>}
            {movie.description && <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: textLight, margin: '0 0 22px', maxWidth: 640 }}>{movie.description}</p>}

            <MovieClient movie={movie} showdays={showdays} />
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section style={{ background: darkBg, borderTop: '1px solid ' + darkBorder, marginTop: 40 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 20px' }}>More at Lighthouse</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 18 }}>
              {related.map((m) => (
                <a key={m.slug} href={`/movies/${m.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 10, overflow: 'hidden' }}>
                    <img src={m.poster} alt={`${m.title} poster`} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{m.title}</div>
                      <div style={{ color: textMuted, fontSize: '0.75rem', marginTop: 2 }}>{m.rating}{m.runtime ? ' · ' + m.runtime : ''}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
