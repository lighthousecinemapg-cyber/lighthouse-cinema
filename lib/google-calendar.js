// ================================================================
// GOOGLE CALENDAR API Ã¢ÂÂ Auto-create events for bookings
// ================================================================
import { google } from 'googleapis';

function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Create a Google Calendar event for a confirmed booking
 */
export async function createCalendarEvent({
  customerName,
  customerEmail,
  customerPhone,
  eventTitle,
  eventDate, // ISO date string
  eventTime, // HH:MM format
  seatCount,
  packageName,
  bookingRef,
  totalAmount,
  depositPaid,
  remainingBalance,
}) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  // Parse date and time
  const [hours, minutes] = eventTime.split(':').map(Number);
  const startDate = new Date(eventDate);
  startDate.setHours(hours, minutes, 0);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 2); // Default 2-hour event

  const description = [
    `Ã°ÂÂÂ¬ BOOKING CONFIRMED Ã¢ÂÂ ${bookingRef}`,
    ``,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    ``,
    `Event: ${eventTitle}`,
    `Seats: ${seatCount}`,
    `Package: ${packageName}`,
    ``,
    `Ã°ÂÂÂ° Payment Summary:`,
    `Total: $${totalAmount.toFixed(2)}`,
    `Deposit Paid: $${depositPaid.toFixed(2)}`,
    `Remaining Balance: $${remainingBalance.toFixed(2)}`,
    ``,
    `Ã°ÂÂÂ Lighthouse Cinema`,
    `525 Lighthouse Ave, Pacific Grove, CA 93950`,
    `(831) 717-3124`,
  ].join('\n');

  try {
    const result = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Ã°ÂÂÂ¬ ${eventTitle} Ã¢ÂÂ ${customerName} (${seatCount} seats)`,
        description,
        location: '525 Lighthouse Ave, Pacific Grove, CA 93950',
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'America/Los_Angeles',
        },
        attendees: [
          { email: customerEmail, displayName: customerName },
          { email: process.env.GOOGLE_CALENDAR_ID || 'lighthousecinemapg@gmail.com' },
        ],
        conferenceData: {
          createRequest: {
            requestId: bookingRef,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24 hours before
            { method: 'popup', minutes: 60 },    // 1 hour before
          ],
        },
        colorId: '6', // Gold color
      },
    });

    return {
      calendarEventId: result.data.id,
      calendarLink: result.data.htmlLink,
      meetLink: result.data.conferenceData?.entryPoints?.[0]?.uri || null,
    };
  } catch (error) {
    console.error('Google Calendar Error:', error);
    // Non-fatal Ã¢ÂÂ don't block booking if calendar fails
    return { calendarEventId: null, calendarLink: null, meetLink: null };
  }
}

/**
 * Fetch upcoming events from Google Calendar
 * Used to sync the website events display with the Google Calendar
 */
export async function fetchCalendarEvents() {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'lighthousecinemapg@gmail.com';

    const now = new Date();
    const fourWeeksLater = new Date();
    fourWeeksLater.setDate(fourWeeksLater.getDate() + 28);

    const res = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: fourWeeksLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const items = res.data.items || [];

    return items.map((item) => {
      const start = item.start.dateTime || item.start.date;
      const startDate = new Date(start);
      const dateStr = startDate.toISOString().split('T')[0];
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');

      // Parse ticket price from description if present (e.g. "Price: $25")
      const priceMatch = (item.description || '').match(/Price:\s*\$(\d+)/i);
      const ticketPrice = priceMatch ? Number(priceMatch[1]) : 0;

      // Parse category from description (e.g. "Category: weekly")
      const catMatch = (item.description || '').match(/Category:\s*(\w+)/i);
      const category = catMatch ? catMatch[1].toLowerCase() : 'special';

      // Parse booking URL from description (e.g. "BookingUrl: https://...")
      const bookingMatch = (item.description || '').match(/BookingUrl:\s*(https?:\/\/[^\s]+)/i);
      const bookingUrl = bookingMatch ? bookingMatch[1] : null;

      // Parse image URL from description
      const imgMatch = (item.description || '').match(/Image:\s*(https?:\/\/[^\s]+)/i);
      const image = imgMatch ? imgMatch[1] : null;

      // Parse seats from description
      const seatsMatch = (item.description || '').match(/Seats:\s*(\d+)/i);
      const totalSeats = seatsMatch ? Number(seatsMatch[1]) : 145;

      return {
        id: 'gcal-' + item.id,
        title: (item.summary || 'Untitled Event').replace(/^\S+\s/, '').replace(/\s*[\u2013\u2014].*/, '') || item.summary,
        description: (item.description || '').replace(/^(Price|Category|BookingUrl|Image|Seats):.*$/gim, '').trim() || item.summary,
        date: dateStr,
        time: hours + ':' + minutes,
        venue: item.location || 'Main Auditorium',
        ticketPrice,
        totalSeats,
        bookedSeats: 0,
        category,
        image,
        bookingUrl,
        active: true,
        source: 'google-calendar',
        calendarLink: item.htmlLink,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error.message);
    return [];
  }
}
