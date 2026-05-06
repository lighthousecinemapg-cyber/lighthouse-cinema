// Social Post Cron - Auto-generates social media posts
// Runs at 8 AM, 4 PM, 6:30 PM via Vercel Cron
import { NextResponse } from "next/server";
import { movies, isMovieActive } from "../../showtime-config";

const CRON_SECRET = process.env.CRON_SECRET;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_FROM;
const OWNER_PHONE = process.env.OWNER_PHONE;

function verifyCron(req) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== "Bearer " + CRON_SECRET) return false;
  return true;
}

function getTimeSlot() {
  const now = new Date();
  const pst = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const hour = pst.getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getActiveMovies() {
  return movies.filter(m => m.active && isMovieActive(m));
}

function buildMorningPost(activeMovies) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Los_Angeles"
  });
  const movieList = activeMovies.map(m => {
    const times = m.showtimes ? m.showtimes.join(", ") : "1 PM, 4 PM, 7 PM";
    return m.title + " - " + times;
  }).join("\n");
  return "Good morning, Pacific Grove! Here is what is showing today at Lighthouse Cinema (" + today + "):\n\n" + movieList + "\n\nGet your tickets at lighthousepgcinema.com\n\n#LighthouseCinema #PacificGrove #MovieNight #SupportLocal";
}

function buildAfternoonPost(activeMovies) {
  const featured = activeMovies[0];
  if (!featured) return null;
  return "This afternoon at Lighthouse Cinema: " + featured.title + "!\n\n" + (featured.description || "Join us for a great movie experience.") + "\n\nShowtimes today: 4 PM & 7 PM\nTickets: lighthousepgcinema.com\n\n#LighthouseCinema #PacificGrove #NowShowing";
}

function buildEveningPost(activeMovies) {
  const featured = activeMovies[Math.floor(Math.random() * activeMovies.length)];
  if (!featured) return null;
  return "Tonight at Lighthouse Cinema! Last showing at 7 PM:\n\n" + featured.title + "\n\nDo not miss it - get your tickets now at lighthousepgcinema.com\n\nPay It Forward: Buy a ticket for someone who cannot afford one!\n\n#LighthouseCinema #PacificGrove #MovieNight #PayItForward";
}

async function sendSMS(body) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM || !OWNER_PHONE) return false;
  const url = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json";
  const auth = Buffer.from(TWILIO_SID + ":" + TWILIO_TOKEN).toString("base64");
  const params = new URLSearchParams({
    To: OWNER_PHONE,
    From: TWILIO_FROM,
    Body: body
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });
  return res.ok;
}

export async function GET(req) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const activeMovies = getActiveMovies();
    if (activeMovies.length === 0) {
      return NextResponse.json({ success: true, message: "No active movies, skipping post" });
    }
    const slot = getTimeSlot();
    let post = null;
    if (slot === "morning") {
      post = buildMorningPost(activeMovies);
    } else if (slot === "afternoon") {
      post = buildAfternoonPost(activeMovies);
    } else {
      post = buildEveningPost(activeMovies);
    }
    if (!post) {
      return NextResponse.json({ success: true, message: "No post generated" });
    }
    // Send post content via SMS for owner to copy-paste to social media
    // Future: integrate Meta Graph API for direct Facebook/Instagram posting
    const smsSent = await sendSMS("SOCIAL POST READY (" + slot + "):\n\n" + post);
    return NextResponse.json({
      success: true,
      slot,
      post,
      smsSent,
      activeMovies: activeMovies.map(m => m.title)
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
 
