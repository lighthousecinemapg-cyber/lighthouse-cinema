// app/api/schedule/route.js - Centralized Schedule API
import { movies, SQUARE_LINKS, getTicketLink, isMovieActive, isComingSoon, pacificTodayStr, pacificWeekday } from '../../showtime-config';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter');
  const format = searchParams.get('format');
  const todayStr = pacificTodayStr();
  const dayOfWeek = pacificWeekday();

  let filtered = movies.filter(m => m.active);

  if (filter === 'now-playing') filtered = filtered.filter(m => isMovieActive(m) && !isComingSoon(m));
  else if (filter === 'coming-soon') filtered = filtered.filter(m => isComingSoon(m));
  else if (filter === 'today') {
    filtered = filtered.filter(m => {
      if (!isMovieActive(m) || isComingSoon(m)) return false;
      if (m.showtimes && m.showtimes[dayOfWeek]) return true;
      if (m.showDates) return m.showDates.some(sd => sd.date === todayStr);
      return false;
    });
  }

  const enriched = filtered.map(movie => {
    let todayShowtimes = [];
    if (movie.showtimes && movie.showtimes[dayOfWeek]) {
      todayShowtimes = movie.showtimes[dayOfWeek];
    } else if (movie.showDates) {
      const todayEntry = movie.showDates.find(sd => sd.date === todayStr);
      if (todayEntry) todayShowtimes = todayEntry.times;
    }
    const ticketLinksForToday = todayShowtimes.map(time => ({
      time,
      link: getTicketLink(movie, time)
    }));
    return { ...movie, todayShowtimes, ticketLinksForToday };
  });

  if (format === 'social') {
    return NextResponse.json({
      date: todayStr,
      dayOfWeek,
      venue: {
        name: 'Lighthouse Cinema and Event Center',
        address: '525 Lighthouse Ave, Pacific Grove, CA 93950',
        website: 'lighthousepgcinema.com',
      },
      movies: enriched.filter(m => m.todayShowtimes.length > 0).map(m => ({
        title: m.title,
        rating: m.rating,
        runtime: m.runtime,
        genre: m.genre,
        showtimes: m.todayShowtimes.join(' | '),
        poster: m.poster,
        ticketLink: m.ticketLinks?.default || SQUARE_LINKS.general,
        displayNote: m.displayNote,
      })),
      squareLinks: SQUARE_LINKS,
    });
  }

  if (format === 'gbp') {
    const nowPlaying = enriched.filter(m => m.todayShowtimes.length > 0);
    const postText = nowPlaying.map(m =>
      m.title + ' \u2014 ' + m.todayShowtimes.join(', ')
    ).join('\n');
    return NextResponse.json({
      summary: 'Now showing at Lighthouse Cinema:\n' + postText,
      callToAction: 'BOOK',
      url: SQUARE_LINKS.general,
      movies: nowPlaying.map(m => ({ title: m.title, showtimes: m.todayShowtimes })),
    });
  }

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    date: todayStr,
    dayOfWeek,
    squareLinks: SQUARE_LINKS,
    nowPlaying: enriched.filter(m => isMovieActive(m) && !isComingSoon(m)),
    comingSoon: enriched.filter(m => isComingSoon(m)),
    totalMovies: enriched.length,
  });
}
