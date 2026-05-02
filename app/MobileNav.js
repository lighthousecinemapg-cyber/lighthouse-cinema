'use client';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/events', label: 'Events' },
  { href: '/menu', label: 'Menu' },
  { href: '/private-events', label: 'Private Events' },
  { href: '/vip', label: 'VIP Club' },
  { href: '/contact', label: 'Contact' },
  { href: '/checkout', label: 'Cart' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Desktop nav - hidden on mobile via CSS */}
      <nav className="header-nav desktop-nav">
        <a href="/events">Events</a>
        <a href="/menu">Menu</a>
        <a href="/private-events">Private Events</a>
        <a href="/vip">VIP Club</a>
        <a href="/contact">Contact</a>
        <a href="/checkout">Cart</a>
        <a href="sms:+18334414049" className="btn btn-gold btn-sm">Message Us</a>
      </nav>

      {/* Hamburger button - visible only on mobile */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Mobile overlay menu */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <nav
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Lighthouse Cinema</span>
              <button
                className="mobile-menu-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                \u2715
              </button>
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="mobile-menu-link"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="sms:+18334414049"
              className="btn btn-gold mobile-menu-cta"
              onClick={() => setIsOpen(false)}
            >
              Message Us
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
