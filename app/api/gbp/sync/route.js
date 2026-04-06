import { NextResponse } from 'next/server';
import { createLocalPost } from '@/lib/gbp/google-business';
import { createCalendarEvent } from '@/lib/google-calendar';
import { getEvents, getEvent } from '@/lib/events-db';
import { generatePost } from '@/lib/gbp/ai-engine';
import { schedulePost, markPostPublished } from '@/lib/gbp/automation-db';
import { GBP_CONFIG } from '@/lib/gbp/config';

// ================================================================
// TWO-WAY SYNC: Website â GBP â Google Calendar
// ================================================================

// GET â fetch latest GBP posts for website display
// Used by the main website to show a "Latest from Google" feed
export async function GET() {
  try {
    const { getPublishedPosts } = await import('@/lib/gbp/automation-db');
    const posts = getPublishedPosts(10);

    // Format for website consumption
    const feed = posts.map(p => ({
      id: p.id,
      text: p.text,
      type: p.postType,
      ctaUrl: p.ctaUrl,
      ctaText: p.ctaText,
      publishedAt: p.publishedAt,
    }));

    return NextResponse.json({ feed });
  } catch (err) {
    return NextResponse.json({ feed: [] });
  }
}

// POST â Website â GBP + Calendar sync
// Called when: new event created on admin, new screening added, booking completed
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, eventId, bookingRef, customerName } = body;

    const results = { actions: [] };

    // ââ Action: NEW_EVENT â push event to GBP + Google Calendar ââ
    if (action === 'new_event' && eventId) {
      const event = getEvent(eventId);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // 1. Generate GBP event post
      try {
        const postContent = await generatePost('event_highlight', {
          eventTitle: event.title,
          eventTime: event.time,
          ticketUrl: GBP_CONFIG.squareBookingUrl,
        });

        const fullText = `${postContent.text}\n\n${postContent.hashtags}`;
        const eventStartDate = new Date(`${event.date}T${event.time}`);
        const eventEndDate = new Date(eventStartDate.getTime() + 2 * 3600000);

        const gbpResult = await createLocalPost({
          text: fullText,
          ctaType: 'BOOK',
          ctaUrl: GBP_CONFIG.squareBookingUrl,
          eventStart: eventStartDate,
          eventEnd: eventEndDate,
        });

        const scheduled = schedulePost({
          text: fullText,
          postType: 'event_highlight',
          ctaText: postContent.cta_text,
          ctaUrl: postContent.cta_url,
          hashtags: postContent.hashtags,
        });
        markPostPublished(scheduled.id, gbpResult.name);

        results.actions.push({ type: 'gbp_event_post', status: 'published' });
      } catch (gbpErr) {
        results.actions.push({ type: 'gbp_event_post', status: 'failed', error: gbpErr.message });
      }

      // 2. Create Google Calendar event
      try {
        const calResult = await createCalendarEvent({
          customerName: 'Lighthouse Cinema',
          customerEmail: GBP_CONFIG.email,
          customerPhone: GBP_CONFIG.phone,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          seatCount: event.totalSeats,
          packageName: 'Cinema Event',
          bookingRef: `EVT-${event.id.slice(0, 8)}`,
          totalAmount: event.ticketPrice * event.totalSeats,
          depositPaid: 0,
          remainingBalance: 0,
        });
        results.actions.push({ type: 'google_calendar', status: 'created', calendarEventId: calResult.calendarEventId });
      } catch (calErr) {
        results.actions.push({ type: 'google_calendar', status: 'failed', error: calErr.message });
      }
    }

    // ââ Action: BOOKING_COMPLETED â thank-you post (opt-in) ââ
    if (action === 'booking_completed' && bookingRef) {
      try {
        const thankYouPost = await generatePost('engagement', {
          eventTitle: body.eventTitle || 'tonight\'s show',
        });
        // Note: only post if customer opted in (check body.customerOptedIn)
        if (body.customerOptedIn) {
          await createLocalPost({
            text: `${thankYouPost.text}\n\n${thankYouPost.hashtags}`,
            ctaType: 'LEARN_MORE',
            ctaUrl: GBP_CONFIG.website,
          });
          results.actions.push({ type: 'thank_you_post', status: 'published' });
        } else {
          results.actions.push({ type: 'thank_you_post', status: 'skipped_no_optin' });
        }
      } catch (err) {
        results.actions.push({ type: 'thank_you_post', status: 'failed', error: err.message });
      }
    }

    // ââ Action: DAILY_SCHEDULE â sync all today's events ââ
    if (action === 'sync_daily') {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = getEvents().filter(e => e.date === today && e.active);

      for (const event of todayEvents) {
        try {
          const postContent = await generatePost('morning_greeting', {
            eventTitle: event.title,
            eventTime: event.time,
          });
          results.actions.push({ type: 'daily_sync', event: event.title, status: 'generated' });
        } catch (err) {
          results.actions.push({ type: 'daily_sync', event: event.title, status: 'failed' });
        }
      }
    }

    return NextResponse.json({ success: true, ...results });

  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
