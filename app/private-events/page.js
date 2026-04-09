export const metadata = { title: 'Private Events | Lighthouse Cinema' };

export default function PrivateEventsPage() {
  return (
    <main style={{ background: '#0a0a0a', color: '#f5e9c8', minHeight: '100vh', padding: '40px 20px 140px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ color: '#d4af37', fontSize: 44 }}>Private Events</h1>
        <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.7 }}>
          Birthdays, corporate offsites, fundraisers, and private screenings at Pacific Grove's most beautiful venue.
          Book the entire auditorium, curate your own menu, and make it unforgettable.
        </p>

        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', marginTop: 32 }}>
          {[
            { t: 'Birthday Parties', d: 'Kids, teens, milestone birthdays. Cake, popcorn, and a movie on the big screen.', p: 'From $650' },
            { t: 'Corporate Events', d: 'Team offsites, product launches, holiday parties, all-hands screenings.', p: 'From $1,800' },
            { t: 'Private Screenings', d: 'Book the full auditorium — your choice of film, cocktails, and custom menu.', p: '$2,500' },
          ].map(x => (
            <div key={x.t} style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, padding: 22 }}>
              <h3 style={{ color: '#d4af37', margin: '0 0 8px' }}>{x.t}</h3>
              <p style={{ opacity: 0.8, fontSize: 14 }}>{x.d}</p>
              <div style={{ color: '#d4af37', fontWeight: 700, marginTop: 8 }}>{x.p}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <a href="/contact" style={{
            background: '#d4af37', color: '#0a0a0a', padding: '18px 36px',
            borderRadius: 999, textDecoration: 'none', fontWeight: 800, fontSize: 17,
          }}>Request a Quote</a>
        </div>
      </div>
    </main>
  );
}
