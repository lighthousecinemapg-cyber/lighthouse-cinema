# Lighthouse Cinema â Deployment Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Vercel CLI (`npm i -g vercel`)
- A GitHub account

## Step 1: Push to GitHub

```bash
cd cinema-booking
git init
git add .
git commit -m "Lighthouse Cinema booking + CineMax AI system"
git remote add origin https://github.com/YOUR_USERNAME/lighthouse-cinema.git
git push -u origin main
```

## Step 2: Install Dependencies Locally

```bash
npm install
npm install dotenv  # for test script
```

## Step 3: Create `.env.local`

```bash
cp .env.example .env.local
# Edit .env.local with your real credentials
```

## Step 4: Test Locally

```bash
npm run dev
# Visit http://localhost:3000
# Run test: node scripts/test-full-flow.js
```

## Step 5: Deploy to Vercel

```bash
vercel login
vercel link  # link to your project
vercel env add SQUARE_ACCESS_TOKEN
vercel env add SQUARE_LOCATION_ID
vercel env add SQUARE_ENVIRONMENT
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_CALENDAR_ID
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add GBP_ACCOUNT_ID
vercel env add GBP_LOCATION_ID
vercel env add GBP_ACCESS_TOKEN
vercel env add AI_PROVIDER
vercel env add AI_API_KEY
vercel env add AI_MODEL
vercel env add CRON_SECRET
vercel env add MANAGER_EMAIL
vercel env add NEXT_PUBLIC_SQUARE_APP_ID
vercel env add NEXT_PUBLIC_SQUARE_LOCATION_ID
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_CINEMA_NAME
vercel env add NEXT_PUBLIC_CINEMA_PHONE
vercel env add NEXT_PUBLIC_SALES_TAX_RATE
vercel env add NEXT_PUBLIC_SERVICE_FEE_RATE
vercel env add NEXT_PUBLIC_DEPOSIT_RATE
vercel env add GOOGLE_OAUTH_CLIENT_ID
vercel env add GOOGLE_OAUTH_CLIENT_SECRET
vercel env add GOOGLE_OAUTH_REDIRECT_URI

# Deploy to production
vercel --prod
```

## Step 6: Connect Domain

In Vercel Dashboard > Settings > Domains:
- Add `lighthousecinemapg.com`
- Follow DNS instructions (point A record or CNAME)

## Step 7: Google OAuth Setup (One-Time)

1. Visit: `https://lighthousecinemapg.com/api/auth/google/start`
2. Authorize your Google account
3. Copy the `GOOGLE_REFRESH_TOKEN` from the success page
4. Add it to Vercel: `vercel env add GOOGLE_REFRESH_TOKEN`
5. Redeploy: `vercel --prod`

## Step 8: Verify Cron Jobs

The `vercel.json` configures:
- `/api/gbp/cron` â runs every hour 8AM-10PM (auto-posts to GBP)
- `/api/gbp/reviews` â runs every 15 minutes (auto-responds to reviews)

Check: Vercel Dashboard > Settings > Cron Jobs

## Step 9: Run Full Test

```bash
TEST_BASE_URL=https://lighthousecinemapg.com node scripts/test-full-flow.js
```

## Architecture

```
cinema-booking/
âââ app/
â   âââ page.js                    # Homepage (event listing)
â   âââ layout.js                  # Root layout + nav + footer
â   âââ globals.css                # Luxury black/gold theme
â   âââ events/[id]/page.js        # Event detail + ticket selection
â   âââ checkout/page.js           # Cart + Square payment
â   âââ confirmation/page.js       # Booking confirmation
â   âââ admin/
â   â   âââ page.js                # Event management dashboard
â   â   âââ gbp/page.js            # CineMax AI command center
â   âââ api/
â       âââ events/                 # CRUD for events
â       âââ bookings/               # Full booking flow
â       âââ auth/google/            # OAuth setup flow
â       âââ gbp/
â           âââ reviews/            # AI review auto-responder
â           âââ posts/              # AI post generator
â           âââ cron/               # Automated scheduler
â           âââ competitors/        # Competitor monitoring
â           âââ analytics/          # Dashboard + weekly report
â           âââ sync/               # Website â GBP â Calendar sync
âââ lib/
â   âââ pricing.js                 # Tax, fees, packages
â   âââ square.js                  # Square payments + invoices
â   âââ google-calendar.js         # Calendar event creation
â   âââ google-auth.js             # OAuth token auto-refresh
â   âââ email.js                   # Transactional emails
â   âââ events-db.js               # Event database
â   âââ loyalty.js                 # Points, referrals, dynamic pricing
â   âââ seo.js                     # JSON-LD schema + meta tags
â   âââ daily-digest.js            # Morning email + SMS alerts
â   âââ gbp/
â       âââ config.js              # Brand voice, schedule, keywords
â       âââ ai-engine.js           # GPT-4o/Claude/Gemini integration
â       âââ google-business.js     # GBP API client
â       âââ automation-db.js       # Tracking database
âââ scripts/
â   âââ test-full-flow.js          # E2E test script
âââ vercel.json                    # Cron job configuration
âââ .env.example                   # All environment variables
```
