// /app/api/admin/events/route.js â Events CRUD (protected)
import { authenticateRequest } from '@/lib/auth';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getDashboardStats,
} from '@/lib/calendar-events';

function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// GET /api/admin/events?view=dashboard | ?date=2026-04-15 | ?id=xxx
export async function GET(request) {
  if (!authenticateRequest(request)) return unauthorized();

  const url = new URL(request.url);
  const view = url.searchParams.get('view');
  const id = url.searchParams.get('id');
  const dateMin = url.searchParams.get('dateMin');
  const dateMax = url.searchParams.get('dateMax');
  const room = url.searchParams.get('room');

  try {
    if (view === 'dashboard') {
      const stats = await getDashboardStats();
      return Response.json(stats);
    }

    if (id) {
      const event = await getEvent(id);
      return Response.json(event);
    }

    const events = await listEvents({ dateMin, dateMax, room });
    return Response.json({ events });
  } catch (err) {
    console.error('[events] GET error', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/admin/events â create new event
export async function POST(request) {
  if (!authenticateRequest(request)) return unauthorized();

  try {
    const data = await request.json();

    // Validation
    const required = ['customer', 'eventType', 'room', 'date', 'time', 'guests'];
    for (const field of required) {
      if (!data[field]) {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    if (!['A', 'B', 'C', 'D'].includes(data.room)) {
      return Response.json({ error: 'Room must be A, B, C, or D' }, { status: 400 });
    }

    const event = await createEvent(data);
    return Response.json({ success: true, event });
  } catch (err) {
    console.error('[events] POST error', err);
    const status = err.message.includes('already booked') ? 409 : 500;
    return Response.json({ error: err.message }, { status });
  }
}

// PUT /api/admin/events â update event
export async function PUT(request) {
  if (!authenticateRequest(request)) return unauthorized();

  try {
    const data = await request.json();
    if (!data.id) {
      return Response.json({ error: 'Missing event id' }, { status: 400 });
    }

    const event = await updateEvent(data.id, data);
    return Response.json({ success: true, event });
  } catch (err) {
    console.error('[events] PUT error', err);
    const status = err.message.includes('already booked') ? 409 : 500;
    return Response.json({ error: err.message }, { status });
  }
}

// DELETE /api/admin/events?id=xxx
export async function DELETE(request) {
  if (!authenticateRequest(request)) return unauthorized();

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'Missing event id' }, { status: 400 });
  }

  try {
    await deleteEvent(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('[events] DELETE error', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
