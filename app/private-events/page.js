export const metadata = {
  title: 'Private Events | Lighthouse Cinema',
  description: 'Host your next private event at Lighthouse Cinema & Event Center in Pacific Grove. Birthday parties, corporate events, weddings, screenings & more.',
};

const theaters = [
  { name: 'Theater IV', subtitle: 'The Dining Theater', desc: 'Intimate & refined', seats: 100, rate: 250 },
  { name: 'Theater I', subtitle: 'The Lighthouse Lounge', desc: 'Classic cinema charm', seats: 110, rate: 300 },
  { name: 'Theater II', subtitle: 'The Grand', desc: 'Mid-size flexibility', seats: 155, rate: 400 },
  { name: 'Theater III', subtitle: 'The Banquet Hall', desc: 'Our largest room', seats: 200, rate: 500 },
];

const packages = [
  { name: 'Field Trip', price: 10, unit: 'student', desc: 'Popcorn + Coca-Cola + admission. Free teacher entry 1:10 ratio.', note: 'Mon–Thu only', color: '#4ade80' },
  { name: 'Starter', price: 15, unit: 'person', desc: 'Theater + small popcorn + 1 drink. Budget-friendly fun.', color: '#60a5fa' },
  { name: 'Bronze', price: 20, unit: 'person', desc: 'Theater + popcorn + 1 drink + lobby welcome sign.', color: '#cd7f32' },
  { name: 'Silver', price: 35, unit: 'person', desc: 'Bronze + unlimited soda + snack bar + custom marquee.', badge: 'Most Popular', color: '#c0c0c0' },
  { name: 'Gold', price: 52, unit: 'person', desc: 'Silver + hot food (pizza, hot dogs, crepes) + dedicated coordinator.', color: '#fbbf24' },
  { name: 'Platinum', price: 82, unit: 'person', desc: 'Gold + multi-course dinner + champagne + photographer.', color: '#e2e8f0' },
];

const eventTypes = [
  'Birthday Parties', 'Private Screenings', 'School & Field Trips', 'Corporate Events',
  'Weddings & Receptions', 'Fundraisers & Galas', 'Community & Religious', 'Custom Events'
];

const powerCombos = [
  { name: 'Stadium Pack', price: '$20/guest', desc: 'Great for watch parties & game nights' },
  { name: 'School Combo', price: '$12/student', desc: 'Educational screenings with snacks' },
  { name: 'Birthday Power', price: '$22/kid', desc: 'The ultimate kids birthday package' },
  { name: 'Premiere Night', price: '$34/guest', desc: 'Red carpet experience for your crew' },
];

const concessions = [
  { item: 'Classic Hot Dog', price: '$4/ea' },
  { item: 'Premium Hot Dog', price: '$6/ea' },
  { item: 'Loaded Nachos', price: '$8/ea' },
  { item: 'Chicken Wings (6 pcs)', price: '$9/6pcs' },
  { item: 'Pizza Slice', price: '$4/slice' },
  { item: 'Whole Pizza Pie', price: '$14/pie' },
  { item: 'Soft Pretzel Bites', price: '$5/ea' },
  { item: 'Popcorn Bucket Tower', price: '$32/ea' },
  { item: 'Candy Bar Spread', price: '$5/guest' },
  { item: 'Coca-Cola Case (24)', price: '$45/ea' },
  { item: 'Manasiri Crepe Bar', price: '$13/guest' },
  { item: 'Hosted Beer & Wine Bar (21+)', price: '$16/guest' },
];

const addOns = [
  { item: 'Tableware Rental', price: '$5/guest' },
  { item: 'Premium Tableware', price: '$9/guest' },
  { item: 'Custom Cake Service', price: '$80/ea' },
  { item: 'Decor & Balloon Package', price: '$140/ea' },
  { item: 'Event Photographer', price: '$200/hr' },
  { item: 'DJ + Dance Floor Lighting', price: '$325 flat' },
];

export default function PrivateEventsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 50px', background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}>
        <p style={{ color: '#d4af37', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Lighthouse Cinema & Event Center</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>Private Event Reservations</h1>
        <p style={{ color: '#aaa', fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px' }}>From intimate screenings to grand celebrations — your event, your way.</p>
        <a href="/contact" style={{ display: 'inline-block', background: '#d4af37', color: '#000', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>Request a Quote</a>
      </section>

      {/* Event Types */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Events We Host</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
          {eventTypes.map((t) => (
            <span key={t} style={{ background: '#1a1a2e', border: '1px solid #333', padding: '10px 22px', borderRadius: '30px', fontSize: '15px', color: '#ddd' }}>{t}</span>
          ))}
        </div>
      </section>

      {/* Theaters */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Our Theaters</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>3-hour minimum · Multiple theaters available for larger events</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {theaters.map((t) => (
            <div key={t.name} style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎬</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{t.name}</h3>
              <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{t.subtitle}</p>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>{t.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '14px' }}>
                <span><strong>{t.seats}</strong> <span style={{ color: '#888' }}>seats</span></span>
                <span><strong>${t.rate}</strong><span style={{ color: '#888' }}>/hr</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Day Type Pricing */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>Day Type Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>Weekday</p>
            <p style={{ color: '#888', fontSize: '13px' }}>Mon – Thu</p>
            <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '18px', marginTop: '8px' }}>Base Rate</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>Friday</p>
            <p style={{ color: '#888', fontSize: '13px' }}>Premium day</p>
            <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '18px', marginTop: '8px' }}>+10%</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>Weekend</p>
            <p style={{ color: '#888', fontSize: '13px' }}>Sat & Sun</p>
            <p style={{ color: '#f87171', fontWeight: 700, fontSize: '18px', marginTop: '8px' }}>+15%</p>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Event Packages</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Per person, plus theater rental</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {packages.map((p) => (
            <div key={p.name} style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
              {p.badge && <span style={{ position: 'absolute', top: '14px', right: '14px', background: '#d4af37', color: '#000', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>{p.badge}</span>}
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, marginBottom: '12px' }}></div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</h3>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#d4af37', marginBottom: '4px' }}>${p.price}<span style={{ fontSize: '14px', fontWeight: 400, color: '#888' }}>/{p.unit}</span></p>
              {p.note && <p style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '8px' }}>{p.note}</p>}
              <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Power Combos */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Power Combos</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Pre-built packages for popular event types</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {powerCombos.map((c) => (
            <div key={c.name} style={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{c.name}</h3>
              <p style={{ color: '#d4af37', fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>{c.price}</p>
              <p style={{ color: '#888', fontSize: '13px' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Concession Bar */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Concession Bar À La Carte</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {concessions.map((c) => (
            <div key={c.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderRadius: '10px', padding: '14px 20px' }}>
              <span style={{ fontSize: '15px' }}>{c.item}</span>
              <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', marginLeft: '12px' }}>{c.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Service Add-Ons */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '30px' }}>Service Add-Ons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {addOns.map((a) => (
            <div key={a.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderRadius: '10px', padding: '14px 20px' }}>
              <span style={{ fontSize: '15px' }}>{a.item}</span>
              <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', marginLeft: '12px' }}>{a.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Details */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px 50px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>Pricing Details</h2>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '28px 24px' }}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>Service & Cleaning Fee</span><span style={{ fontWeight: 700 }}>18%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>CA Sales Tax</span><span style={{ fontWeight: 700 }}>9.25%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>Security Deposit (under $5K)</span><span style={{ fontWeight: 700 }}>$500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>Security Deposit ($5K+)</span><span style={{ fontWeight: 700 }}>$1,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <span style={{ color: '#aaa' }}>Reservation Deposit</span><span style={{ fontWeight: 700 }}>25%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa' }}>Full refund if cancelled</span><span style={{ fontWeight: 700 }}>14+ days prior</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '40px 20px 80px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Ready to Plan Your Event?</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>Contact us for availability, custom packages, or to schedule a venue tour.</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/contact" style={{ display: 'inline-block', background: '#d4af37', color: '#000', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>Get a Quote</a>
          <a href="tel:+18313731100" style={{ display: 'inline-block', background: 'transparent', color: '#d4af37', border: '2px solid #d4af37', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }}>Call (831) 373-1100</a>
        </div>
      </section>
    </div>
  );
}
