// ================================================================
// IN-MEMORY EVENT DATABASE (Replace with PostgreSQL/MongoDB in production)
// For MVP â events are stored in memory and can be managed via admin
// ================================================================

let events = [
  {
    id: 'evt-001',
    title: 'Bingo Night',
    description: 'Cash prizes, food specials, and laughs. A Lighthouse Cinema tradition every Thursday. 7 PM - 9 PM.',
    date: '2026-04-09',
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
    description: 'Take the stage on our cinema screen. Full bar open. Every Friday at Lighthouse. Free admission! Bar and food available.',
    date: '2026-04-10',
    time: '18:30',
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
    id: 'evt-004',
    title: 'Sunday Brunch & Movie',
    description: 'Karma Sunday â brunch, a classic film, and community. The perfect Pacific Grove morning.',
    date: '2026-04-13',
    time: '11:00',
    venue: 'Main Auditorium',
    ticketPrice: 25,
    totalSeats: 140,
    bookedSeats: 0,
    category: 'weekly',
    image: '/popcorn-hero.jpg',
    active: true,
  },
  {
    id: 'evt-005',
    title: 'Murder Mystery Night',
    description: 'Immersive whodunit experience. Dress to impress, solve the case, enjoy craft cocktails.',
    date: '2026-04-19',
    time: '19:00',
    venue: 'Main Auditorium + Lobby',
    ticketPrice: 45,
    totalSeats: 80,
    bookedSeats: 0,
    category: 'special',
    image: '/popcorn-hero.jpg',
    active: true,
  },
  {
    id: 'evt-006',
    title: 'Private Screening â The Godfather',
    description: 'Classic cinema on the big screen. Craft cocktails, gourmet popcorn, and a night to remember.',
    date: '2026-04-26',
    time: '19:30',
    venue: 'Main Auditorium',
    ticketPrice: 18,
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
    date: '2026-04-10',
    time: '13:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-10',
    time: '16:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-11',
    time: '13:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-11',
    time: '16:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-11',
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-12',
    time: '13:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
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
    date: '2026-04-12',
    time: '16:00',
    venue: 'Main Auditorium',
    ticketPrice: 14,
    totalSeats: 145,
    bookedSeats: 0,
    category: 'special',
    image: 'https://www.impawards.com/2026/posters/project_hail_mary.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=P0XN3-n-2Lo',
    active: true,
  },
];

let bookings = [];

export function getEvents() {
  return events.filter(e => e.active);
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
