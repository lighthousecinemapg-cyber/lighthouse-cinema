'use client';
import { useState, useEffect } from 'react';

export default function GBPDashboard() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState({ responses: [], stats: {} });
  const [posts, setPosts] = useState({ published: [], scheduled: [], stats: {} });
  const [competitors, setCompetitors] = useState({ competitors: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [aRes, rRes, pRes, cRes] = await Promise.all([
        fetch('/api/gbp/analytics').then(r => r.json()),
        fetch('/api/gbp/reviews').then(r => r.json()),
        fetch('/api/gbp/posts').then(r => r.json()),
        fetch('/api/gbp/competitors').then(r => r.json()),
      ]);
      setAnalytics(aRes);
      setReviews(rRes);
      setPosts(pRes);
      setCompetitors(cRes);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function triggerReviewScan() {
    setActionLoading('reviews');
    await fetch('/api/gbp/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    await loadAll();
    setActionLoading('');
  }

  async function generateTodayPosts() {
    setActionLoading('posts');
    await fetch('/api/gbp/cron', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate_all_today' }) });
    await loadAll();
    setActionLoading('');
  }

  async function generateWeeklyReport() {
    setActionLoading('report');
    await fetch('/api/gbp/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    await loadAll();
    setActionLoading('');
  }

  async function syncEvents() {
    setActionLoading('sync');
    await fetch('/api/gbp/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sync_daily' }) });
    await loadAll();
    setActionLoading('');
  }

  const tabs = ['overview', 'reviews', 'posts', 'competitors', 'schedule'];

  return (
    <div className="animate-in">
      <div className="container section">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>
              <span className="gold-text">CineMax AI</span> Command Center
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Google Business Profile automation &middot; Reviews &middot; Posts &middot; Analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={triggerReviewScan} className="btn btn-outline btn-sm" disabled={!!actionLoading}>
              {actionLoading === 'reviews' ? 'Scanning...' : 'Scan Reviews'}
            </button>
            <button onClick={generateTodayPosts} className="btn btn-outline btn-sm" disabled={!!actionLoading}>
              {actionLoading === 'posts' ? 'Generating...' : 'Generate Today\'s Posts'}
            </button>
            <button onClick={syncEvents} className="btn btn-outline btn-sm" disabled={!!actionLoading}>
              {actionLoading === 'sync' ? 'Syncing...' : 'Sync to GBP'}
            </button>
            <button onClick={generateWeeklyReport} className="btn btn-gold btn-sm" disabled={!!actionLoading}>
              {actionLoading === 'report' ? 'Creating...' : 'Weekly Report'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={tab === t ? 'btn btn-gold btn-sm' : 'btn btn-dark btn-sm'}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }}></div>
          </div>
        ) : (
          <>
            {/* ââ OVERVIEW TAB ââ */}
            {tab === 'overview' && analytics && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'Reviews Handled', value: analytics.overview?.totalReviews || 0, color: 'var(--gold)' },
                    { label: 'Avg Rating', value: `${analytics.overview?.avgRating || 0}/5`, color: 'var(--success)' },
                    { label: 'Posts Published', value: analytics.overview?.totalPostsPublished || 0, color: 'var(--gold)' },
                    { label: 'Escalated', value: analytics.overview?.escalatedReviews || 0, color: 'var(--error)' },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                      borderRadius: 'var(--radius)', padding: '24px',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color, fontFamily: 'Playfair Display, serif' }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Breakdown */}
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="card-body">
                    <h3 style={{ marginBottom: '16px' }}>Review Categories</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(analytics.reviewBreakdown || {}).map(([cat, count]) => (
                        <span key={cat} className="badge badge-gold" style={{ padding: '8px 16px' }}>
                          {cat.replace(/_/g, ' ')}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post Type Breakdown */}
                <div className="card">
                  <div className="card-body">
                    <h3 style={{ marginBottom: '16px' }}>Post Types Published</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(analytics.postBreakdown || {}).map(([type, count]) => (
                        <span key={type} className="badge badge-green" style={{ padding: '8px 16px' }}>
                          {type.replace(/_/g, ' ')}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ââ REVIEWS TAB ââ */}
            {tab === 'reviews' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Handled</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--gold)' }}>{reviews.stats?.total || 0}</div>
                  </div>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Rating</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>{reviews.stats?.avgRating || 'â'}/5</div>
                  </div>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escalated</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--error)' }}>{reviews.stats?.escalated || 0}</div>
                  </div>
                </div>

                {reviews.responses?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <p>No reviews processed yet. Click "Scan Reviews" to start.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.responses.map((r, i) => (
                      <div key={i} className="card">
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: '700' }}>{r.reviewerName}</span>
                              <span style={{ color: 'var(--gold)' }}>{'â'.repeat(r.starRating)}{'â'.repeat(5 - r.starRating)}</span>
                              <span className={`badge ${r.escalated ? 'badge-red' : 'badge-gold'}`}>{r.category?.replace(/_/g, ' ')}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {r.respondedAt ? new Date(r.respondedAt).toLocaleString() : ''}
                            </span>
                          </div>
                          {r.reviewText && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px', fontStyle: 'italic' }}>
                              "{r.reviewText}"
                            </p>
                          )}
                          <div style={{ background: 'var(--dark-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--dark-border)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px', fontWeight: '600' }}>AI REPLY:</div>
                            <p style={{ fontSize: '0.9rem' }}>{r.aiReply}</p>
                          </div>
                          {r.couponCode && (
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--warning)' }}>
                              Coupon issued: <strong>{r.couponCode}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ââ POSTS TAB ââ */}
            {tab === 'posts' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Published</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>{posts.stats?.totalPublished || 0}</div>
                  </div>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scheduled</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--gold)' }}>{posts.scheduled?.length || 0}</div>
                  </div>
                  <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius)', padding: '20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Failed</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--error)' }}>{posts.stats?.totalFailed || 0}</div>
                  </div>
                </div>

                <h3 style={{ marginBottom: '16px' }}>Published Posts</h3>
                {posts.published?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No posts published yet. Click "Generate Today's Posts" to start.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {posts.published.map((p, i) => (
                      <div key={i} className="card">
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span className="badge badge-green">{p.postType?.replace(/_/g, ' ')}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {p.publishedAt ? new Date(p.publishedAt).toLocaleString() : ''}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{p.text}</p>
                          {p.ctaText && (
                            <span className="btn btn-gold btn-sm" style={{ pointerEvents: 'none' }}>
                              {p.ctaText}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {posts.scheduled?.length > 0 && (
                  <>
                    <h3 style={{ margin: '32px 0 16px' }}>Scheduled Posts</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {posts.scheduled.map((p, i) => (
                        <div key={i} className="card" style={{ borderColor: 'var(--gold)', borderWidth: '1px' }}>
                          <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span className="badge badge-gold">{p.postType?.replace(/_/g, ' ')}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                                Scheduled: {new Date(p.scheduledFor).toLocaleString()}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem' }}>{p.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ââ COMPETITORS TAB ââ */}
            {tab === 'competitors' && (
              <div>
                <h3 style={{ marginBottom: '16px' }}>Monitored Competitors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                  {competitors.competitors?.map((c, i) => (
                    <div key={i} style={{
                      background: 'var(--dark-card)', border: '1px solid var(--dark-border)',
                      borderRadius: 'var(--radius)', padding: '20px',
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{c.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.location}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ marginBottom: '16px' }}>Recent Activity</h3>
                {competitors.activity?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No competitor activity logged yet. Log competitor promotions via the API.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {competitors.activity.map((a, i) => (
                      <div key={i} className="card">
                        <div className="card-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600' }}>{a.competitorName}</span>
                            <span className="badge badge-red">{a.activityType}</span>
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                            {a.content}
                          </p>
                          {a.ourCounterOffer && (
                            <div style={{ background: 'var(--dark-elevated)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold)' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginBottom: '4px', fontWeight: '600' }}>OUR COUNTER-OFFER:</div>
                              <p style={{ fontSize: '0.9rem' }}>{a.ourCounterOffer.text || JSON.stringify(a.ourCounterOffer)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ââ SCHEDULE TAB ââ */}
            {tab === 'schedule' && (
              <div>
                <h3 style={{ marginBottom: '16px' }}>Daily Post Schedule (PST)</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>CineMax AI generates and publishes posts automatically at these times.</p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Post Type</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: '8:00 AM', type: 'morning_greeting', desc: 'Good morning + today\'s first screening highlight' },
                        { time: '9:00 AM', type: 'photo_upload', desc: 'Daily photo #1 (lobby / concession)' },
                        { time: '10:00 AM', type: 'photo_update', desc: 'Concession stand or lobby photo post' },
                        { time: '12:00 PM', type: 'lunch_offer', desc: 'Lunchtime discount or combo deal' },
                        { time: '1:00 PM', type: 'photo_upload', desc: 'Daily photo #2 (auditorium / event)' },
                        { time: '2:00 PM', type: 'behind_scenes', desc: 'Behind-the-scenes or staff pick' },
                        { time: '4:00 PM', type: 'trivia', desc: 'Movie trivia or fun fact' },
                        { time: '5:00 PM', type: 'photo_upload', desc: 'Daily photo #3 (marquee / exterior)' },
                        { time: '6:00 PM', type: 'urgency_cta', desc: 'Last chance for tonight\'s show' },
                        { time: '7:00 PM', type: 'event_highlight', desc: 'Tonight\'s event spotlight' },
                        { time: '8:00 PM', type: 'engagement', desc: 'Ask for review / audience quote' },
                        { time: '9:00 PM', type: 'tomorrow_preview', desc: 'Sneak peek of tomorrow' },
                        { time: '10:00 PM', type: 'late_night', desc: 'Late-night offer or midnight screening' },
                      ].map((s, i) => (
                        <tr key={i}>
                          <td style={{ color: 'var(--gold)', fontWeight: '600' }}>{s.time}</td>
                          <td><span className="badge badge-gold">{s.type.replace(/_/g, ' ')}</span></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{s.desc}</td>
                          <td><span className="badge badge-green">Active</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
