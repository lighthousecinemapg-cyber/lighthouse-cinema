// ================================================================
// LIGHTHOUSE CINEMA â GBP AUTOMATION CONFIG
// CineMax AI: The autonomous marketing director
// ================================================================

export const GBP_CONFIG = {
  // Business identity
  businessName: 'Lighthouse Cinema',
  location: 'Pacific Grove, CA',
  address: '525 Lighthouse Ave, Pacific Grove, CA 93950',
  phone: '(831) 717-3124',
  email: 'lighthousecinemapg@gmail.com',
  website: 'https://lighthousecinemapg.com',
  squareBookingUrl: 'https://lighthousecinema4events.square.site',

  // SEO keywords â injected into every post & reply
  seoKeywords: [
    'Pacific Grove cinema',
    'Monterey movie theater',
    'best date night Pacific Grove',
    'family friendly cinema PG',
    'Lighthouse Cinema PG',
    'movies Monterey Peninsula',
    'cinema Pacific Grove CA',
    'private screening Monterey',
  ],

  // Hashtags
  hashtags: [
    '#LighthouseCinemaPG',
    '#MovieMagic',
    '#PacificGrove',
    '#MontereyBay',
    '#CinemaExperience',
    '#DateNightPG',
    '#IndieFilm',
    '#MovieNight',
    '#SupportLocal',
    '#LighthouseAve',
  ],

  // Brand voice instructions
  brandVoice: `Warm, enthusiastic, and professional. Like a passionate film lover who also happens to be a gracious host. Use "we" for the cinema, "you" for the customer. Emojis: sparingly â ð¬ ð¿ ðï¸ â¨ only. Never robotic. Never generic. Always mention Pacific Grove or Monterey at least once.`,

  // Posting schedule (PST hours)
  postSchedule: [
    { hour: 8,  type: 'morning_greeting',    label: 'Good morning + today\'s first screening' },
    { hour: 10, type: 'photo_update',         label: 'Concession stand / lobby photo' },
    { hour: 12, type: 'lunch_offer',          label: 'Lunchtime discount or combo deal' },
    { hour: 14, type: 'behind_scenes',        label: 'Behind-the-scenes or staff pick' },
    { hour: 16, type: 'trivia',               label: 'Movie trivia or fun fact' },
    { hour: 18, type: 'urgency_cta',          label: 'Last chance for tonight\'s show' },
    { hour: 19, type: 'event_highlight',      label: 'Tonight\'s event spotlight' },
    { hour: 20, type: 'engagement',           label: 'Ask for review or post audience quote' },
    { hour: 21, type: 'tomorrow_preview',     label: 'Sneak peek of tomorrow\'s schedule' },
    { hour: 22, type: 'late_night',           label: 'Late-night offer or midnight screening' },
  ],

  // Review response categories
  reviewCategories: {
    'enthusiastic_5star': {
      stars: [5],
      keywords: ['amazing', 'best', 'love', 'fantastic', 'incredible', 'perfect', 'wonderful'],
      strategy: 'Thank warmly, invite to loyalty program, ask to share a photo of their visit',
    },
    'positive_4star': {
      stars: [4],
      keywords: [],
      strategy: 'Thank sincerely, ask what would make it 5 stars next time',
    },
    'neutral_3star': {
      stars: [3],
      keywords: [],
      strategy: 'Apologize for falling short, offer free popcorn on next visit (coupon code)',
    },
    'negative_2star': {
      stars: [2],
      keywords: ['disappointed', 'bad', 'poor', 'mediocre'],
      strategy: 'Deep apology, request DM details, manager follows up within 1 hour',
    },
    'angry_1star': {
      stars: [1],
      keywords: ['terrible', 'worst', 'awful', 'never', 'disgusting', 'horrible'],
      strategy: 'Immediate escalation: SMS to owner + empathetic reply taking ownership + offer refund/free tickets',
    },
    'suggestion': {
      stars: [3, 4],
      keywords: ['should', 'could', 'wish', 'would be nice', 'suggestion', 'idea'],
      strategy: 'Thank for feedback, "We\'ll discuss in our next team meeting", implement within 48h if feasible',
    },
    'question': {
      stars: [3, 4, 5],
      keywords: ['?', 'what time', 'when', 'where', 'how much', 'do you', 'is there'],
      strategy: 'Answer instantly with link to schedule + ask if they\'d like to book',
    },
    'stars_only': {
      stars: [1, 2, 3, 4, 5],
      keywords: [],
      strategy: 'Reply: "Thanks for the stars! We\'d love to know what you enjoyed most. See you soon!"',
    },
  },

  // Competitor cinemas to monitor
  competitors: [
    { name: 'Century Theatres Del Monte', placeId: '', location: 'Monterey' },
    { name: 'Osio Cinemas', placeId: '', location: 'Monterey' },
    { name: 'Golden State Theatre', placeId: '', location: 'Monterey' },
  ],

  // Photo categories (rotate through these)
  photoCategories: [
    'lobby_ambiance',
    'concession_stand',
    'auditorium_seats',
    'marquee_exterior',
    'popcorn_closeup',
    'staff_spotlight',
    'event_setup',
    'customer_photo',
  ],

  // Coupon code prefix for review recovery
  couponPrefix: 'LHCINEMA',
};
