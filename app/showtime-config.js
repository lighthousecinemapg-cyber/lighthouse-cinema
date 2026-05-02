/*  Lighthouse Cinema - Showtime & Ticket Config
 *
 *  SINGLE SOURCE OF TRUTH for every movie, showtime, and ticket link.
 *  Change it here and the site updates automatically.
 *
 *  HOW TO ADD A NEW MOVIE:
 *    1. Copy any movie block below
 *    2. Fill in the fields
 *    3. Set active: true -> it appears on the site
 *    4. Set active: false -> it disappears (links preserved for reuse)
 *
 *  HOW TO SWAP IN PER-SHOWTIME SQUARE LINKS:
 *    Replace the "default" link in ticketLinks with individual time keys:
 *      ticketLinks: { "13:00": "https://square.link/u/XXXX", ... }
 *    If a specific time has no link, the system falls back to "default".
 */

export const SQUARE_LINKS = {
  general: 'https://square.link/u/pfGKjKqr',
  payItForward: 'https://square.link/u/kNTJoYP4',
  banner: 'https://square.link/u/1uppuNv7',
};

export const movies = [
  {
    slug: 'project-hail-mary',
    title: 'Project Hail Mary',
    status: 'now-playing',
    active: true,
    startDate: '2026-04-16',
    endDate: '2026-05-08',
    rating: 'PG-13',
    runtime: '2h 19m',
    genre: 'Sci-Fi',
    rottenTomatoes: '94%',
    description: 'Ryan Gosling stars as a science teacher who wakes up alone on a spaceship light-years from Earth with no memory of how he got there. As his memory returns, he uncovers a mission to save humanity from extinction. Based on Andy Weir\'s bestselling novel. Directed by Phil Lord & Christopher Miller.',
    poster: 'https://img.youtube.com/vi/m08TxIsFTRI/maxresdefault.jpg',
    trailerId: 'm08TxIsFTRI',
    showtimes: {
      Wednesday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Thursday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Friday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Saturday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Sunday: ['1:00 PM', '4:00 PM', '7:00 PM'],
    },
    ticketLinks: { default: 'https://square.link/u/pfGKjKqr' },
    displayNote: 'Playing through May 8',
    hoursNote: 'Wed 12-7 PM | Thu 12-10 PM | Fri-Sat 12 PM-12 AM | Sun 11 AM-7 PM',
  },
  {
    slug: 'cheap-detective',
    title: 'The Cheap Detective',
    status: 'coming-soon',
    active: true,
    startDate: '2026-05-08',
    endDate: null,
    rating: 'PG',
    runtime: '1h 32m',
    genre: 'Comedy',
    tags: ['Mystery', '1978'],
    description: 'Peter Falk stars as Lou Peckinpaugh, a bumbling private eye caught up in a web of murder, mystery, and hilarious misunderstandings. A loving parody of classic detective films, featuring an all-star cast including Ann-Margret, Eileen Brennan, and Dom DeLuise.',
    poster: 'https://img.youtube.com/vi/MfdMuvXhfjI/maxresdefault.jpg',
    trailerId: 'MfdMuvXhfjI',
    showtimes: {
      Wednesday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Thursday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Friday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Saturday: ['1:00 PM', '4:00 PM', '7:00 PM'],
      Sunday: ['1:00 PM', '4:00 PM', '7:00 PM'],
    },
    ticketLinks: { default: 'https://square.link/u/pfGKjKqr' },
    displayNote: 'Starting Thursday, May 8',
  },
  {
    slug: 'devil-wears-prada-2',
    title: 'The Devil Wears Prada 2',
    status: 'now-playing',
    active: true,
    startDate: '2026-04-30',
    endDate: null,
    rating: 'PG-13',
    genre: 'Comedy',
    tags: ['Drama', 'Sequel'],
    description: 'Meryl Streep, Anne Hathaway, Emily Blunt, and Stanley Tucci return to the fashionable streets of New York City and the sleek offices of Runway Magazine. When Miranda Priestly faces a declining print empire, she recruits a now-seasoned Andy Sachs to help save everything she built.',
    poster: 'https://image.tmdb.org/t/p/w500/p35IoKfBtJDNiWJMO8ZEtIMZSfW.jpg',
    trailerId: 'R57Y4v5OmzM',
    showtimes: {
      Thursday: ['4:00 PM', '7:00 PM'],
      Friday: ['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM'],
      Saturday: ['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM'],
      Sunday: ['12:00 PM', '2:30 PM', '5:00 PM', '7:30 PM'],
    },
    ticketLinks: { default: 'https://square.link/u/pfGKjKqr' },
    displayNote: 'Now Playing',
  },
  {
    slug: 'the-godfather',
    title: 'The Godfather',
    status: 'classic',
    active: false,
    startDate: '2026-04-26',
    endDate: '2026-04-30',
    rating: 'R',
    runtime: '2h 55m',
    genre: 'Classic',
    description: "Francis Ford Coppola's masterpiece returns to the big screen. The aging patriarch of an organized crime dynasty transfers control to his reluctant son. Starring Marlon Brando and Al Pacino. An offer you can't refuse.",
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    trailerId: null,
    showtimes: {
      Saturday: ['7:30 PM'],
      Sunday: ['1:00 PM', '4:00 PM'],
    },
    ticketLinks: { default: 'https://square.link/u/pfGKjKqr' },
    displayNote: 'April Only',
    priceNote: 'Tickets: $15 Adult',
  },
  {
    slug: 'zorba-the-greek',
    title: 'Zorba the Greek',
    status: 'documentary',
    active: true,
    startDate: null,
    endDate: null,
    rating: 'NR',
    genre: 'Drama',
    tags: ['Classic', '1964', 'Anthony Quinn'],
    description: 'Anthony Quinn delivers an unforgettable performance as the exuberant Alexis Zorba, who teaches a reserved English writer how to embrace life on the island of Crete. Winner of three Academy Awards.',
    poster: 'https://img.youtube.com/vi/xrArjp14SeU/maxresdefault.jpg',
    trailerId: 'xrArjp14SeU',
    showtimes: {
      Daily: ['4:00 PM'],
    },
    ticketLinks: { default: 'https://square.link/u/pfGKjKqr' },
    displayNote: 'Daily at 4:00 PM | Main Auditorium',
  },
];

/* Helper: get ticket link for a specific showtime */
export function getTicketLink(movie, time) {
  const [hm, period] = time.split(' ');
  const [h, m] = hm.split(':');
  let hour = parseInt(h);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const key = hour + ':' + m;
  return movie.ticketLinks[key] || movie.ticketLinks.default || SQUARE_LINKS.general;
}

/* Helper: is this movie currently showing? */
export function isMovieActive(movie) {
  if (!movie.active) return false;
  const today = new Date().toISOString().split('T')[0];
  if (movie.startDate && today < movie.startDate) return false;
  if (movie.endDate && today > movie.endDate) return false;
  return true;
}

/* Helper: is this movie coming soon? */
export function isComingSoon(movie) {
  if (!movie.active) return false;
  const today = new Date().toISOString().split('T')[0];
  return movie.startDate && today < movie.startDate;
}
