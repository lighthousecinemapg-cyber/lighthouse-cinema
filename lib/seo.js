// ================================================================
// LIGHTHOUSE CINEMA â SEO & SCHEMA MARKUP GENERATOR
// JSON-LD for events, movies, offers, local business
// Meta tags for every page
// ================================================================

import { GBP_CONFIG } from './gbp/config.js';

// ================================================================
// LOCAL BUSINESS SCHEMA (homepage)
// ================================================================

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovieTheater',
    name: 'Lighthouse Cinema',
    alternateName: 'Lighthouse Cinema Pacific Grove',
    description: 'Pacific Grove\'s premier boutique cinema â screenings, events, private rentals, and gourmet dining on the Monterey Peninsula.',
    url: 'https://lighthousecinemapg.com',
    telephone: '+18317173124',
    email: 'lighthousecinemapg@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '525 Lighthouse Ave',
      addressLocality: 'Pacific Grove',
      addressRegion: 'CA',
      postalCode: '93950',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.6177,
      longitude: -121.9166,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '16:00', closes: '23:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '12:00', closes: '23:00' },
    ],
    priceRange: '$$',
    image: 'https://lighthousecinemapg.com/images/cinema-exterior.jpg',
    sameAs: [
      'https://facebook.com/lighthousecinema4',
      'https://instagram.com/lighthousecinemas4',
      'https://tiktok.com/@lighthousecinema',
    ],
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Indoor Seating', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Full Bar', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Gourmet Food', value: true },
    ],
    hasMenu: 'https://lighthousecinemapg.com/#dining',
    acceptsReservations: true,
    paymentAccepted: 'Cash, Credit Card, Square',
    currenciesAccepted: 'USD',
  };
}

// ================================================================
// EVENT SCHEMA (for each screening/event)
// ================================================================

export function generateEventSchema(event) {
  const startDateTime = `${event.date}T${event.time}:00-07:00`; // PST
  const endHour = parseInt(event.time.split(':')[0]) + 2;
  const endDateTime = `${event.date}T${String(endHour).padStart(2, '0')}:${event.time.split(':')[1]}:00-07:00`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ScreeningEvent',
    name: event.title,
    description: event.description || `${event.title} at Lighthouse Cinema in Pacific Grove, CA`,
    startDate: startDateTime,
    endDate: endDateTime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'MovieTheater',
      name: 'Lighthouse Cinema',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '525 Lighthouse Ave',
        addressLocality: 'Pacific Grove',
        addressRegion: 'CA',
        postalCode: '93950',
      },
    },
    offers: {
      '@type': 'Offer',
      url: `https://lighthousecinemapg.com/events/${event.id}`,
      price: event.ticketPrice,
      priceCurrency: 'USD',
      availability: event.bookedSeats < event.totalSeats
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      validFrom: new Date().toISOString(),
    },
    performer: {
      '@type': 'Organization',
      name: 'Lighthouse Cinema',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Lighthouse Cinema',
      url: 'https://lighthousecinemapg.com',
    },
    image: event.image || 'https://lighthousecinemapg.com/images/event-default.jpg',
  };
}

// ================================================================
// OFFER SCHEMA (for promotions)
// ================================================================

export function generateOfferSchema(offer) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.title,
    description: offer.description,
    url: 'https://lighthousecinemapg.com',
    price: offer.price || 0,
    priceCurrency: 'USD',
    eligibleRegion: {
      '@type': 'Place',
      name: 'Pacific Grove, CA',
    },
    seller: {
      '@type': 'MovieTheater',
      name: 'Lighthouse Cinema',
    },
    validFrom: offer.startDate || new Date().toISOString(),
    validThrough: offer.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
  };
}

// ================================================================
// META TAGS GENERATOR
// ================================================================

export function generatePageMeta(page, data = {}) {
  const base = {
    siteName: 'Lighthouse Cinema | Pacific Grove, CA',
    baseUrl: 'https://lighthousecinemapg.com',
    defaultImage: 'https://lighthousecinemapg.com/images/og-default.jpg',
  };

  const pages = {
    home: {
      title: 'Lighthouse Cinema | Movies, Events & Private Screenings in Pacific Grove, CA',
      description: 'Pacific Grove\'s boutique cinema experience. Screenings, live events, private rentals, gourmet dining, and craft cocktails on Monterey Peninsula. Book online today!',
      keywords: 'Pacific Grove cinema, Monterey movie theater, date night Pacific Grove, private screening Monterey, family cinema PG, Lighthouse Cinema',
    },
    event: {
      title: `${data.title || 'Event'} | Lighthouse Cinema Pacific Grove`,
      description: `${data.title || 'Event'} at Lighthouse Cinema â ${data.date || 'coming soon'}. Book tickets online for Pacific Grove's premier cinema experience.`,
      keywords: `${data.title || ''}, Pacific Grove cinema events, Monterey movie nights, Lighthouse Cinema tickets`,
    },
    checkout: {
      title: 'Checkout | Lighthouse Cinema Pacific Grove',
      description: 'Complete your booking at Lighthouse Cinema. Secure payment via Square. 20% deposit, remaining balance invoiced.',
      keywords: 'Lighthouse Cinema booking, Pacific Grove cinema tickets, Monterey movie tickets online',
    },
    admin: {
      title: 'Admin Dashboard | Lighthouse Cinema',
      description: 'Manage events, bookings, and revenue for Lighthouse Cinema.',
      keywords: '',
    },
  };

  const meta = pages[page] || pages.home;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${base.baseUrl}${data.path || '/'}`,
      siteName: base.siteName,
      images: [{ url: data.image || base.defaultImage, width: 1200, height: 630 }],
      locale: 'en_US',
      type: page === 'event' ? 'event' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [data.image || base.defaultImage],
    },
    alternates: {
      canonical: `${base.baseUrl}${data.path || '/'}`,
    },
  };
}

// ================================================================
// FAQ SCHEMA (for homepage)
// ================================================================

export function generateFAQSchema() {
  const faqs = [
    { q: 'Where is Lighthouse Cinema located?', a: 'We are at 525 Lighthouse Ave, Pacific Grove, CA 93950 â right on the Monterey Peninsula.' },
    { q: 'How do I book tickets?', a: 'Visit lighthousecinemapg.com, browse events, select your tickets, and pay a 20% deposit online via Square. The remaining balance is invoiced.' },
    { q: 'Do you offer private screenings?', a: 'Yes! Our VIP Private Screening package includes the full 140-seat auditorium for $2,500. Perfect for corporate events, birthdays, and film premieres.' },
    { q: 'Is Lighthouse Cinema wheelchair accessible?', a: 'Absolutely. Our facility is fully ADA compliant with wheelchair-accessible seating, restrooms, and entrances.' },
    { q: 'Do you serve food and drinks?', a: 'Yes! We offer gourmet crepes, comfort food, craft cocktails, local wines, and artisan beers. Full dining menu available during screenings.' },
    { q: 'What is your cancellation policy?', a: 'The 20% deposit is non-refundable. The remaining balance invoice can be adjusted up to 48 hours before the event by contacting us.' },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}
