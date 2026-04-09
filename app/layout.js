import './globals.css';
import Script from 'next/script';

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
