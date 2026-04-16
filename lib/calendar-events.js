// /lib/calendar-events.js â Google Calendar as the events database
//
// Every booking is stored as a Google Calendar event with structured
// metadata in extendedProperties.private. This means:
//   - Events show up on the calendar automatically
//   - Payment data, status, room assignment travel with the event
//   - No separate database needed
//   - Works on Vercel serverless (stateless)
//
// Env vars required:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL    â e.g. xxx@project.iam.gserviceaccount.com
//   GOOGLE_PRIVATE_KEY              â the PEM private key (with \n line breaks)
//   GOOGLE_CALENDAR_ID              â e.g. adeebdds@gmail.com
//
import { google } from 'googleapis';

let _calendarClient = null;

function getCalendar() {
  if (_calendarClient) return _calendarClient;

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  _calendarClient = google.calendar({ version: 'v3', auth });
  return _calendarClient;
}

const calendarId = () => process.env.GOOGLE_CALENDAR_ID || 'primary';

// ---- Data shape ----
// extendedProperties.private stores:
//   eventId, customer, phone, email, eventType, room,
//   guests, totalPrice, depositPaid, balance, status, notes, package

function buildCalendarEvent(data) {
  const startDate = new Date(data.date + 'T' + (data.time || '10:00'));
  const endDate = new Date(startDate.getTime() + (data.durationHours || 2) * 3600000);

  return {
    summary: `${data.customer} â ${data.eventType} (Room ${data.room})`,
    location: `Room ${data.room}`,
    description: [
      `Customer: ${data.customer}`,
      `Phone: ${data.phone || 'â'}`,
      `Email: ${data.email || 'â'}`,
      `Event Type: ${data.eventType}`,
      `Package: ${data.package || 'â'}`,
      `Guests: ${data.guests}`,
      `Total: $${data.totalPrice || 0}`,
      `Paid: $${data.depositPaid || 0}`,
      `Balance: $${data.balance || 0}`,
      `Status: ${data.status}`,
      `Notes: ${data.notes || 'â'}`,
    ].join('\n'),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    colorId: statusColorId(data.status),
    extendedProperties: {
      private: {
        lhc_managed: 'true',
        customer: data.customer || '',
        phone: data.phone || '',
        email: data.email || '',
        eventType: data.eventType || '',
        room: data.room || '',
        guests: String(data.guests || 0),
        totalPrice: String(data.totalPrice || 0),
        depositPaid: String(data.depositPaid || 0),
        balance: String(data.balance || 0),
        status: data.status || 'Draft',
        notes: data.notes || '',
        package: data.package || '',
      },
    },
  };
}

function statusColorId(status) {
  // Google Calendar color IDs
  switch (status) {
    case 'Completed': return '2';  // green
    case 'Paid':      return '2';  // green
    case 'Deposit':   return '5';  // yellow
    case 'Draft':     return '8';  // gray
    case 'Cancelled': return '4';  // red
    default:          return '7';  // cyan
  }
}

function parseCalendarEvent(gcalEvent) {
  const p = gcalEvent.extendedProperties?.private || {};
  return {
    id: gcalEvent.id,
    customer: p.customer || gcalEvent.summary?.split('â')[0]?.trim() || '',
    phone: p.phone || '',
    email: p.email || '',
    eventType: p.eventType || '',
    room: p.room || '',
    date: gcalEvent.start?.dateTime?.slice(0, 10) || gcalEvent.start?.date || '',
    time: gcalEvent.start?.dateTime?.slice(11, 16) || '',
    endTime: gcalEvent.end?.dateTime?.slice(11, 16) || '',
    guests: Number(p.guests) || 0,
    totalPrice: Number(p.totalPrice) || 0,
    depositPaid: Number(p.depositPaid) || 0,
    balance: Number(p.balance) || 0,
    status: p.status || 'Draft',
    notes: p.notes || '',
    package: p.package || '',
    calendarLink: gcalEvent.htmlLink || '',
  };
}

// ---- CRUD ----

export async function listEvents({ dateMin, dateMax, room } = {}) {
  const cal = getCalendar();
  const now = new Date();
  const params = {
    calendarId: calendarId(),
    timeMin: dateMin || new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
    timeMax: dateMax || new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString(),
    maxResults: 250,
    singleEvents: true,
    orderBy: 'startTime',
    privateExtendedProperty: 'lhc_managed=true',
  };

  const res = await cal.events.list(params);
  let events = (res.data.items || []).map(parseCalendarEvent);

  if (room) {
    events = events.filter(e => e.room === room);
  }

  return events;
}

export async function getEvent(eventId) {
  const cal = getCalendar();
  const res = await cal.events.get({ calendarId: calendarId(), eventId });
  return parseCalendarEvent(res.data);
}

export async function createEvent(data) {
  const cal = getCalendar();
  data.balance = (data.totalPrice || 0) - (data.depositPaid || 0);

  // Double-booking check
  const conflicts = await checkConflicts(data.date, data.time, data.room, data.durationHours);
  if (conflicts.length > 0) {
    throw new Error(`Room ${data.room} is already booked at that time (${conflicts[0].customer})`);
  }

  const event = buildCalendarEvent(data);
  const res = await cal.events.insert({ calendarId: calendarId(), requestBody: event });
  return parseCalendarEvent(res.data);
}

export async function updateEvent(eventId, data) {
  const cal = getCalendar();
  data.balance = (data.totalPrice || 0) - (data.depositPaid || 0);

  // Double-booking check (exclude self)
  if (data.date && data.time && data.room) {
    const conflicts = await checkConflicts(data.date, data.time, data.room, data.durationHours, eventId);
    if (conflicts.length > 0) {
      throw new Error(`Room ${data.room} is already booked at that time (${conflicts[0].customer})`);
    }
  }

  const event = buildCalendarEvent(data);
  const res = await cal.events.update({
    calendarId: calendarId(),
    eventId,
    requestBody: event,
  });
  return parseCalendarEvent(res.data);
}

export async function deleteEvent(eventId) {
  const cal = getCalendar();
  await cal.events.delete({ calendarId: calendarId(), eventId });
  return { deleted: true };
}

// ---- Double-booking check ----

async function checkConflicts(date, time, room, durationHours = 2, excludeId = null) {
  const start = new Date(date + 'T' + time);
  const end = new Date(start.getTime() + durationHours * 3600000);

  const events = await listEvents({
    dateMin: new Date(start.getTime() - 12 * 3600000).toISOString(),
    dateMax: new Date(end.getTime() + 12 * 3600000).toISOString(),
    room,
  });

  return events.filter(e => {
    if (e.id === excludeId) return false;
    const eStart = new Date(e.date + 'T' + e.time);
    const eEnd = new Date(e.date + 'T' + e.endTime);
    return start < eEnd && end > eStart; // overlap
  });
}

// ---- Dashboard aggregation ----

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();

  const todayEvents = await listEvents({ dateMin: todayStart, dateMax: todayEnd });
  const upcomingEvents = await listEvents({ dateMin: todayStart, dateMax: monthEnd });

  const todayRevenue = todayEvents.reduce((sum, e) => sum + e.depositPaid, 0);
  const totalGuests = todayEvents.reduce((sum, e) => sum + e.guests, 0);
  const pendingBalances = upcomingEvents
    .filter(e => e.balance > 0)
    .reduce((sum, e) => sum + e.balance, 0);

  const activeNow = todayEvents.filter(e => {
    const eStart = new Date(e.date + 'T' + e.time);
    const eEnd = new Date(e.date + 'T' + e.endTime);
    return now >= eStart && now <= eEnd;
  });

  const actionRequired = upcomingEvents
    .filter(e => e.status === 'Draft' || e.status === 'Deposit')
    .slice(0, 10);

  return {
    todayRevenue,
    eventsToday: todayEvents.length,
    activeNow: activeNow.length,
    totalGuests,
    pendingBalances,
    actionRequired,
    todayEvents,
    upcomingEvents,
  };
}
