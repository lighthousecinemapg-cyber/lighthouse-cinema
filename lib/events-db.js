import { fetchCalendarEvents } from './google-calendar';

// ================================================================
// IN-MEMORY EVENT DATABASE (Replace with PostgreSQL/MongoDB in production)
// For MVP events are stored in memory and can be managed via admin
// ================================================================

let events = [
  {
    id: 'evt-001',
    title: 'Bingo Night',
    description: 'Cash prizes, food specials, and laughs. A Lighthouse Cinema tradition every Thursday. 7 PM - 9 PM.',
    date: '2026-04-16',
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 10,
    totalSeats: 140,
    bookedSeats: 0,
    category: 'weekly',
    image: '/popcorn-hero.jpg',
    active: true,
  },
  {
    id: 'evt-002',
    title: 'Karaoke Night',
    description: 'Take the stage on our cinema screen. Full bar open. Every Friday at Lighthouse. Free admission! Bar and food available. 7:30 PM - 11:00 PM.',
    date: '2026-04-17',
    time: '19:30',
    venue: 'Main Auditorium',
    ticketPrice: 0,
    totalSeats: 140,
    bookedSeats: 0,
    category: 'weekly',
    image: '/popcorn-hero.jpg',
    active: true,
  },
  {
    id: 'evt-003',
    title: 'Salsa Night',
    description: 'Live DJ, beginner lesson at 8. All levels welcome. The biggest dance floor on the Peninsula. Every Saturday!',
    date: '2026-04-11',
    time: '20:00',
    venue: 'Main Auditorium',
    ticketPrice: 10,
    totalSeats: 140,
    bookedSeats: 0,
    category: 'weekly',
    image: '/popcorn-hero.jpg',
    active: true,
  },
{
    id: 'evt-005',
    title: 'The Director\'s Cut Killer - A Murder Mystery Experience',
    description: 'Lighthouse Cinema presents an immersive murder mystery. Do you have what it takes to solve the crime? VIP includes exclusive roles & priority seating. Doors open 6 PM.',
    date: '2026-04-24',
    time: '18:00',
    venue: 'Main Auditorium + Lobby',
    ticketPrice: 45,
    vipPrice: 75,
    totalSeats: 80,
    bookedSeats: 0,
    category: 'special',
    image: '/popcorn-hero.jpg',
    active: true,
    ticketUrl: 'https://square.link/u/r7ovZSJ6',
    vipTicketUrl: 'https://square.link/u/EzQg9ZNY',
  },
  {
    id: 'evt-006',
    title: 'Private Screening - The Godfather',
    description: 'Classic cinema on the big screen. Craft cocktails, gourmet popcorn, and a night to remember.',
    date: '2026-04-26',
    time: '19:30',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 140,
    bookedSeats: 0,
    category: 'screening',
    image: '/popcorn-hero.jpg',
    active: true,
  },
  {
    id: 'evt-101',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-22',
    time: '13:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-102',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-22',
    time: '16:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-103',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-23',
    time: '15:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-104',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-23',
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-105',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-24',
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-106',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-25',
    time: '13:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
  {
    id: 'evt-107',
    title: 'Project Hail Mary',
    description: 'NOW SHOWING! Ryan Gosling stars in this epic sci-fi adventure based on Andy Weir\'s bestselling novel. 94% on Rotten Tomatoes.',
    date: '2026-04-26',
    time: '16:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },

  {
    id: 'evt-201',
    title: 'Monterey Comedy Improv',
    description: 'The Monterey Peninsula\'s Premier Improv Troupe! Live improv comedy every 1st Saturday of the month at 7 PM. Buy tickets at LighthouseCinema.Fun',
    date: '2026-05-02',
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 25,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://lighthousecinema.fun/wp-content/uploads/2025/12/MCI-LAUGH-TAG.jpg',
    bookingUrl: 'https://square.link/u/H5ZbXViH',
    active: true,
  },,
  {
    id: 'evt-musical-001',
    title: 'Musical Night at Lighthouse Cinema',
    description: 'An evening of live musical performances at the Lighthouse Cinema.',
    date: '2026-05-09',
    time: '19:00',
    venue: 'Lighthouse Cinema',
    category: 'live-entertainment',
    ticketPrice: 20,
    bookingUrl: 'https://square.link/u/gufiSzi1'
  },
  {
    id: 'evt-movie-night-001',
    title: 'Family Movie Night',
    description: 'A fun movie night for the whole family with kid-friendly films and snacks.',
    date: '2026-05-16',
    time: '17:00',
    venue: 'Lighthouse Cinema',
    category: 'movie',
    ticketPrice: 10,
    ticketUrl: 'https://square.link/u/gufiSzi1'
  },
  {
    id: 'evt-spca-sing',
    title: 'SPCA Sing-Along Fundraiser',
    description: 'A sing-along event to raise funds for the local SPCA. Enjoy music and support a great cause.',
    date: '2026-05-23',
    time: '18:00',
    venue: 'Lighthouse Cinema',
    category: 'live-entertainment',
    ticketPrice: 15,
    bookingUrl: 'https://square.link/u/gufiSzi1'
  },
  {
    id: 'evt-edward-jones',
    title: 'Edward Jones Financial Workshop',
    description: 'A financial planning workshop hosted by Edward Jones advisors.',
    date: '2026-05-30',
    time: '14:00',
    venue: 'Lighthouse Cinema',
    category: 'community',
    ticketPrice: 0,
    bookingUrl: 'https://square.link/u/gufiSzi1'
  },
  {
    id: 'evt-godfather-sun-1',
    title: 'The Godfather - Sunday Matinee',
    description: 'Sunday matinee screening of The Godfather.',
    date: '2026-04-27',
    time: '13:00',
    venue: 'Lighthouse Cinema',
    category: 'movie',
    ticketPrice: 15,
    ticketUrl: 'https://square.link/u/r7ovZSJ6'
  },
  {
    id: 'evt-godfather-sun-2',
    title: 'The Godfather - Sunday Afternoon',
    description: 'Sunday afternoon screening of The Godfather.',
    date: '2026-04-27',
    time: '16:00',
    venue: 'Lighthouse Cinema',
    category: 'movie',
    ticketPrice: 15,
    ticketUrl: 'https://square.link/u/r7ovZSJ6'
  },
  {
    id: 'evt-godfather-sun-3',
    title: 'The Godfather - Sunday Evening',
    description: 'Sunday evening screening of The Godfather.',
    date: '2026-04-27',
    time: '19:00',
    venue: 'Lighthouse Cinema',
    category: 'movie',
    ticketPrice: 15,
    ticketUrl: 'https://square.link/u/r7ovZSJ6'
  }
];

let bookings = [];

// Local events (hardcoded fallback)
export function getLocalEvents() {
  return events.filter(e => e.active);
}

// Merged events: Google Calendar + local (async)
// Google Calendar is the source of truth; local events fill gaps
let cachedCalendarEvents = [];
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getEventsAsync() {
  const now = Date.now();
  if (now - lastFetchTime > CACHE_TTL) {
    try {
      cachedCalendarEvents = await fetchCalendarEvents();
      lastFetchTime = now;
    } catch (err) {
      console.error('Calendar sync failed, using local events:', err.message);
    }
  }

  const local = events.filter(e => e.active);

  if (cachedCalendarEvents.length === 0) return local;

  // Merge: calendar events take priority, local events fill in
  // Match by title similarity to avoid duplicates
  const calTitles = new Set(cachedCalendarEvents.map(e => e.title.toLowerCase().trim()));
  const uniqueLocal = local.filter(e => !calTitles.has(e.title.toLowerCase().trim()));

  return [...cachedCalendarEvents, ...uniqueLocal];
}

// Synchronous fallback (returns cached calendar + local)
export function getEvents() {
  const local = events.filter(e => e.active);
  if (cachedCalendarEvents.length === 0) return local;
  const calTitles = new Set(cachedCalendarEvents.map(e => e.title.toLowerCase().trim()));
  const uniqueLocal = local.filter(e => !calTitles.has(e.title.toLowerCase().trim()));
  return [...cachedCalendarEvents, ...uniqueLocal];
}

export function getEvent(id) {
  return events.find(e => e.id === id);
}

export function createEvent(eventData) {
  const id = 'evt-' + Date.now();
  const newEvent = { id, ...eventData, bookedSeats: 0, active: true };
  events.push(newEvent);
  return newEvent;
}

export function updateEvent(id, data) {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...data };
  return events[idx];
}

export function deleteEvent(id) {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return false;
  events[idx].active = false;
  return true;
}

export function createBooking(bookingData) {
  bookings.push(bookingData);
  // Update booked seats
  for (const item of bookingData.lineItems) {
    const event = events.find(e => e.id === item.eventId);
    if (event) event.bookedSeats += item.quantity;
  }
  return bookingData;
}

export function getBookings() {
  return bookings;
}

export function getBooking(ref) {
  return bookings.find(b => b.bookingRef === ref);
}
