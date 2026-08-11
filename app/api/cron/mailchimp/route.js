// app/api/cron/mailchimp/route.js
// AUTONOMOUS Mailchimp email engine - runs daily via Vercel Cron.
// Reads the LIVE website schedule (single source of truth), builds the
// correct email for today's Pacific weekday, and sends it via Mailchimp.
// Never sends stale showtimes: content is pulled fresh at send time.
import { NextResponse } from "next/server";
import { sendCinemaCampaign } from "@/lib/mailchimp";

export const dynamic = "force-dynamic";
const CRON_SECRET = process.env.CRON_SECRET;
const SITE = "https://www.lighthousepgcinema.com";

function lhcEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildDailyCinemaEmail(day, movies, deal) {
  const dateLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const rows = movies.map(function (m) {
    return '<tr><td style="padding:16px 0;border-top:1px solid #2a2a2a;">'
      + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
      + '<td width="96" valign="top"><img src="' + lhcEsc(m.poster) + '" width="84" style="border-radius:8px;display:block" alt="' + lhcEsc(m.title) + '"/></td>'
      + '<td valign="top" style="font-family:Arial,Helvetica,sans-serif;padding-left:12px">'
      + '<div style="color:#ffffff;font-size:18px;font-weight:bold">' + lhcEsc(m.title) + '</div>'
      + '<div style="color:#9a9a9a;font-size:12px;margin:3px 0 8px">' + lhcEsc(m.rating || 'NR') + (m.runtime ? ' &middot; ' + lhcEsc(m.runtime) : '') + '</div>'
      + '<div style="color:#d4af37;font-size:15px;font-weight:bold">' + (m.todayShowtimes || []).map(lhcEsc).join('  &middot;  ') + '</div>'
      + '<a href="' + SITE + '/tickets" style="display:inline-block;margin-top:10px;background:#d4af37;color:#0a0a0a;font-size:13px;font-weight:bold;padding:9px 18px;border-radius:7px;text-decoration:none">Buy Tickets</a>'
      + '</td></tr></table></td></tr>';
  }).join('');
  const dealBanner = deal
    ? '<tr><td align="center" style="background:#d4af37;color:#0a0a0a;font-family:Arial;font-weight:bold;font-size:16px;padding:10px;border-radius:8px">All movies ' + deal + ' today</td></tr><tr><td height="8"></td></tr>'
    : '';
  return '<!doctype html><html><body style="margin:0;padding:0;background:#0a0a0a">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0a0a0a;padding:24px 20px">'
    + '<tr><td style="font-family:Georgia,serif;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:.5px">Lighthouse <span style="color:#d4af37">Cinema</span></td></tr>'
    + '<tr><td style="font-family:Arial;color:#9a9a9a;font-size:13px;padding:4px 0 14px">Keep movie nights local - your neighborhood cinema &middot; ' + lhcEsc(dateLabel) + '</td></tr>'
    + dealBanner
    + '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' + rows + '</table></td></tr>'
    + '<tr><td align="center" style="padding:24px 0 10px"><a href="' + SITE + '/tickets" style="background:#d4af37;color:#0a0a0a;font-family:Arial;font-weight:bold;font-size:17px;padding:15px 40px;border-radius:10px;text-decoration:none">Buy Tickets</a></td></tr>'
    + '<tr><td align="center" style="font-family:Arial;font-size:13px;padding:6px 0">'
    + '<a href="' + SITE + '/corporate-events" style="color:#d4af37;text-decoration:none;margin:0 7px">Private Rentals</a> &middot; '
    + '<a href="' + SITE + '/birthday-parties" style="color:#d4af37;text-decoration:none;margin:0 7px">Birthday Parties</a> &middot; '
    + '<a href="' + SITE + '/gift-cards" style="color:#d4af37;text-decoration:none;margin:0 7px">Gift Cards</a>'
    + '</td></tr>'
    + '<tr><td align="center" style="font-family:Arial;color:#6a6a6a;font-size:12px;padding:18px 0 0">525 Lighthouse Ave, Pacific Grove, CA &middot; (831) 717-3124 &middot; Closed Mondays</td></tr>'
    + '</table></td></tr></table></body></html>';
}

async function runDailyCinemaEmail() {
  const TZ = 'America/Los_Angeles';
  const day = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long' }).format(new Date());
  const DEAL = { Tuesday: '$7', Wednesday: '$10', Thursday: '$10', Friday: '$15', Saturday: '$15', Sunday: '$10' };
  const PLAN = {
    Tuesday:  { subject: '$7 Movie Day is ON at Lighthouse', preview: 'Every seat, every showtime just $7 today.' },
    Thursday: { subject: 'Your weekend at Lighthouse - showtimes inside', preview: 'Plan your Friday and Saturday movie night.' },
    Friday:   { subject: 'Tonight and this weekend at Lighthouse', preview: 'Grab your seats before they are gone.' },
    Saturday: { subject: 'Today at Lighthouse - now playing', preview: 'Tonights showtimes plus concessions.' },
    Sunday:   { subject: 'Coming next week at Lighthouse', preview: 'Family day today plus whats next.' },
  };
  const plan = PLAN[day];
  if (day === 'Monday' || !plan) return { skipped: 'closed/no-plan', day: day };
  const res = await fetch(SITE + '/api/schedule', { cache: 'no-store' });
  const sched = await res.json();
  const movies = (sched.nowPlaying || []).filter(function (m) { return (m.todayShowtimes || []).length; });
  if (!movies.length) return { skipped: 'no showtimes', day: day };
  const html = buildDailyCinemaEmail(day, movies, DEAL[day]);
  const result = await sendCinemaCampaign({ subject: plan.subject, previewText: plan.preview, html: html });
  return { day: day, movies: movies.length, result: result };
}

export async function GET(req) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== "Bearer " + CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyCinemaEmail();
    return NextResponse.json({ ok: true, result: result });
  } catch (err) {
    const msg = err && err.message ? err.message : "failed";
    const needsConfig = /environment variables/.test(msg);
    return NextResponse.json(
      { ok: false, needsConfig: needsConfig, error: needsConfig ? "Set MAILCHIMP_API_KEY / MAILCHIMP_AUDIENCE_ID / MAILCHIMP_SERVER_PREFIX in Vercel." : msg },
      { status: needsConfig ? 200 : 502 }
    );
  }
}

