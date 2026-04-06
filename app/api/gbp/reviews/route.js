import { NextResponse } from 'next/server';
import { getNewUnrepliedReviews, replyToReview } from '@/lib/gbp/google-business';
import { generateReviewResponse } from '@/lib/gbp/ai-engine';
import { logReviewResponse, getReviewResponses, getReviewStats, logCoupon } from '@/lib/gbp/automation-db';

// GET â fetch all logged review responses + stats
export async function GET() {
  const responses = getReviewResponses(100);
  const stats = getReviewStats();
  return NextResponse.json({ responses, stats });
}

// POST â run the review auto-responder
// This is called by the cron job every 15 minutes
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const draftMode = body.draftMode || false;

    // 1. Fetch unreplied reviews from GBP
    let unreplied;
    try {
      unreplied = await getNewUnrepliedReviews();
    } catch (err) {
      console.error('Failed to fetch reviews from GBP:', err.message);
      return NextResponse.json({
        error: 'Could not fetch reviews. Check GBP credentials.',
        details: err.message,
      }, { status: 502 });
    }

    if (unreplied.length === 0) {
      return NextResponse.json({ message: 'No new reviews to respond to.', processed: 0 });
    }

    const results = [];

    // 2. Generate AI responses and post them
    for (const review of unreplied) {
      try {
        // Generate response
        const aiResult = await generateReviewResponse(review);

        // Post reply to GBP (unless draft mode)
        if (!draftMode) {
          try {
            await replyToReview(review.reviewId, aiResult.reply);
          } catch (replyErr) {
            console.error(`Failed to post reply for review ${review.reviewId}:`, replyErr.message);
          }
        }

        // Log to our database
        const logged = logReviewResponse({
          reviewId: review.reviewId,
          reviewerName: review.reviewerName,
          starRating: review.starRating,
          reviewText: review.reviewText,
          aiReply: aiResult.reply,
          category: aiResult.category,
          escalated: aiResult.escalate,
          couponCode: aiResult.couponCode,
        });

        // Track coupon if issued
        if (aiResult.couponCode) {
          logCoupon({
            code: aiResult.couponCode,
            reviewId: review.reviewId,
            reviewerName: review.reviewerName,
          });
        }

        results.push({
          reviewId: review.reviewId,
          reviewerName: review.reviewerName,
          stars: review.starRating,
          category: aiResult.category,
          reply: aiResult.reply,
          escalated: aiResult.escalate,
          posted: !draftMode,
        });

      } catch (aiErr) {
        console.error(`AI generation failed for review ${review.reviewId}:`, aiErr.message);
        results.push({
          reviewId: review.reviewId,
          error: aiErr.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} reviews`,
      draftMode,
      results,
    });

  } catch (err) {
    console.error('Review auto-responder error:', err);
    return NextResponse.json({ error: 'Review processing failed' }, { status: 500 });
  }
}
