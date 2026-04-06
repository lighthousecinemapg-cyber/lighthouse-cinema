import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/events-db';

export async function GET() {
  const events = getEvents();
  return NextResponse.json({ events });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, date, time, venue, ticketPrice, totalSeats, category, image } = body;

    if (!title || !date || !time || !ticketPrice || !totalSeats) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = createEvent({
      title,
      description: description || '',
      date,
      time,
      venue: venue || 'Main Auditorium',
      ticketPrice: parseFloat(ticketPrice),
      totalSeats: parseInt(totalSeats),
      category: category || 'special',
      image: image || '/popcorn-hero.jpg',
      active: true,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
