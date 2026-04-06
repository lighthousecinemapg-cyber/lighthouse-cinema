import './globals.css';

export const metadata = {
  title: 'Lighthouse Cinema | Pacific Grove',
  description: 'Book events, screenings, and experiences at Lighthouse Cinema â Pacific Grove\'s premier entertainment destination.',
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
              <a href="/">Events</a>
              <a href="/checkout">Cart</a>
              <a href="/admin">Admin</a>
              <a href="/admin/gbp">GBP AI</a>
              <a
                href="https://messages.squareup.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold btn-sm"
              >
                Message Us
              </a>
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
            </p>
          </div>
        </footer>

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
