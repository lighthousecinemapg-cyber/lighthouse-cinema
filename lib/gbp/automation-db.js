// ================================================================
// GBP AUTOMATION â In-Memory Database
// Tracks: review responses, scheduled posts, analytics, competitors
// Replace with PostgreSQL/Supabase for production
// ================================================================

import { v4 as uuidv4 } from 'uuid';

// ââ Review Responses ââ
const reviewResponses = [];

export function logReviewResponse({ reviewId, reviewerName, starRating, reviewText, aiReply, category, escalated, couponCode }) {
  const entry = {
    id: uuidv4(),
    reviewId,
    reviewerName,
    starRating,
    reviewText,
    aiReply,
    category,
    escalated: escalated || false,
    couponCode: couponCode || null,
    respondedAt: new Date().toISOString(),
    approved: true, // set to false for draft mode
  };
  reviewResponses.push(entry);
  return entry;
}

export function getReviewResponses(limit = 50) {
  return reviewResponses.slice(-limit).reverse();
}

export function getReviewStats() {
  const total = reviewResponses.length;
  const avgRating = total > 0
    ? (reviewResponses.reduce((s, r) => s + r.starRating, 0) / total).toFixed(1)
    : 0;
  const escalated = reviewResponses.filter(r => r.escalated).length;
  const byCategory = {};
  reviewResponses.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });
  return { total, avgRating, escalated, byCategory };
}

// ââ Scheduled Posts ââ
const scheduledPosts = [];
const publishedPosts = [];

export function schedulePost({ text, postType, ctaText, ctaUrl, hashtags, mediaUrl, scheduledFor }) {
  const post = {
    id: uuidv4(),
    text,
    postType,
    ctaText,
    ctaUrl,
    hashtags,
    mediaUrl: mediaUrl || null,
    scheduledFor: scheduledFor || new Date().toISOString(),
    status: 'scheduled', // scheduled, published, failed, draft
    createdAt: new Date().toISOString(),
    impressions: 0,
    clicks: 0,
  };
  scheduledPosts.push(post);
  return post;
}

export function getScheduledPosts() {
  return scheduledPosts.filter(p => p.status === 'scheduled');
}

export function markPostPublished(postId, gbpPostId) {
  const post = scheduledPosts.find(p => p.id === postId);
  if (post) {
    post.status = 'published';
    post.gbpPostId = gbpPostId;
    post.publishedAt = new Date().toISOString();
    publishedPosts.push({ ...post });
  }
  return post;
}

export function markPostFailed(postId, error) {
  const post = scheduledPosts.find(p => p.id === postId);
  if (post) {
    post.status = 'failed';
    post.error = error;
  }
  return post;
}

export function getPublishedPosts(limit = 50) {
  return publishedPosts.slice(-limit).reverse();
}

export function getPostStats() {
  return {
    totalScheduled: scheduledPosts.length,
    totalPublished: publishedPosts.length,
    totalFailed: scheduledPosts.filter(p => p.status === 'failed').length,
    byType: publishedPosts.reduce((acc, p) => {
      acc[p.postType] = (acc[p.postType] || 0) + 1;
      return acc;
    }, {}),
    totalImpressions: publishedPosts.reduce((s, p) => s + (p.impressions || 0), 0),
    totalClicks: publishedPosts.reduce((s, p) => s + (p.clicks || 0), 0),
  };
}

// ââ Competitor Intel ââ
const competitorData = [];

export function logCompetitorActivity({ competitorName, activityType, content, ourCounterOffer }) {
  const entry = {
    id: uuidv4(),
    competitorName,
    activityType, // 'promotion', 'new_post', 'price_change'
    content,
    ourCounterOffer: ourCounterOffer || null,
    detectedAt: new Date().toISOString(),
  };
  competitorData.push(entry);
  return entry;
}

export function getCompetitorData(limit = 20) {
  return competitorData.slice(-limit).reverse();
}

// ââ Photo Uploads ââ
const photoUploads = [];

export function logPhotoUpload({ category, photoUrl, caption, gbpMediaId }) {
  const entry = {
    id: uuidv4(),
    category,
    photoUrl,
    caption,
    gbpMediaId,
    uploadedAt: new Date().toISOString(),
    views: 0,
  };
  photoUploads.push(entry);
  return entry;
}

export function getPhotoUploads(limit = 30) {
  return photoUploads.slice(-limit).reverse();
}

// ââ Analytics Snapshots ââ
const analyticsHistory = [];

export function saveAnalyticsSnapshot(metrics) {
  const entry = {
    id: uuidv4(),
    ...metrics,
    capturedAt: new Date().toISOString(),
  };
  analyticsHistory.push(entry);
  return entry;
}

export function getAnalyticsHistory(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return analyticsHistory.filter(a => new Date(a.capturedAt) >= cutoff);
}

// ââ Coupon Tracking ââ
const couponsIssued = [];

export function logCoupon({ code, reviewId, reviewerName }) {
  const entry = { code, reviewId, reviewerName, issuedAt: new Date().toISOString(), redeemed: false };
  couponsIssued.push(entry);
  return entry;
}

export function getCoupons() {
  return couponsIssued;
}
