import './globals.css';

export const metadata = {
  title: 'Lighthouse Cinema | Pacific Grove',
  description: 'Book events, screenings, and experiences at Lighthouse Cinema — Pacific Grove\'s premier entertainment destination.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main" className="skip-nav">Skip to main content</a>

        <header className="site-header">
          <div className="header-inner">
            <a href="/" className="site-logo">
              Lighthouse <span>Cinema</span>
            </a>
            <nav className="header-nav" aria-label="Main navigation">
              <a href="/events">Events</a>
              <a href="/menu.html">Menu</a>
              <a href="/private-events">Private Events</a>
              <a href="/vip">VIP Club</a>
              <a href="/contact">Contact</a>
              <a href="/checkout" aria-label="Cart">Cart</a>
              <button type="button" onClick={() => { if (typeof window !== "undefined" && window.Tawk_API) window.Tawk_API.maximize(); else window.location.href="/contact"; }} className="btn btn-gold btn-sm">Message Us</button>
            </nav>
          </div>
        </header>

        <main id="main">
          {children}
        </main>

        <footer className="site-footer">
          <div className="container">
            <p style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', marginBottom: '8px' }}>
              Lighthouse Cinema
            </p>
            <p>525 Lighthouse Ave, Pacific Grove, CA 93950</p>
            <p>(831) 717-3124 &middot; lighthousecinemapg@gmail.com</p>
            <p style={{ marginTop: '16px' }}>
              <a href="https://facebook.com/lighthousecinema4" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>Facebook</a>
              &middot;
              <a href="https://instagram.com/lighthousecinemas4" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>Instagram</a>
              &middot;
              <a href="https://tiktok.com/@lighthousecinema" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>TikTok</a>
              &middot;
              <a href="https://youtube.com/@lighthousecinema" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>YouTube</a>
              &middot;
              <a href="https://nextdoor.com" target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>Nextdoor</a>
            </p>
          </div>
        </footer>

        {/* Sticky mobile Book Now CTA */}
        <a href="/events" className="mobile-sticky-cta" aria-label="Book Now">🎬 Book Now</a>

        {/* UserWay accessibility widget — small icon, no auto-open */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(d){var s=d.createElement("script");
              s.setAttribute("data-position","4");
              s.setAttribute("data-size","small");
              s.setAttribute("data-account","LIGHTHOUSEPG");
              s.setAttribute("src","https://cdn.userway.org/widget.js");
              (d.body||d.head).appendChild(s);})(document);
            `,
          }}
        />

        {/* Tawk.to Live Chat */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/69d218ee5b6b4c1c37f3d6ec/1jleb2p15';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
