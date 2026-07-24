// app/corporate-events/page.js -> lighthousepgcinema.com/corporate-events
// Luxury corporate & private-events landing page + enterprise inquiry.
import CorporateForm from './CorporateForm';

const gold = '#d4af37';
const goldDark = '#9A7B2A';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#161616';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#8a8a8a';
const BASE = 'https://lighthousepgcinema.com';
const PHONE = '(831) 241-6617';
const ADDRESS = '525 Lighthouse Ave, Pacific Grove, CA 93950';

export const metadata = {
  title: 'Corporate Events & Private Theater Rentals | Lighthouse Cinema, Pacific Grove',
  description: 'Host corporate events, private screenings, product launches, and luxury brand experiences at Lighthouse Cinema in Pacific Grove. Rent a private auditorium for up to 200 guests with catering, bar service, custom branding, and full AV. Request a proposal today.',
  alternates: { canonical: BASE + '/corporate-events' },
  openGraph: {
    title: 'Corporate Events & Private Theater Rentals — Lighthouse Cinema',
    description: 'A private auditorium for corporate events, screenings, and brand launches on the Monterey Peninsula. Catering, bar, custom branding, and AV. Request a proposal.',
    url: BASE + '/corporate-events',
    siteName: 'Lighthouse Cinema',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Corporate Events at Lighthouse Cinema', description: 'Private theater rentals for corporate events, screenings & brand launches in Pacific Grove.' },
};

const EVENT_TYPES = [
  ['Private Theater Rentals', 'The whole auditorium, exclusively yours.'],
  ['Corporate Events & Meetings', 'Off-sites, all-hands, and presentations on the big screen.'],
  ['Product Launches & Brand Reveals', 'Debut on a cinema screen with premium sound.'],
  ['Client Appreciation & VIP', 'Reward top clients with a red-carpet screening.'],
  ['Employee & Holiday Parties', 'Team celebrations with catering and bar service.'],
  ['Film Premieres & Festivals', 'Screen your film for an audience in true cinema quality.'],
  ['Fundraisers & Nonprofits', 'Memorable, high-impact events for a cause.'],
  ['Watch Parties & Live Sports', 'The big game on the biggest screen in town.'],
];

const AMENITIES = [
  ['Exclusive Auditorium', 'Private use of the theater — no strangers, just your guests.'],
  ['Seats up to 200', 'Comfortable luxury seating with premium sightlines.'],
  ['Cinema-Grade AV', '4K projection, immersive surround sound, mics & presentation support.'],
  ['Dedicated Event Host', 'A concierge runs your event so you can focus on your guests.'],
  ['Catering & Concessions', 'Pizza, hot dog & nacho bars, tenders, fresh popcorn, and more.'],
  ['Bar Service', 'Beer, wine, and full-bar options available.'],
  ['Custom Branding', 'Put your logo on screen — bring any movie, deck, or reel.'],
  ['Setup & Cleanup Included', 'We handle the details before and after.'],
];

const PACKAGES = [
  ['School / Field Trip', 'from $200', '+ $10 / guest', 'Educational outings and group visits.'],
  ['Private Screening', 'from $300', '+ $15 / guest', 'Your movie, your group, the whole theater.'],
  ['Birthday & Celebration', 'from $350', '+ $18 / guest', 'A memorable party on the big screen.'],
  ['Premium Gala', 'from $500', '+ $35 / guest', 'Our flagship experience for premieres & corporate galas.'],
];

const STEPS = [
  ['1. Send your request', 'Tell us your event type, date, and guest count using the form.'],
  ['2. Get a tailored proposal', 'Our events team replies within one business day with pricing and options.'],
  ['3. Confirm with a deposit', 'Secure your date with a simple, secure Square payment.'],
  ['4. We handle the rest', 'Setup, AV, catering, and cleanup — you just show up and enjoy.'],
];

const FAQ = [
  ['How many guests can you host?', 'Our auditorium comfortably seats up to 200 guests, and any group size is welcome.'],
  ['What is included in a rental?', 'Every rental includes exclusive use of the auditorium, your chosen movie or content, cinema-grade projection and sound, a dedicated event host, and setup and cleanup.'],
  ['Can we show our own content?', 'Yes. Bring a film, a presentation, a sizzle reel, or a live feed — we support most formats and can add your branding on screen.'],
  ['Do you offer catering and a bar?', 'Yes. We offer popcorn and concessions, pizza and hot dog/nacho bars, chicken tenders and wings, plus beer, wine, and full-bar options.'],
  ['How far in advance should we book?', 'We recommend at least 48 hours; for weekends, holidays, and larger corporate events, one to two weeks is ideal.'],
  ['How do we pay?', 'Deposits and balances are handled securely through Square. You will receive receipts and confirmation for every payment.'],
];

function jsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Corporate Events & Private Theater Rentals',
    serviceType: 'Private venue rental for corporate events and screenings',
    provider: {
      '@type': 'MovieTheater',
      name: 'Lighthouse Cinema',
      telephone: '+1-831-241-6617',
      address: { '@type': 'PostalAddress', streetAddress: '525 Lighthouse Ave', addressLocality: 'Pacific Grove', addressRegion: 'CA', postalCode: '93950', addressCountry: 'US' },
      url: BASE,
    },
    areaServed: 'Monterey Peninsula, California',
    url: BASE + '/corporate-events',
  };
}

function Card({ title, desc }) {
  return (
    <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: '20px 18px' }}>
      <h3 style={{ color: gold, fontSize: '1.02rem', margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: textLight, fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

export default function CorporateEventsPage() {
  return (
    <div style={{ background: black, color: textLight }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.14) 0%, rgba(10,10,10,1) 70%)', padding: '84px 24px 64px', textAlign: 'center', borderBottom: '1px solid ' + darkBorder }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ color: gold, letterSpacing: 4, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: 16 }}>Corporate & Private Events</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 900, color: '#fff', margin: '0 0 18px', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>Your Event, on the Big Screen</h1>
          <p style={{ color: textLight, fontSize: '1.15rem', maxWidth: 680, margin: '0 auto 30px', lineHeight: 1.65 }}>
            Rent a private auditorium at Lighthouse Cinema for corporate events, screenings, product launches, and luxury brand experiences in Pacific Grove — up to 200 guests, with catering, bar service, custom branding, and full AV.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#inquire" style={{ background: gold, color: '#000', padding: '15px 36px', borderRadius: 10, fontWeight: 800, textDecoration: 'none', fontSize: '1.05rem' }}>Request a Proposal</a>
            <a href={'tel:+18312416617'} style={{ color: '#fff', padding: '15px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', border: '1px solid ' + gold }}>Call {PHONE}</a>
          </div>
        </div>
      </section>

      {/* EVENT TYPES */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px' }}>Every Kind of Event</h2>
        <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 34px' }}>One venue, endless occasions — all in cinema quality.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {EVENT_TYPES.map(([t, d]) => <Card key={t} title={t} desc={d} />)}
        </div>
      </section>

      {/* AMENITIES */}
      <section style={{ background: darkBg, borderTop: '1px solid ' + darkBorder, borderBottom: '1px solid ' + darkBorder, marginTop: 40 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '60px 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px' }}>Everything Included, Nothing to Worry About</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 34px' }}>A white-glove experience from first hello to final credits.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {AMENITIES.map(([t, d]) => <Card key={t} title={t} desc={d} />)}
          </div>
        </div>
      </section>

      {/* PACKAGES / PRICING */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px' }}>Transparent Packages</h2>
        <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 34px' }}>Starting rates by event type. Longer time blocks and add-ons are quoted in your proposal.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
          {PACKAGES.map(([name, price, per, desc]) => (
            <div key={name} style={{ background: darkCard, border: '1px solid ' + gold, borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{name}</div>
              <div style={{ color: gold, fontWeight: 900, fontSize: '2rem', margin: '8px 0 0' }}>{price}</div>
              <div style={{ color: textMuted, fontSize: '0.85rem', marginBottom: 12 }}>{per}</div>
              <p style={{ color: textLight, fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: textMuted, fontSize: '0.85rem', marginTop: 18 }}>Add-ons available: custom decor, DJ/sound, photographer, and per-guest food &amp; beverage packages. A 10% service fee and 9.25% sales tax apply.</p>
      </section>

      {/* WHAT HAPPENS NEXT */}
      <section style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold, marginTop: 40 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px' }}>What Happens Next</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 34px' }}>No guesswork — here's exactly how it works.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {STEPS.map(([t, d]) => (
              <div key={t} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid ' + darkBorder, borderRadius: 12, padding: '20px 18px' }}>
                <div style={{ color: gold, fontWeight: 800, marginBottom: 6 }}>{t}</div>
                <p style={{ color: textLight, fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section id="inquire" style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 20px', scrollMarginTop: 80 }}>
        <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 8px' }}>Request Your Proposal</h2>
        <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 28px' }}>Tell us what you're planning. We'll send tailored pricing within one business day.</p>
        <CorporateForm />
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 24px' }}>
        <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 24px' }}>Frequently Asked Questions</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
            <summary style={{ padding: '16px 20px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#ddd', listStyle: 'none' }}>{q}</summary>
            <div style={{ padding: '0 20px 16px', color: textMuted, fontSize: '0.92rem', lineHeight: 1.6 }}>{a}</div>
          </details>
        ))}
      </section>

      {/* CTA */}
      <section style={{ background: darkBg, borderTop: '1px solid ' + darkBorder, textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '54px 24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 10px' }}>Let's Plan Something Unforgettable</h2>
          <p style={{ color: textLight, margin: '0 0 22px', lineHeight: 1.6 }}>Serving Pacific Grove, Monterey, Carmel, Seaside, and Marina. {ADDRESS}.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#inquire" style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Request a Proposal</a>
            <a href={'tel:+18312416617'} style={{ color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', border: '1px solid ' + gold }}>Call {PHONE}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
