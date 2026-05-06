// Showtime configuration for social media posts and cron jobs
// This pulls from events-db for active movie data

import { getEvents } from '@/lib/events-db';

// Get movies that are currently showing (have NOW SHOWING in description)
export function getActiveMovies() {
    const events = getEvents();
    return events.filter(e => e.description && e.description.includes('NOW SHOWING'));
}

// Check if a movie is currently active based on date
export function isMovieActive(movie) {
    if (!movie.active) return false;
    const today = new Date().toISOString().split('T')[0];
    return movie.date >= today;
}

// Export movies array from events-db
export const movies = getEvents().filter(e => e.active);
