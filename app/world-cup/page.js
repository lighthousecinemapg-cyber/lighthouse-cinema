
export const metadata = {
  title: 'World Cup at Lighthouse Cinema - Pacific Grove Watch Party | Monterey County',
  description: 'Watch the World Cup on the biggest screen in town at Lighthouse Cinema in Pacific Grove. Stadium atmosphere, surround sound, food and drink packages, and group watch parties - the premier World Cup watch party destination in Monterey County.',
};

const gold = '#d4af37';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';
const TICKETS = 'https://square.link/u/YqvdJLdp';

function Card({ title, desc }) {
  return (
    <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: '22px 20px' }}>
      <h3 style={{ color: gold, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: textLight, fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default function WorldCupPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1400 60%, #0a0a0a 100%)', borderBottom: '2px solid ' + gold, padding: '64px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ color: gold, letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 12 }}>Live at Lighthouse Cinema</div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>World Cup at Lighthouse Cinema</h1>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: gold, fontWeight: 700, margin: '0 0 10px' }}>The Best Place Outside the Stadium</p>
          <p style={{ color: textLight, fontSize: '1.05rem', maxWidth: 660, margin: '0 auto 28px', lineHeight: 1.6 }}>Watch every goal on the biggest screen in town, with stadium surround sound and a crowd of fellow fans. Experience the World Cup together in Pacific Grove.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={TICKETS} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1.05rem' }}>Buy Tickets</a>
            <a href="/private-events" style={{ color: '#fff', padding: '14px 34px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem', border: '1px solid ' + gold }}>Reserve a Group / Private Party</a>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section style={{ background: black, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Watch Every Goal With Fellow Fans</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 36px' }}>Bigger than watching at home.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <Card title="Biggest Screen in Town" desc="Every goal, larger than life on the big screen." />
            <Card title="Stadium Surround Sound" desc="Feel the roar of the crowd in immersive sound." />
            <Card title="Family Friendly" desc="All ages welcome - bring the whole family." />
            <Card title="Comfortable Seating" desc="Relax in comfort for every minute of the match." />
            <Card title="Full Concessions" desc="Popcorn, drinks, snacks, and game-day combos." />
            <Card title="Community of Fans" desc="Celebrate every moment together, side by side." />
          </div>
        </div>
      </section>

      {/* MATCH SCHEDULE */}
      <section style={{ background: darkBg, padding: '56px 0', borderTop: '1px solid ' + darkBorder }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ color: gold, fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px' }}>Match Schedule</h2>
          <p style={{ color: textLight, margin: '0 0 22px', lineHeight: 1.6 }}>We screen all the biggest matches live. Reserve your seat early - watch parties fill fast. Call or text us for the full match lineup and kickoff times.</p>
          <a href={TICKETS} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '12px 30px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Reserve Your Seat</a>
        </div>
      </section>

      {/* FOOD PACKAGES */}
      <section style={{ background: black, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Game-Day Food and Drink Packages</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 36px' }}>Fuel the match. Available at the concession stand.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <Card title="World Cup Combo" desc="Popcorn + fountain drink. The match-day essential." />
            <Card title="Family Package" desc="Popcorn, drinks, and snacks to share with the family." />
            <Card title="Team Spirit Package" desc="Snacks and drinks to keep the whole squad cheering." />
            <Card title="Group Watch Party Package" desc="Custom catering for your group block or private party." />
          </div>
        </div>
      </section>

      {/* GROUP / PRIVATE */}
      <section style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', padding: '56px 0', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold, textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: 800, margin: '0 0 10px' }}>Bring Your Whole Crew</h2>
          <p style={{ color: textLight, margin: '0 0 24px', lineHeight: 1.6 }}>Soccer clubs, youth teams, families, and fan groups - book a group block or a private watch party and make it a day to remember. Team packages available.</p>
          <a href="/private-events" style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Inquire About Group and Private Parties</a>
        </div>
      </section>
    </div>
  );
}
