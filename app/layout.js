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
          <div style={{display:'flex',justifyContent:'center',gap:'24px',marginBottom:'16px'}}>
          <a href="https://www.facebook.com/lighthousecinema4/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{color:'#D4AF37',fontSize:'28px',textDecoration:'none',transition:'opacity 0.2s'}} onMouseOver={(e)=>e.currentTarget.style.opacity='0.7'} onMouseOut={(e)=>e.currentTarget.style.opacity='1'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/lighthousecinemas4/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{color:'#D4AF37',fontSize:'28px',textDecoration:'none',transition:'opacity 0.2s'}} onMouseOver={(e)=>e.currentTarget.style.opacity='0.7'} onMouseOut={(e)=>e.currentTarget.style.opacity='1'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@lighthousecinemas4" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{color:'#D4AF37',fontSize:'28px',textDecoration:'none',transition:'opacity 0.2s'}} onMouseOver={(e)=>e.currentTarget.style.opacity='0.7'} onMouseOut={(e)=>e.currentTarget.style.opacity='1'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
          <a href="https://www.yelp.com/biz/lighthouse-cinemas-pacific-grove" target="_blank" rel="noopener noreferrer" aria-label="Yelp" style={{color:'#D4AF37',fontSize:'28px',textDecoration:'none',transition:'opacity 0.2s'}} onMouseOver={(e)=>e.currentTarget.style.opacity='0.7'} onMouseOut={(e)=>e.currentTarget.style.opacity='1'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 011.596-.206 9.194 9.194 0 012.364 3.252 1.073 1.073 0 01-.694 1.459zm-3.005 5.69a1.073 1.073 0 01-1.612.145 9.18 9.18 0 01-2.603-3.111 1.073 1.073 0 01.613-1.487l4.916-1.664c.94-.318 1.778.724 1.264 1.574l-2.578 4.543zm-5.282.573c.026 1.002-1.078 1.59-1.67.89l-3.056-3.644a1.073 1.073 0 01.253-1.626 9.18 9.18 0 013.737-1.477 1.073 1.073 0 011.186 1.06l-.45 4.797zM7.57 11.21c-.692.727-1.82.216-1.704-.77l.6-5.118a1.073 1.073 0 011.024-.94 9.16 9.16 0 013.998.85 1.073 1.073 0 01.332 1.656L7.57 11.21zm3.92-3.16c.386.89-.37 1.842-1.341 1.686L5.086 8.863a1.073 1.073 0 01-.822-1.3 9.176 9.176 0 012.3-4.14 1.073 1.073 0 011.63.08l3.296 4.547z"/></svg>
          </a>
        </div>
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
