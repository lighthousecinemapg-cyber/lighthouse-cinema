// ================================================================
// CINEMAX AI ENGINE â Content generation & review response
// Uses OpenAI GPT-4o, Gemini 1.5 Pro, or Claude via API
// ================================================================

import { GBP_CONFIG } from './config.js';

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' | 'gemini' | 'claude'
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o';

// ââ System prompt for all AI calls ââ
const SYSTEM_PROMPT = `You are CineMax AI, the autonomous marketing director for ${GBP_CONFIG.businessName} in ${GBP_CONFIG.location}.

BRAND VOICE: ${GBP_CONFIG.brandVoice}

SEO KEYWORDS (weave naturally into every output): ${GBP_CONFIG.seoKeywords.join(', ')}

BUSINESS INFO:
- Address: ${GBP_CONFIG.address}
- Phone: ${GBP_CONFIG.phone}
- Website: ${GBP_CONFIG.website}
- Booking: ${GBP_CONFIG.squareBookingUrl}

RULES:
1. Never post false information.
2. Never argue with negative reviewers â always de-escalate.
3. You are an AI. You cannot physically handle refunds, but you can generate coupon codes and direct to the manager's email.
4. Keep GBP posts under 300 characters. Include a CTA and 2-3 hashtags.
5. Include "Pacific Grove" or "Monterey" in every post naturally.
6. Use emojis sparingly: ð¬ ð¿ ðï¸ â¨ ð­ only.
7. When generating structured data, return valid JSON.`;

// ââ Call AI provider ââ
async function callAI(userPrompt, options = {}) {
  const { temperature = 0.8, maxTokens = 500, jsonMode = false } = options;

  if (AI_PROVIDER === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (AI_PROVIDER === 'gemini') {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (AI_PROVIDER === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': AI_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
}

// ================================================================
// REVIEW RESPONSE GENERATOR
// ================================================================

export async function generateReviewResponse(review) {
  const { reviewerName, starRating, reviewText, reviewDate } = review;

  // Classify the review
  const category = classifyReview(starRating, reviewText);

  const prompt = `Generate a reply to this Google review for ${GBP_CONFIG.businessName}.

REVIEW:
- Reviewer: ${reviewerName}
- Rating: ${starRating}/5 stars
- Text: "${reviewText || '(no text, just stars)'}"
- Date: ${reviewDate}

CATEGORY: ${category}
STRATEGY: ${GBP_CONFIG.reviewCategories[category]?.strategy}

${starRating <= 2 ? `IMPORTANT: This is a negative review. Be empathetic, take ownership, and offer resolution. Direct them to ${GBP_CONFIG.email} for the manager.` : ''}

${!reviewText ? 'The reviewer left only stars with no text. Write a brief, warm reply.' : ''}

${starRating >= 4 ? 'End with a subtle invitation to visit again or try one of our events.' : ''}

Reply in 2-4 sentences. Sign off as "â The Lighthouse Cinema Team"`;

  const reply = await callAI(prompt, { temperature: 0.7 });

  return {
    category,
    reply: reply.trim(),
    escalate: starRating <= 2,
    couponCode: starRating === 3 ? generateCouponCode() : null,
  };
}

function classifyReview(stars, text) {
  const lowerText = (text || '').toLowerCase();

  if (!text || text.trim().length === 0) return 'stars_only';

  // Check for questions first
  if (GBP_CONFIG.reviewCategories.question.keywords.some(k => lowerText.includes(k))) {
    return 'question';
  }

  // Check for suggestions
  if (GBP_CONFIG.reviewCategories.suggestion.keywords.some(k => lowerText.includes(k)) && stars >= 3) {
    return 'suggestion';
  }

  // By star rating
  if (stars === 5) return 'enthusiastic_5star';
  if (stars === 4) return 'positive_4star';
  if (stars === 3) return 'neutral_3star';
  if (stars === 2) return 'negative_2star';
  if (stars === 1) return 'angry_1star';

  return 'stars_only';
}

function generateCouponCode() {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `${GBP_CONFIG.couponPrefix}-${suffix}`;
}

// ================================================================
// POST CONTENT GENERATOR
// ================================================================

export async function generatePost(postType, context = {}) {
  const { eventTitle, eventTime, ticketUrl, offerDetails, movieFact, staffName } = context;
  const hashtagSet = pickRandom(GBP_CONFIG.hashtags, 3).join(' ');

  const typePrompts = {
    morning_greeting: `Write a cheerful "Good morning Pacific Grove!" post for ${GBP_CONFIG.businessName}. Mention today's first screening${eventTitle ? `: "${eventTitle}" at ${eventTime}` : ''}. Include a "ðï¸ Get Tickets" CTA pointing to ${GBP_CONFIG.squareBookingUrl}.`,

    photo_update: `Write a short post to accompany a photo of our concession stand or lobby. Make it warm and inviting â mention our gourmet popcorn, crepes, or craft cocktails. CTA: "Visit us on Lighthouse Ave!"`,

    lunch_offer: `Write a lunchtime special post. ${offerDetails ? `Today's offer: ${offerDetails}` : 'Create a compelling combo deal (e.g., ticket + popcorn + drink)'}. Include a sense of urgency. CTA: "ð¿ Grab the deal"`,

    behind_scenes: `Write a behind-the-scenes post. ${staffName ? `Feature our team member ${staffName}` : 'Show our staff prepping the theater for tonight'}. Make it personal and authentic. CTA: "Come see us tonight!"`,

    trivia: `Write a fun movie trivia or fun fact post. ${movieFact ? `Use this fact: ${movieFact}` : 'Create an interesting movie fact related to tonight\'s screening'}. Make it engaging and ask the audience to comment. CTA: "Know the answer? Tell us!"`,

    urgency_cta: `Write an urgency post: "Last chance for tonight's show!" ${eventTitle ? `The film is "${eventTitle}" at ${eventTime}` : ''}. Create FOMO. CTA: "ð¬ Book now â limited seats!"`,

    event_highlight: `Write a spotlight post for tonight's event at ${GBP_CONFIG.businessName}. ${eventTitle ? `Event: "${eventTitle}"` : 'Highlight our unique cinema experience'}. Make it exciting. CTA: "ðï¸ Reserve your seat"`,

    engagement: `Write a post-show engagement post asking viewers to share their experience or leave a review. Be warm and grateful. CTA: "Rate us on Google!"`,

    tomorrow_preview: `Write a sneak peek post about tomorrow's schedule at ${GBP_CONFIG.businessName}. Build anticipation. CTA: "ð¬ See what's showing"`,

    late_night: `Write a late-night offer post. ${offerDetails ? offerDetails : 'Create a special deal for late-night moviegoers (e.g., discounted tickets or midnight screening)'}. Make it fun and slightly mysterious. CTA: "ð Night owl special"`,

    community_shoutout: `Write a community shout-out post. Thank the Pacific Grove community for their support. Mention a local event, business, or landmark. CTA: "We love PG!"`,

    weather_based: `Write a "perfect movie night" post based on cozy weather. Encourage people to escape to the cinema. CTA: "ð¿ Warm seats, warm popcorn"`,
  };

  const prompt = `${typePrompts[postType] || typePrompts.engagement}

REQUIREMENTS:
- Under 300 characters for the main text
- Include a CTA button text suggestion
- End with 2-3 hashtags from: ${hashtagSet}
- Mention Pacific Grove or Monterey naturally
- Return as JSON: {"text": "...", "cta_text": "...", "cta_url": "${GBP_CONFIG.squareBookingUrl}", "hashtags": "...", "post_type": "${postType}"}`;

  const result = await callAI(prompt, { temperature: 0.9, jsonMode: true });

  try {
    return JSON.parse(result);
  } catch {
    // Fallback: wrap raw text
    return {
      text: result.slice(0, 300),
      cta_text: 'Learn More',
      cta_url: GBP_CONFIG.squareBookingUrl,
      hashtags: hashtagSet,
      post_type: postType,
    };
  }
}

// ================================================================
// COMPETITOR COUNTER-OFFER GENERATOR
// ================================================================

export async function generateCounterOffer(competitorName, competitorPromo) {
  const prompt = `Our competitor "${competitorName}" just posted this promotion: "${competitorPromo}"

Generate a counter-offer post for ${GBP_CONFIG.businessName} that:
1. Does NOT mention the competitor by name
2. Highlights our unique value (boutique experience, gourmet concessions, intimate seating)
3. Includes a better deal or unique angle
4. Under 300 characters
5. Returns JSON: {"text": "...", "cta_text": "...", "our_offer": "..."}`;

  const result = await callAI(prompt, { temperature: 0.85, jsonMode: true });
  try { return JSON.parse(result); } catch { return { text: result, cta_text: 'Book Now', our_offer: '' }; }
}

// ================================================================
// PHOTO CAPTION GENERATOR
// ================================================================

export async function generatePhotoCaption(photoCategory) {
  const prompt = `Write a Google Business Profile photo caption for a ${photoCategory.replace(/_/g, ' ')} photo at ${GBP_CONFIG.businessName} in Pacific Grove. Under 100 characters. Include one emoji and one SEO keyword.`;

  return (await callAI(prompt, { temperature: 0.8, maxTokens: 80 })).trim();
}

// ================================================================
// WEEKLY REPORT GENERATOR
// ================================================================

export async function generateWeeklyReport(metrics) {
  const prompt = `Generate a concise weekly performance summary for ${GBP_CONFIG.businessName}'s Google Business Profile.

METRICS:
- New reviews this week: ${metrics.newReviews}
- Average rating: ${metrics.avgRating}/5
- Review response time: ${metrics.avgResponseTime} minutes
- Posts published: ${metrics.postsPublished}
- Total post impressions: ${metrics.totalImpressions}
- CTA clicks: ${metrics.ctaClicks}
- Tickets sold from GBP: ${metrics.ticketsFromGBP}
- Photo views: ${metrics.photoViews}

Return a brief, actionable summary with 3 recommendations. Format as JSON:
{"summary": "...", "highlights": ["...", "..."], "recommendations": ["...", "...", "..."], "grade": "A/B/C/D"}`;

  const result = await callAI(prompt, { jsonMode: true });
  try { return JSON.parse(result); } catch { return { summary: result, highlights: [], recommendations: [], grade: 'B' }; }
}

// ââ Utility ââ
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
