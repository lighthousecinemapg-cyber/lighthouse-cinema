// ================================================================
// GOOGLE BUSINESS PROFILE API CLIENT
// Handles: reviews, posts, photos, attributes, Q&A
// ================================================================

const GBP_ACCOUNT_ID = process.env.GBP_ACCOUNT_ID;
const GBP_LOCATION_ID = process.env.GBP_LOCATION_ID;
const GBP_ACCESS_TOKEN = process.env.GBP_ACCESS_TOKEN; // OAuth 2.0

const BASE_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const REVIEWS_URL = 'https://mybusiness.googleapis.com/v4';
const POSTS_URL = 'https://mybusiness.googleapis.com/v4';

async function gbpFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GBP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`GBP API error [${response.status}]:`, err);
    throw new Error(`GBP API ${response.status}: ${err}`);
  }

  return response.json();
}

// ================================================================
// REVIEWS
// ================================================================

export async function fetchReviews(pageSize = 50, pageToken = null) {
  const url = new URL(`${REVIEWS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/reviews`);
  url.searchParams.set('pageSize', pageSize);
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  return gbpFetch(url.toString());
}

export async function replyToReview(reviewId, replyText) {
  const url = `${REVIEWS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/reviews/${reviewId}/reply`;

  return gbpFetch(url, {
    method: 'PUT',
    body: JSON.stringify({ comment: replyText }),
  });
}

export async function getNewUnrepliedReviews() {
  const data = await fetchReviews(50);
  const reviews = data.reviews || [];

  return reviews.filter(r => !r.reviewReply).map(r => ({
    reviewId: r.reviewId,
    reviewerName: r.reviewer?.displayName || 'A customer',
    starRating: starToNumber(r.starRating),
    reviewText: r.comment || '',
    reviewDate: r.createTime,
    updateTime: r.updateTime,
  }));
}

function starToNumber(starStr) {
  const map = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  return map[starStr] || 3;
}

// ================================================================
// LOCAL POSTS
// ================================================================

export async function createLocalPost({ text, ctaType, ctaUrl, mediaUrl, eventStart, eventEnd, offerTerms }) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/localPosts`;

  const postBody = {
    languageCode: 'en',
    summary: text,
    topicType: eventStart ? 'EVENT' : (offerTerms ? 'OFFER' : 'STANDARD'),
  };

  // Call-to-action
  if (ctaType && ctaUrl) {
    postBody.callToAction = {
      actionType: ctaType, // BOOK, ORDER, LEARN_MORE, SIGN_UP, CALL
      url: ctaUrl,
    };
  }

  // Media
  if (mediaUrl) {
    postBody.media = [{
      mediaFormat: mediaUrl.endsWith('.mp4') ? 'VIDEO' : 'PHOTO',
      sourceUrl: mediaUrl,
    }];
  }

  // Event dates
  if (eventStart) {
    postBody.event = {
      title: text.split('\n')[0] || 'Lighthouse Cinema Event',
      schedule: {
        startDate: toGoogleDate(eventStart),
        startTime: toGoogleTime(eventStart),
        endDate: toGoogleDate(eventEnd || eventStart),
        endTime: toGoogleTime(eventEnd || new Date(new Date(eventStart).getTime() + 2 * 3600000)),
      },
    };
  }

  // Offer
  if (offerTerms) {
    postBody.offer = {
      couponCode: offerTerms.couponCode || '',
      termsConditions: offerTerms.terms || 'While supplies last.',
    };
  }

  return gbpFetch(url, { method: 'POST', body: JSON.stringify(postBody) });
}

export async function listLocalPosts(pageSize = 20) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/localPosts?pageSize=${pageSize}`;
  return gbpFetch(url);
}

export async function deleteLocalPost(postId) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/localPosts/${postId}`;
  return gbpFetch(url, { method: 'DELETE' });
}

// ================================================================
// PHOTOS / MEDIA
// ================================================================

export async function uploadPhoto({ photoUrl, category, description }) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/media`;

  return gbpFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      mediaFormat: 'PHOTO',
      sourceUrl: photoUrl,
      locationAssociation: {
        category: category || 'ADDITIONAL', // COVER, PROFILE, LOGO, ADDITIONAL
      },
      description: description || '',
    }),
  });
}

export async function listPhotos() {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/media`;
  return gbpFetch(url);
}

// ================================================================
// Q&A
// ================================================================

export async function fetchQuestions() {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/questions`;
  return gbpFetch(url);
}

export async function answerQuestion(questionId, answerText) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/questions/${questionId}/answers`;
  return gbpFetch(url, {
    method: 'POST',
    body: JSON.stringify({ text: answerText }),
  });
}

// ================================================================
// INSIGHTS / ANALYTICS
// ================================================================

export async function getInsights(startDate, endDate) {
  const url = `${POSTS_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}:reportInsights`;

  return gbpFetch(url, {
    method: 'POST',
    body: JSON.stringify({
      locationNames: [`accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}`],
      basicRequest: {
        metricRequests: [
          { metric: 'ALL' },
        ],
        timeRange: {
          startTime: startDate,
          endTime: endDate,
        },
      },
    }),
  });
}

// ================================================================
// ATTRIBUTES (update hours, accessibility, etc.)
// ================================================================

export async function updateAttributes(attributes) {
  const url = `${BASE_URL}/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}`;

  return gbpFetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ attributes }),
  });
}

// ââ Date helpers ââ
function toGoogleDate(date) {
  const d = new Date(date);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function toGoogleTime(date) {
  const d = new Date(date);
  return { hours: d.getHours(), minutes: d.getMinutes(), seconds: 0 };
}
