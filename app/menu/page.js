export const metadata = {
  title: 'Menu | Lighthouse Cinema',
  description: 'Food and drinks at Lighthouse Cinema, Pacific Grove. Pizza, hot dogs, wings, nachos, popcorn, and more.',
};

const gold = '#D4AF37';
const goldDark = '#b8942e';
const cream = '#F0E9D7';

const menuCategories = [
  {
    title: 'Pizza',
    subtitle: 'Detroit Deep Dish & Italian Style',
    items: [
      { name: 'Pepperoni Slice', price: '$5', desc: 'Detroit Deep Dish - Crispy, cheesy, loaded', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Margherita Slice', price: '$5', desc: 'Italian - Tomato, Basil, Fresh Mozz', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Supreme Slice', price: '$5', desc: 'Cauliflower Crust - Pepperoni, Sausage', badge: 'GF', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'White Slice', price: '$5', desc: 'Cauliflower - Spinach, Four Cheese', badge: 'GF', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
    ],
  },
  {
    title: 'Mains',
    subtitle: 'Hot Dogs, Wings & Sandwiches',
    items: [
      { name: 'Classic Dog', price: '$8.99', desc: 'All-Beef Frank - Choice of Toppings', img: 'https://images.unsplash.com/photo-1612392062126-22440e0a429e?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Chili Cheese Dog', price: '$9.99', desc: 'House Chili - Melted Cheese - Onions', img: 'https://images.unsplash.com/photo-1619740455993-9d701c55ef6e?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Chicken Wings (5)', price: '$11.95', desc: 'Crispy Fried - Choice of Sauce', img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Spicy Chicken Sandwich', price: '$11.95', desc: 'Crispy Chicken - Spicy Sauce - Pickles', img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
    ],
  },
  {
    title: 'Snacks',
    subtitle: 'Shareables & Sides',
    items: [
      { name: 'Nachos & Cheese', price: '$7.99', desc: 'Tortilla Chips - Warm Melted Cheese', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Mozzarella Sticks', price: '$9.99', desc: 'Hand-Battered - Golden - Marinara', img: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Cheese Quesadilla', price: '$11', desc: 'Grilled Tortilla - Melted Cheese', img: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Tomato Bruschetta', price: '$8.99', desc: 'Toasted Ciabatta - Tomato - Basil', img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
    ],
  },
  {
    title: 'Cinema Classics',
    subtitle: 'Popcorn, Candy & Drinks',
    items: [
      { name: 'Large Popcorn', price: '$8', desc: 'Freshly Popped - Buttery Goodness', img: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Popcorn & Drink Combo', price: '$12', desc: 'Large Popcorn + Any Fountain Drink', badge: 'DEAL', img: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Candy Bar', price: '$4', desc: 'Choose from our selection', img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
      { name: 'Fountain Drink', price: '$5', desc: 'Pepsi, Diet Pepsi, Mt Dew, Lemonade', img: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop', square: 'https://square.link/u/lejOr2Wt' },
    ],
  },
];

export default function MenuPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: cream, fontFamily: "'Inter', sans-serif" }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 20px 24px', background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 60%)' }}>
        <p style={{ color: gold, letterSpacing: 4, fontSize: '0.85rem', marginBottom: 12, textTransform: 'uppercase' }}>
          Lighthouse Cinema
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, margin: 0 }}>
          Our <span style={{ color: gold }}>Menu</span>
        </h1>
        <p style={{ color: 'rgba(240,233,215,0.5)', marginTop: 12, fontSize: '1rem', maxWidth: 500, margin: '12px auto 0' }}>
          Fresh food, made to order. Enjoy in your seat or at our lobby bar.
        </p>
      </section>

      {/* Menu Categories */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        {menuCategories.map((cat) => (
          <section key={cat.title} style={{ marginTop: 48 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
                {cat.title}
              </h2>
              <p style={{ color: gold, fontSize: '0.85rem', letterSpacing: 1, margin: 0 }}>{cat.subtitle}</p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}>
              {cat.items.map((item) => (
                <div key={item.name} style={{
                  background: '#111',
                  border: '1px solid #1e1e1e',
                  borderRadius: 12,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s',
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  {/* Real food photo */}
                  <div style={{
                    height: 180,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {/* Dark gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 60,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    }} />
                  </div>
                  {/* Badge */}
                  {item.badge && (
                    <span style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      background: item.badge === 'DEAL' ? gold : '#2d6a2d',
                      color: item.badge === 'DEAL' ? '#0a0a0a' : '#fff',
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {/* Info */}
                  <div style={{ padding: '14px 14px 16px' }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.05rem',
                      color: cream,
                      margin: '0 0 4px',
                      fontWeight: 700,
                    }}>
                      {item.name}
                    </h3>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.4rem',
                      color: gold,
                      fontWeight: 700,
                      margin: '2px 0 6px',
                    }}>
                      {item.price}
                    </div>
                    <p style={{
                      fontSize: '0.7rem',
                      color: 'rgba(240,233,215,0.45)',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      margin: '0 0 12px',
                      lineHeight: 1.5,
                    }}>
                      {item.desc}
                    </p>
                    <a
                      href={item.square}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, ' + gold + ', #F5D76E)',
                        color: '#0a0a0a',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        letterSpacing: 0.5,
                      }}
                    >
                      Order Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Pre-order CTA */}
        <section style={{
          marginTop: 64,
          padding: '40px 32px',
          background: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: 16,
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#fff', margin: '0 0 8px' }}>
            Skip the Line - Order Ahead
          </h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
            Pre-order your food and drinks and have them ready when you arrive.
          </p>
          <a
            href="https://square.link/u/lejOr2Wt"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, ' + gold + ', #F5D76E)',
              color: '#0a0a0a',
              padding: '14px 36px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '0.95rem',
              textDecoration: 'none',
              letterSpacing: 0.5,
            }}
          >
            Order on Square
          </a>
        </section>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          section > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
