export const metadata = {
  title: 'Menu | Lighthouse Cinema',
  description: 'Food and drinks at Lighthouse Cinema, Pacific Grove.',
};

const gold = '#D4AF37';
const cream = '#F0E9D7';

const menuData = [
  {
    category: 'Nachos',
    items: [
      { name: 'Classic Nacho Tray', price: 13 },
      { name: "Director's Cut Nachos", desc: 'chicken', price: 22 },
    ],
  },
  {
    category: 'Quesadillas',
    items: [
      { name: 'Chicken Cheese Quesadilla', price: 17 },
      { name: 'Classic Cheese Quesadilla', price: 13 },
    ],
  },
  {
    category: 'Fries',
    items: [
      { name: 'Classic Fries', price: 9 },
      { name: 'Garlic Parmesan Fries', price: 14 },
      { name: 'Loaded Fries', price: 16 },
    ],
  },
  {
    category: 'Hot Dogs',
    items: [
      { name: 'Marquee Classic', price: 12 },
      { name: 'The Director', desc: 'nacho cheese, pico, jalape\u00F1o', price: 16 },
      { name: 'Red Carpet BBQ Bacon', price: 16 },
      { name: 'The Blockbuster', desc: 'chili, nacho cheese', price: 16 },
    ],
  },
  {
    category: 'Pizza',
    items: [
      { name: 'Margherita', price: 20 },
      { name: 'Pepperoni', price: 23 },
      { name: 'Chicken Pesto Mozzarella', price: 23 },
    ],
  },
  {
    category: 'Burgers',
    items: [
      { name: 'Classic Cheeseburger & Fries', price: 19 },
    ],
  },
  {
    category: 'Wings',
    items: [
      { name: 'Buffalo Wings', price: 19 },
      { name: 'Honey BBQ Wings', price: 19 },
      { name: 'Mango Habanero Wings', price: 19 },
    ],
  },
  {
    category: 'Sides',
    items: [
      { name: 'Hummus & Pitta', price: 12 },
    ],
  },
];

export default function MenuPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: cream, fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
        <p style={{ color: gold, letterSpacing: 4, fontSize: '0.85rem', marginBottom: 12, textTransform: 'uppercase' }}>
          Lighthouse Cinema
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, margin: 0 }}>
          Our <span style={{ color: gold }}>Menu</span>
        </h1>
        <p style={{ color: 'rgba(240,233,215,0.5)', marginTop: 12, fontSize: '1rem' }}>
          Fresh food, made to order. Enjoy in your seat or at our lobby bar.
        </p>
      </section>

      {/* Menu Grid */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
          {menuData.map((section) => (
            <div key={section.category} style={{
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 16,
              padding: '28px 24px',
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.4rem',
                color: gold,
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '1px solid rgba(212,175,55,0.2)',
              }}>
                {section.category}
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.items.map((item) => (
                  <li key={item.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(240,233,215,0.06)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</span>
                      {item.desc && (
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,233,215,0.45)', marginTop: 2 }}>
                          {item.desc}
                        </span>
                      )}
                    </div>
                    <span style={{ color: gold, fontWeight: 700, fontSize: '1rem', marginLeft: 16, whiteSpace: 'nowrap' }}>
                      ${item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
