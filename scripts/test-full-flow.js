#!/usr/bin/env node
// ================================================================
// LIGHTHOUSE CINEMA â FULL END-TO-END TEST SCRIPT
// Run: node scripts/test-full-flow.js
//
// Tests the entire booking â invoice â calendar â GBP â email flow
// Uses your real API keys from .env.local
// ================================================================

import 'dotenv/config'; // npm install dotenv

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const COLORS = {
  pass: '\x1b[32mâ\x1b[0m',
  fail: '\x1b[31mâ\x1b[0m',
  info: '\x1b[36mâ¹\x1b[0m',
  warn: '\x1b[33mâ \x1b[0m',
};

let passed = 0;
let failed = 0;

function log(status, message, details = '') {
  console.log(`  ${status} ${message}${details ? ` â ${details}` : ''}`);
}

async function testAPI(method, path, body = null, expectedStatus = 200) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (res.status === expectedStatus) {
      passed++;
      return { success: true, data, status: res.status };
    } else {
      failed++;
      return { success: false, data, status: res.status, expected: expectedStatus };
    }
  } catch (err) {
    failed++;
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('\nð¬ LIGHTHOUSE CINEMA â Full System Test\n');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Time: ${new Date().toISOString()}\n`);

  // ââ 1. Events API ââ
  console.log('ð EVENTS API');

  const eventsResult = await testAPI('GET', '/api/events');
  if (eventsResult.success) {
    log(COLORS.pass, 'GET /api/events', `${eventsResult.data.events?.length || 0} events found`);
  } else {
    log(COLORS.fail, 'GET /api/events', `Status ${eventsResult.status}`);
  }

  // Create test event
  const createResult = await testAPI('POST', '/api/events', {
    title: 'Test Screening â E2E',
    description: 'Automated test event',
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    time: '19:00',
    venue: 'Main Auditorium',
    ticketPrice: 15,
    totalSeats: 140,
    category: 'screening',
  }, 201);

  let testEventId = null;
  if (createResult.success) {
    testEventId = createResult.data.event?.id;
    log(COLORS.pass, 'POST /api/events (create)', `ID: ${testEventId}`);
  } else {
    log(COLORS.fail, 'POST /api/events (create)', JSON.stringify(createResult.data));
  }

  // Get single event
  if (testEventId) {
    const singleResult = await testAPI('GET', `/api/events/${testEventId}`);
    if (singleResult.success) {
      log(COLORS.pass, `GET /api/events/${testEventId}`, singleResult.data.event?.title);
    } else {
      log(COLORS.fail, `GET /api/events/${testEventId}`, `Status ${singleResult.status}`);
    }
  }

  // ââ 2. Booking API ââ
  console.log('\nð³ BOOKING API (Square + Calendar + Email)');

  if (testEventId) {
    const bookingResult = await testAPI('POST', '/api/bookings', {
      customerName: 'Test Customer',
      customerEmail: 'test@lighthousecinemapg.com',
      customerPhone: '+18315551234',
      items: [{ eventId: testEventId, quantity: 2, packageId: 'date-night' }],
      paymentToken: 'cnon:card-nonce-ok', // Square sandbox test nonce
    }, 201);

    if (bookingResult.success) {
      const booking = bookingResult.data.booking;
      log(COLORS.pass, 'POST /api/bookings', `Ref: ${booking?.bookingRef}`);
      log(COLORS.info, '  Square Payment ID', booking?.squarePaymentId || 'N/A (check Square credentials)');
      log(COLORS.info, '  Square Invoice ID', booking?.squareInvoiceId || 'N/A');
      log(COLORS.info, '  Calendar Event ID', booking?.calendarEventId || 'N/A');
      log(COLORS.info, '  Grand Total', `$${booking?.grandTotal?.toFixed(2)}`);
      log(COLORS.info, '  Deposit Paid', `$${booking?.depositAmount?.toFixed(2)}`);
      log(COLORS.info, '  Remaining', `$${booking?.remainingBalance?.toFixed(2)}`);
    } else {
      log(COLORS.fail, 'POST /api/bookings', bookingResult.data?.error || `Status ${bookingResult.status}`);
      log(COLORS.warn, '  This is expected if Square/Calendar credentials are not configured');
    }

    // Get booking
    const getBookings = await testAPI('GET', '/api/bookings');
    if (getBookings.success) {
      log(COLORS.pass, 'GET /api/bookings', `${getBookings.data.bookings?.length || 0} bookings`);
    }
  }

  // ââ 3. GBP Automation API ââ
  console.log('\nð¤ GBP AUTOMATION API');

  const reviewsGet = await testAPI('GET', '/api/gbp/reviews');
  if (reviewsGet.success) {
    log(COLORS.pass, 'GET /api/gbp/reviews', `${reviewsGet.data.responses?.length || 0} responses logged`);
  } else {
    log(COLORS.fail, 'GET /api/gbp/reviews', `Status ${reviewsGet.status}`);
  }

  const postsGet = await testAPI('GET', '/api/gbp/posts');
  if (postsGet.success) {
    log(COLORS.pass, 'GET /api/gbp/posts', `${postsGet.data.published?.length || 0} published, ${postsGet.data.scheduled?.length || 0} scheduled`);
  } else {
    log(COLORS.fail, 'GET /api/gbp/posts', `Status ${postsGet.status}`);
  }

  const analyticsGet = await testAPI('GET', '/api/gbp/analytics');
  if (analyticsGet.success) {
    log(COLORS.pass, 'GET /api/gbp/analytics', `Dashboard data loaded`);
  } else {
    log(COLORS.fail, 'GET /api/gbp/analytics', `Status ${analyticsGet.status}`);
  }

  const competitorsGet = await testAPI('GET', '/api/gbp/competitors');
  if (competitorsGet.success) {
    log(COLORS.pass, 'GET /api/gbp/competitors', `${competitorsGet.data.competitors?.length || 0} competitors tracked`);
  } else {
    log(COLORS.fail, 'GET /api/gbp/competitors', `Status ${competitorsGet.status}`);
  }

  // Test GBP sync
  const syncResult = await testAPI('POST', '/api/gbp/sync', { action: 'sync_daily' });
  if (syncResult.success) {
    log(COLORS.pass, 'POST /api/gbp/sync (daily)', `${syncResult.data.actions?.length || 0} actions`);
  } else {
    log(COLORS.fail, 'POST /api/gbp/sync (daily)', syncResult.data?.error);
  }

  // ââ 4. Cleanup ââ
  if (testEventId) {
    const deleteResult = await testAPI('DELETE', `/api/events/${testEventId}`);
    if (deleteResult.success) {
      log(COLORS.info, 'Cleaned up test event', testEventId);
    }
  }

  // ââ Summary ââ
  console.log('\n' + 'â'.repeat(50));
  console.log(`  ${COLORS.pass} Passed: ${passed}`);
  console.log(`  ${COLORS.fail} Failed: ${failed}`);
  console.log(`  Total: ${passed + failed}`);
  console.log('â'.repeat(50));

  if (failed > 0) {
    console.log(`\n${COLORS.warn} Some tests failed. This is normal if API credentials are not yet configured.`);
    console.log(`  Fill in .env.local and re-run: node scripts/test-full-flow.js\n`);
  } else {
    console.log(`\n${COLORS.pass} All systems operational! Your cinema is ready to go live. ð¬\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
