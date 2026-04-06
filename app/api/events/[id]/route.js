import { NextResponse } from 'next/server';
import { getEvent, updateEvent, deleteEvent } from '@/lib/events-db';

export async function GET(request, { params }) {
  const event = getEvent(params.id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const updated = updateEvent(params.id, body);
    if (!updated) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ event: updated });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const success = deleteEvent(params.id);
  if (!success) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
