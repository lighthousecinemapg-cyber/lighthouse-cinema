// app/gift-cards/page.js  ->  lighthousepgcinema.com/gift-cards
// SEO + conversion landing page for Lighthouse Cinema gift cards.

export const metadata = {
  title: 'Gift Cards — Lighthouse Cinema Pacific Grove | The Perfect Movie Lover Gift',
  description: 'Give the gift of the movies. Lighthouse Cinema gift cards are redeemable for tickets, concessions, and events in Pacific Grove. Choose any amount — perfect for birthdays, holidays, teachers, and thank-yous. Serving Monterey, Carmel, Seaside & Marina.',
};

const gold = '#d4af37';
const black = '#0a0a0a';
const darkBg = '#111111';
const darkCard = '#1a1a1a';
const darkBorder = '#2a2a2a';
const textLight = '#e0e0e0';
const textMuted = '#888888';
const BUY = 'https://square.link/u/PicBQip5';

function Card({ title, desc }) {
  return (
    <div style={{ background: darkCard, border: '1px solid ' + darkBorder, borderRadius: 12, padding: '22px 20px' }}>
      <h3 style={{ color: gold, fontSize: '1.05rem', fontWeight: 700, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: textLight, fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default function GiftCardsPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1400 60%, #0a0a0a 100%)', borderBottom: '2px solid ' + gold, padding: '64px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ color: gold, letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: 12 }}>Lighthouse Cinema Gift Cards</div>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.4rem)', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>The Perfect Gift for Movie Lovers</h1>
          <p style={{ color: textLight, fontSize: '1.1rem', maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>Give the magic of the movies. A Lighthouse Cinema gift card is good for tickets, popcorn, and unforgettable nights out in Pacific Grove. Choose any amount.</p>
          <a href={BUY} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '15px 38px', borderRadius: 8, fontWeight: 800, textDecoration: 'none', fontSize: '1.1rem', display: 'inline-block' }}>Buy a Gift Card</a>
        </div>
      </section>

      {/* PERFECT FOR */}
      <section style={{ background: black, padding: '56px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px' }}>Perfect for Every Occasion</h2>
          <p style={{ textAlign: 'center', color: textMuted, margin: '0 0 36px' }}>One gift everyone loves — a night at the movies.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            <Card title="Birthdays" desc="A gift that turns into a celebration on the big screen." />
            <Card title="Holidays" desc="Easy, thoughtful, and always the right size." />
            <Card title="Teachers & Thank-Yous" desc="Show appreciation with a night out they'll enjoy." />
            <Card title="Families & Friends" desc="Treat the people you love to a movie day together." />
            <Card title="Date Nights" desc="The classic night out — dinner optional, movie essential." />
            <Card title="Just Because" desc="A small surprise that brightens anyone's week." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: darkBg, padding: '56px 0', borderTop: '1px solid ' + darkBorder }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ color: gold, fontSize: '1.8rem', fontWeight: 800, margin: '0 0 14px' }}>How It Works</h2>
          <p style={{ color: textLight, margin: '0 0 22px', lineHeight: 1.7 }}>Choose your amount and purchase securely online. Your gift card can be redeemed for movie tickets, concessions, and events at Lighthouse Cinema in Pacific Grove. Simple to give, easy to use.</p>
          <a href={BUY} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '13px 32px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Choose an Amount & Buy</a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', padding: '52px 0', borderTop: '2px solid ' + gold, borderBottom: '2px solid ' + gold, textAlign: 'center' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px' }}>Give the Gift of the Movies</h2>
          <p style={{ color: textLight, margin: '0 0 24px', lineHeight: 1.6 }}>A Lighthouse Cinema gift card is always the right choice. Pacific Grove's neighborhood cinema — serving Monterey, Carmel, Seaside, and Marina.</p>
          <a href={BUY} target="_blank" rel="noopener noreferrer" style={{ background: gold, color: '#000', padding: '14px 34px', borderRadius: 8, fontWeight: 800, textDecoration: 'none' }}>Buy a Gift Card</a>
        </div>
      </section>
    </div>
  );
}
