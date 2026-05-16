export const metadata = {
  title: 'Menu | Lighthouse Cinema',
  description: 'Food and drinks at Lighthouse Cinema, Pacific Grove.',
};

const gold = '#D4AF37';
const cream = '#F0E9D7';

const featuredItems = [
  { name: 'Pepperoni Slice', price: '$5', desc: '1 Slice · Detroit Deep Dish', img: '🍕' },
  { name: 'Margherita Slice', price: '$5', desc: '1 Slice · Italian · Tomato · Basil · Mozz', img: '🍕' },
  { name: 'Supreme Slice', price: '$5', desc: '1 Slice · Cauliflower Crust · Pepperoni · Sausage', badge: 'GF', img: '🍕' },
  { name: 'White Slice', price: '$5', desc: '1 Slice · Cauliflower · Spinach · Four Cheese', badge: 'GF', img: '🍕' },
  { name: 'Classic Dog', price: '$8.99', desc: 'All-Beef · Choice of Toppings', img: '🌭' },
  { name: 'Chili Cheese Dog', price: '$9.99', desc: 'House Chili · Cheese · Onions', img: '🌭' },
  { name: 'Chicken Wings (5)', price: '$11.95', desc: 'Crispy · Choice of Sauce', img: '🍗' },
  { name: 'Cheese Quesadilla', price: '$11', desc: 'Grilled Tortilla · Melted Cheese · Golden Crisp', img: '🧀' },
  { name: 'Spicy Chicken Sandwich', price: '$11.95', desc: 'Crispy Chicken · Spicy Sauce · Pickles', img: '🍔' },
  { name: 'Nachos & Cheese', price: '$7.99', desc: 'Tortilla Chips · Warm Melted Cheese', img: '🫔' },
  { name: 'Mozzarella Sticks', price: '$9.99', desc: 'Hand-Battered · Golden · Marinara', img: '🧀' },
  { name: 'Tomato Bruschetta', price: '$8.99', desc: 'Toasted Ciabatta · Tomato · Basil · Parm', img: '🍅' },
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

      {/* Featured Items Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}>
          {featuredItems.map((item) => (
            <div key={item.name} style={{
              background: 'linear-gradient(180deg, rgba(30,25,15,0.9) 0%, rgba(15,12,8,0.95) 100%)',
              border: '2px solid rgba(212,175,55,0.3)',
              borderRadius: 12,
              overflow: 'hidden',
              textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s',
              position: 'relative',
            }}>
              {/* Image placeholder area */}
              <div style={{
                height: 160,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(30,25,15,0.6) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
              }}>
                {item.img}
              </div>
              {/* Badge */}
              {item.badge && (
                <span style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: '#2d6a2d',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: 1,
                }}>
                  {item.badge}
                </span>
              )}
              {/* Info */}
              <div style={{ padding: '16px 12px 20px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.15rem',
                  color: cream,
                  margin: '0 0 6px',
                  fontWeight: 700,
                }}>
                  {item.name}
                </h3>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.6rem',
                  color: gold,
                  fontWeight: 700,
                  margin: '4px 0 8px',
                }}>
                  {item.price}
                </div>
                <p style={{
                  fontSize: '0.7rem',
                  color: 'rgba(240,233,215,0.45)',
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          section > div > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          section > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
