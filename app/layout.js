import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';
import PayItForward from './PayItForward';
import MobileNav from './MobileNav';

export const metadata = {
  title: 'Lighthouse Cinema | Pacific Grove',
  description: 'Book events, screenings, and experiences at Lighthouse Cinema \u2014 Pacific Grove\'s premier entertainment destination.',
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
              <span className="logo-light">Lighthouse</span>{' '}
              <span className="logo-cinema">Cinema</span>
            </a>
            <MobileNav />
          </div>
        </header>

        <main id="main">
          {children}
        </main>
          <PayItForward />

        <footer className="site-footer">
          <div className="footer-inner">
            <p>&copy; {new Date().getFullYear()} Lighthouse Cinema, Pacific Grove. All rights reserved.</p>
          </div>
        
            <a href="/staff.html" style={{color: '#666', fontSize: '12px', textDecoration: 'none'}}>Staff Portal</a>
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

        {/* Floating Text Us button - messages go to Square Messages via SMS */}
        <a
          href="sms:+18334414049"
          className="square-msg-fab"
          aria-label="Text us on your phone"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 60, height: 60, borderRadius: '50%',
            background: '#d4af37', color: '#0a0a0a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            textDecoration: 'none', fontSize: 28,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </a>
      <Analytics />
        </body>
    </html>
  );
}
