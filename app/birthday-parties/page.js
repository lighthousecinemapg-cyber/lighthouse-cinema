// app/birthday-parties/page.js  -> lighthousepgcinema.com/birthday-parties
// SEO landing page that funnels to the existing /private-events booking flow.
// All package details mirror the real Birthday Party package in app/private-events/page.js.

export const metadata = {
  title: 'Birthday Parties at Lighthouse Cinema — Private Movie Party Venue in Pacific Grove',
  description: 'Throw an unforgettable birthday party at Lighthouse Cinema in Pacific Grove. Rent a private auditorium, pick any movie, and add pizza, a candy bar, and more. Packages from $350. Serving Monterey, Carmel, Seaside & Marina.',
};

const gold = '#d4af37';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';
const BOOK = '/private-events';
const PHONE_DISPLAY = '(831) 241-6617';
const PHONE_TEL = 'tel:+18312416617';

function Card({ title, desc }) {
  return (
    <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: '22px 20px' }}>
      <h3 style={{ color: gold, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: textLight, fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default function BirthdayPartiesPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1400 60%, #0a0a0a 100%)', borderBottom: '2px solid ' + gold, padding: '64px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ color: gold, letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 12 }}>Private Parties at Lighthouse Cinema</div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>An Unforgettable Birthday at the Movies</h1>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: gold, fontWeight: 700, margin: '0 0 10px' }}>Your own private auditorium. Any movie you want. The big screen, all to your crew.</p>
          <p style={{ color: textLight, fontSize: '1.05rem', maxWidth: 660, margin: '0 auto 28px', lineHeight: 1.6 }}>The most memorable birthday in Pacific Grove — rent a private theater, pick the film, and let us handle the setup, the treats, and the cleanup. Packages from $350.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BOOK} style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1.05rem' }}>Book Your Party</a>
            <a href={PHONE_TEL} style={{ color: '#fff', padding: '14px 34px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem', border: '1px solid ' + gold }}>Call {PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: black, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Why Celebrate at Lighthouse</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 36px' }}>Bigger, easier, and more memorable than a party at home.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <Card title="Private Auditorium" desc="The whole theater is yours — no strangers, just your guests on the big screen." />
            <Card title="Any Movie You Want" desc="Pick the film: a new release, a birthday favorite, or a family classic." />
            <Card title="Dedicated Event Host" desc="A Lighthouse host runs the show so you can relax and enjoy the party." />
            <Card title="Setup & Cleanup Included" desc="We handle the setup and the cleanup. You just show up and celebrate." />
            <Card title="Treats & Catering Add-Ons" desc="Pizza, a candy bar, a popcorn tower, crepes, chicken tenders, and more." />
            <Card title="Flexible Time Slots" desc="Afternoon and evening blocks of 3, 6, or 9 hours to fit your celebration." />
          </div>
        </div>
      </section>

      {/* PACKAGE */}
      <section style={{ background: darkBg, padding: '56px 0', borderTop: '1px solid ' + darkBorder }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ color: gold, fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px' }}>The Birthday Party Package</h2>
          <p style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 6px' }}>From $350 + $18 per guest</p>
          <p style={{ color: textLight, margin: '0 0 22px', lineHeight: 1.6 }}>Every birthday package includes your private auditorium, the movie of your choice, full party setup and cleanup, and a dedicated event host. Add catering and extras to make it yours.</p>
          <a href={BOOK} style={{ background: gold, color: '#000', padding: '12px 30px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>See Packages & Book</a>
        </div>
      </section>

      {/* ADD-ONS */}
      <section style={{ background: black, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Make It a Feast</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 36px' }}>Popular add-ons for birthday parties.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <Card title="Pizza Party" desc="Crowd-pleasing pizza for the whole group." />
            <Card title="Candy Bar" desc="A colorful candy spread the kids will love." />
            <Card title="Popcorn Tower" desc="A showstopping tower of fresh movie popcorn." />
            <Card title="Crepe Bar" desc="Made-to-order crepes for a sweet treat." />
            <Card title="Chicken Tenders & Nachos" desc="Hearty crowd favorites to round out the menu." />
            <Card title="Custom Decor & More" desc="Decor, photographer, and DJ / sound add-ons available." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', padding: '56px 0', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold, textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 10px' }}>Ready to Plan the Party?</h2>
          <p style={{ color: textLight, margin: '0 0 24px', lineHeight: 1.6 }}>Book online in minutes, or call us and we'll build the perfect celebration. Please book at least 48 hours ahead. Serving Pacific Grove, Monterey, Carmel, Seaside, and Marina.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={BOOK} style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Book Your Birthday Party</a>
            <a href={PHONE_TEL} style={{ color: '#fff', padding: '14px 34px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', border: '1px solid ' + gold }}>Call {PHONE_DISPLAY}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
