// Sales Report Cron - Runs every 2 hours via Vercel Cron
// Pulls Square orders, groups by showtime, sends SMS via Twilio
import { NextResponse } from "next/server";

const SQUARE_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION = process.env.SQUARE_LOCATION_ID;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_FROM;
const OWNER_PHONE = process.env.OWNER_PHONE;
const CRON_SECRET = process.env.CRON_SECRET;

function verifyCron(req) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== "Bearer " + CRON_SECRET) return false;
  return true;
}

function getTodayRange() {
  const now = new Date();
  const pst = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const y = pst.getFullYear();
  const m = String(pst.getMonth() + 1).padStart(2, "0");
  const d = String(pst.getDate()).padStart(2, "0");
  return {
    start: y + "-" + m + "-" + d + "T00:00:00-07:00",
    end: y + "-" + m + "-" + d + "T23:59:59-07:00",
    dateStr: y + "-" + m + "-" + d
  };
}

async function getSquareOrders() {
  const { start, end } = getTodayRange();
  const res = await fetch("https://connect.squareup.com/v2/orders/search", {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      "Authorization": "Bearer " + SQUARE_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      location_ids: [SQUARE_LOCATION],
      query: {
        filter: {
          date_time_filter: {
            created_at: { start_at: start, end_at: end }
          },
          state_filter: { states: ["COMPLETED"] }
        },
        sort: { sort_field: "CREATED_AT", sort_order: "DESC" }
      }
    })
  });
  const data = await res.json();
  return data.orders || [];
}

function groupByShowtime(orders) {
  const results = {
    "1 PM": { tickets: 0, revenue: 0 },
    "4 PM": { tickets: 0, revenue: 0 },
    "7 PM": { tickets: 0, revenue: 0 },
    "payItForward": { tickets: 0, revenue: 0 },
    "other": { tickets: 0, revenue: 0 }
  };
  let totalRevenue = 0;
  for (const order of orders) {
    for (const item of (order.line_items || [])) {
      const name = (item.name || "").toLowerCase();
      const qty = parseInt(item.quantity || "0", 10);
      const amount = parseInt(item.total_money?.amount || 0, 10) / 100;
      totalRevenue += amount;
      if (name.includes("pay it forward") || name.includes("donate")) {
        results.payItForward.tickets += qty;
        results.payItForward.revenue += amount;
      } else if (name.includes("1 pm") || name.includes("1:00")) {
        results["1 PM"].tickets += qty;
        results["1 PM"].revenue += amount;
      } else if (name.includes("4 pm") || name.includes("4:00")) {
        results["4 PM"].tickets += qty;
        results["4 PM"].revenue += amount;
      } else if (name.includes("7 pm") || name.includes("7:00")) {
        results["7 PM"].tickets += qty;
        results["7 PM"].revenue += amount;
      } else {
        results.other.tickets += qty;
        results.other.revenue += amount;
      }
    }
  }
  results.totalRevenue = totalRevenue;
  return results;
}

async function sendSMS(body) {
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

function buildReport(data) {
  const { dateStr } = getTodayRange();
  return [
    "Lighthouse Cinema Sales " + dateStr,
    "",
    "1 PM: " + data["1 PM"].tickets + " tickets / $" + data["1 PM"].revenue.toFixed(0),
    "4 PM: " + data["4 PM"].tickets + " tickets / $" + data["4 PM"].revenue.toFixed(0),
    "7 PM: " + data["7 PM"].tickets + " tickets / $" + data["7 PM"].revenue.toFixed(0),
    "",
    "Donated: " + data.payItForward.tickets + " tickets / $" + data.payItForward.revenue.toFixed(0),
    "",
    "Total today: $" + data.totalRevenue.toFixed(0)
  ].join("\n");
}

export async function GET(req) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!SQUARE_TOKEN || !SQUARE_LOCATION) {
    return NextResponse.json({ error: "Square credentials not configured" }, { status: 500 });
  }
  try {
    const orders = await getSquareOrders();
    const data = groupByShowtime(orders);
    const report = buildReport(data);
    let smsSent = false;
    if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM && OWNER_PHONE) {
      smsSent = await sendSMS(report);
    }
    return NextResponse.json({
      success: true,
      report: data,
      smsSent,
      message: report
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
