import { NextResponse } from 'next/server';
import { GBP_CONFIG } from '@/lib/gbp/config';
import { generatePost, generatePhotoCaption } from '@/lib/gbp/ai-engine';
import { createLocalPost, uploadPhoto } from '@/lib/gbp/google-business';
import { schedulePost, markPostPublished, markPostFailed, logPhotoUpload } from '@/lib/gbp/automation-db';
import { getEvents } from '@/lib/events-db';

// ================================================================
// CRON ENDPOINT â Called by Vercel Cron or external scheduler
// Runs every hour between 8 AM - 10 PM PST
//
// Vercel cron config (add to vercel.json):
// {
//   "crons": [{
//     "path": "/api/gbp/cron",
//     "schedule": "0 8-22 * * *"
//   }]
// }
// ================================================================

export async function GET(request) {
  // Verify cron secret (prevent unauthorized triggers)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const pstHour = getPSTHour(now);
  const results = { hour: pstHour, actions: [] };

  // ââ 1. Find scheduled post for this hour ââ
  const scheduleSlot = GBP_CONFIG.postSchedule.find(s => s.hour === pstHour);

  if (scheduleSlot) {
    try {
      // Get today's events for context
      const today = now.toISOString().split('T')[0];
      const events = getEvents().filter(e => e.date === today && e.active);
      const nextEvent = events[0];

      const context = {
        eventTitle: nextEvent?.title,
        eventTime: nextEvent?.time,
        ticketUrl: GBP_CONFIG.squareBookingUrl,
      };

      // Generate AI post
      const postContent = await generatePost(scheduleSlot.type, context);
      const fullText = `${postContent.text}\n\n${postContent.hashtags}`;

      // Schedule it
      const scheduled = schedulePost({
        text: fullText,
        postType: scheduleSlot.type,
        ctaText: postContent.cta_text,
        ctaUrl: postContent.cta_url,
        hashtags: postContent.hashtags,
        scheduledFor: now.toISOString(),
      });

      // Publish to GBP
      try {
        const ctaMap = { 'Get Tickets': 'BOOK', 'Book Now': 'BOOK', 'Learn More': 'LEARN_MORE' };
        const gbpResult = await createLocalPost({
          text: fullText,
          ctaType: ctaMap[postContent.cta_text] || 'LEARN_MORE',
          ctaUrl: postContent.cta_url,
        });
        markPostPublished(scheduled.id, gbpResult.name);
        results.actions.push({ type: 'post_published', postType: scheduleSlot.type, text: fullText });
      } catch (pubErr) {
        markPostFailed(scheduled.id, pubErr.message);
        results.actions.push({ type: 'post_failed', error: pubErr.message });
      }
    } catch (genErr) {
      results.actions.push({ type: 'generation_failed', error: genErr.message });
    }
  }

  // ââ 2. Photo upload (9 AM, 1 PM, 5 PM) ââ
  if ([9, 13, 17].includes(pstHour)) {
    try {
      const categories = GBP_CONFIG.photoCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const caption = await generatePhotoCaption(category);

      // In production, pull from your S3/Cloudinary media library
      // For now, log the intended upload
      logPhotoUpload({
        category,
        photoUrl: `https://lighthousecinemapg.com/media/${category}.jpg`,
        caption,
        gbpMediaId: null,
      });

      results.actions.push({ type: 'photo_scheduled', category, caption });
    } catch (photoErr) {
      results.actions.push({ type: 'photo_failed', error: photoErr.message });
    }
  }

  // ââ 3. Review check (runs every hour, but main review handler is separate) ââ
  results.actions.push({ type: 'review_check_reminder', message: 'Reviews are checked every 15 min via /api/gbp/reviews' });

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    ...results,
  });
}

// POST â manual trigger with custom params
export async function POST(request) {
  const body = await request.json();
  const { action, postType, context } = body;

  if (action === 'generate_all_today') {
    const results = [];
    for (const slot of GBP_CONFIG.postSchedule) {
      try {
        const postContent = await generatePost(slot.type, context || {});
        const scheduled = schedulePost({
          text: `${postContent.text}\n\n${postContent.hashtags}`,
          postType: slot.type,
          ctaText: postContent.cta_text,
          ctaUrl: postContent.cta_url,
          hashtags: postContent.hashtags,
          scheduledFor: getTodayAtHour(slot.hour).toISOString(),
        });
        results.push({ hour: slot.hour, type: slot.type, post: scheduled });
      } catch (err) {
        results.push({ hour: slot.hour, type: slot.type, error: err.message });
      }
    }
    return NextResponse.json({ message: `Generated ${results.length} posts for today`, results });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

function getPSTHour(date) {
  return parseInt(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false }));
}

function getTodayAtHour(hour) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}
