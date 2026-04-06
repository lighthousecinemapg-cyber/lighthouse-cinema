import { NextResponse } from 'next/server';
import { createLocalPost, listLocalPosts } from '@/lib/gbp/google-business';
import { generatePost } from '@/lib/gbp/ai-engine';
import { schedulePost, markPostPublished, markPostFailed, getScheduledPosts, getPublishedPosts, getPostStats } from '@/lib/gbp/automation-db';
import { GBP_CONFIG } from '@/lib/gbp/config';

// GET â list published & scheduled posts + stats
export async function GET() {
  const published = getPublishedPosts(50);
  const scheduled = getScheduledPosts();
  const stats = getPostStats();
  return NextResponse.json({ published, scheduled, stats });
}

// POST â generate and publish a post (or schedule it)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      postType,         // from GBP_CONFIG.postSchedule
      context = {},     // event details, offer details, etc.
      publishNow = true,
      scheduleFor,
      customText,       // override AI generation with manual text
    } = body;

    if (!postType && !customText) {
      return NextResponse.json({ error: 'Provide postType or customText' }, { status: 400 });
    }

    // 1. Generate content (AI or manual)
    let postContent;
    if (customText) {
      postContent = {
        text: customText,
        cta_text: body.ctaText || 'Learn More',
        cta_url: body.ctaUrl || GBP_CONFIG.squareBookingUrl,
        hashtags: GBP_CONFIG.hashtags.slice(0, 3).join(' '),
        post_type: 'custom',
      };
    } else {
      postContent = await generatePost(postType, context);
    }

    // 2. Schedule the post
    const fullText = `${postContent.text}\n\n${postContent.hashtags}`;
    const scheduled = schedulePost({
      text: fullText,
      postType: postContent.post_type || postType,
      ctaText: postContent.cta_text,
      ctaUrl: postContent.cta_url,
      hashtags: postContent.hashtags,
      mediaUrl: body.mediaUrl || null,
      scheduledFor: scheduleFor || new Date().toISOString(),
    });

    // 3. Publish immediately if requested
    if (publishNow) {
      try {
        const ctaTypeMap = {
          'Get Tickets': 'BOOK',
          'Book Now': 'BOOK',
          'Order Now': 'ORDER',
          'Learn More': 'LEARN_MORE',
          'Sign Up': 'SIGN_UP',
          'Call': 'CALL',
        };

        const gbpResult = await createLocalPost({
          text: fullText,
          ctaType: ctaTypeMap[postContent.cta_text] || 'LEARN_MORE',
          ctaUrl: postContent.cta_url,
          mediaUrl: body.mediaUrl,
        });

        markPostPublished(scheduled.id, gbpResult.name || gbpResult.localPostId);

        return NextResponse.json({
          success: true,
          post: { ...scheduled, status: 'published', gbpPostId: gbpResult.name },
          content: postContent,
        }, { status: 201 });

      } catch (pubErr) {
        markPostFailed(scheduled.id, pubErr.message);
        return NextResponse.json({
          success: false,
          post: { ...scheduled, status: 'failed' },
          content: postContent,
          error: pubErr.message,
        }, { status: 502 });
      }
    }

    // Just scheduled, not published yet
    return NextResponse.json({
      success: true,
      post: scheduled,
      content: postContent,
      message: `Post scheduled for ${scheduleFor}`,
    }, { status: 201 });

  } catch (err) {
    console.error('Post creation error:', err);
    return NextResponse.json({ error: 'Post creation failed' }, { status: 500 });
  }
}
