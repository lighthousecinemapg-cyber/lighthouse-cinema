// ================================================================
// GOOGLE CALENDAR API â Auto-create events for bookings
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
    `ð¬ BOOKING CONFIRMED â ${bookingRef}`,
    ``,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    ``,
    `Event: ${eventTitle}`,
    `Seats: ${seatCount}`,
    `Package: ${packageName}`,
    ``,
    `ð° Payment Summary:`,
    `Total: $${totalAmount.toFixed(2)}`,
    `Deposit Paid: $${depositPaid.toFixed(2)}`,
    `Remaining Balance: $${remainingBalance.toFixed(2)}`,
    ``,
    `ð Lighthouse Cinema`,
    `525 Lighthouse Ave, Pacific Grove, CA 93950`,
    `(831) 717-3124`,
  ].join('\n');

  try {
    const result = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `ð¬ ${eventTitle} â ${customerName} (${seatCount} seats)`,
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
    // Non-fatal â don't block booking if calendar fails
    return { calendarEventId: null, calendarLink: null, meetLink: null };
  }
}
