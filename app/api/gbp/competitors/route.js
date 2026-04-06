import { NextResponse } from 'next/server';
import { GBP_CONFIG } from '@/lib/gbp/config';
import { generateCounterOffer } from '@/lib/gbp/ai-engine';
import { logCompetitorActivity, getCompetitorData } from '@/lib/gbp/automation-db';

// GET â list competitor activity
export async function GET() {
  const data = getCompetitorData(50);
  return NextResponse.json({
    competitors: GBP_CONFIG.competitors,
    activity: data,
  });
}

// POST â log competitor activity and generate counter-offer
export async function POST(request) {
  try {
    const body = await request.json();
    const { competitorName, activityType, content } = body;

    if (!competitorName || !content) {
      return NextResponse.json({ error: 'competitorName and content required' }, { status: 400 });
    }

    // Generate AI counter-offer
    let counterOffer = null;
    if (activityType === 'promotion' || activityType === 'price_change') {
      counterOffer = await generateCounterOffer(competitorName, content);
    }

    const entry = logCompetitorActivity({
      competitorName,
      activityType: activityType || 'new_post',
      content,
      ourCounterOffer: counterOffer,
    });

    return NextResponse.json({
      success: true,
      entry,
      counterOffer,
      message: counterOffer
        ? 'Counter-offer generated! Review it before publishing.'
        : 'Activity logged.',
    }, { status: 201 });

  } catch (err) {
    console.error('Competitor tracking error:', err);
    return NextResponse.json({ error: 'Failed to process competitor data' }, { status: 500 });
  }
}
