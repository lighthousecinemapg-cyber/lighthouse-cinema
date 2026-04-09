import './globals.css';
import Script from 'next/script';

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
            <a href="/" className="logo">
              <em>Lighthouse</em> Cinema
            </a>
            <nav className="main-nav" aria-label="Main navigation">
              <a href="/events">Events</a>
              <a href="/menu">Menu</a>
              <a href="/private-events">Private Events</a>
              <a href="/vip">VIP Club</a>
              <a href="/contact">Contact</a>
              <a href="/checkout" aria-label="Cart">Cart</a>
              <a href="/contact" className="btn btn-gold btn-sm btn-tawk-open">Message Us</a>
            </nav>
          </div>
        </header>

        <main id="main">
          {children}
        </main>

        <footer className="site-footer">
          <div className="footer-inner">
            <p>&copy; {new Date().getFullYear()} Lighthouse Cinema, Pacific Grove. All rights reserved.</p>
          </div>
        </footer>

        <div className="mobile-sticky-cta">
          <a href="/events" className="btn btn-gold">Book Now</a>
        </div>

        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="LIGHTHOUSEPG"
          data-size="small"
          data-position="4"
          strategy="afterInteractive"
        />

        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/69d218ee5b6b4c1c37f3d6ec/1jleb2p15';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>

        <Script id="tawk-msg-handler" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              var link = e.target.closest('.btn-tawk-open');
              if (link) {
                e.preventDefault();
                if (window.Tawk_API && window.Tawk_API.maximize) {
                  window.Tawk_API.maximize();
                } else {
                  window.location.href = '/contact';
                }
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
