// ================================================================
// LIGHTHOUSE CINEMA â LOYALTY, DYNAMIC PRICING & PROMOTIONS
// Points system, flash sales, early bird, referrals, birthdays
// ================================================================

import { v4 as uuidv4 } from 'uuid';

// ââ In-memory store (replace with PostgreSQL in production) ââ
const customers = new Map();  // email â { points, totalSpent, bookings, birthday, referralCode, referredBy, createdAt }
const referralCodes = new Map(); // code â email
const coupons = new Map(); // code â { type, value, used, expiresAt }

// ================================================================
// LOYALTY POINTS
// $1 spent = 1 point | 100 points = $5 off
// ================================================================

export function getOrCreateCustomer(email, name = '', phone = '', birthday = '') {
  if (!customers.has(email)) {
    const referralCode = `LH-${email.split('@')[0].toUpperCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    customers.set(email, {
      email,
      name,
      phone,
      birthday: birthday || null,
      points: 0,
      totalSpent: 0,
      bookingCount: 0,
      referralCode,
      referredBy: null,
      couponsEarned: [],
      lastBooking: null,
      createdAt: new Date().toISOString(),
    });
    referralCodes.set(referralCode, email);
  }
  return customers.get(email);
}

export function addPoints(email, amountSpent) {
  const customer = getOrCreateCustomer(email);
  const pointsEarned = Math.floor(amountSpent); // $1 = 1 point
  customer.points += pointsEarned;
  customer.totalSpent += amountSpent;
  customer.bookingCount += 1;
  customer.lastBooking = new Date().toISOString();

  // Auto-generate $5 coupon every 100 points
  const rewards = [];
  while (customer.points >= 100) {
    customer.points -= 100;
    const couponCode = `REWARD-${uuidv4().slice(0, 8).toUpperCase()}`;
    const coupon = {
      code: couponCode,
      type: 'fixed',
      value: 5, // $5 off
      used: false,
      customerEmail: email,
      expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(), // 90 days
    };
    coupons.set(couponCode, coupon);
    customer.couponsEarned.push(couponCode);
    rewards.push(coupon);
  }

  return { pointsEarned, totalPoints: customer.points, rewards };
}

export function getCustomerProfile(email) {
  return customers.get(email) || null;
}

export function redeemCoupon(couponCode) {
  const coupon = coupons.get(couponCode);
  if (!coupon) return { valid: false, error: 'Coupon not found' };
  if (coupon.used) return { valid: false, error: 'Coupon already used' };
  if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: 'Coupon expired' };

  coupon.used = true;
  return { valid: true, discount: coupon.value, type: coupon.type };
}

// ================================================================
// REFERRAL PROGRAM
// Share code â friend books â both get $5 credit
// ================================================================

export function applyReferral(newCustomerEmail, referralCode) {
  const referrerEmail = referralCodes.get(referralCode);
  if (!referrerEmail) return { success: false, error: 'Invalid referral code' };
  if (referrerEmail === newCustomerEmail) return { success: false, error: 'Cannot refer yourself' };

  const newCustomer = getOrCreateCustomer(newCustomerEmail);
  if (newCustomer.referredBy) return { success: false, error: 'Already used a referral code' };

  newCustomer.referredBy = referralCode;

  // Both get $5 coupon
  const rewards = [];
  for (const email of [newCustomerEmail, referrerEmail]) {
    const code = `REF-${uuidv4().slice(0, 8).toUpperCase()}`;
    const coupon = {
      code,
      type: 'fixed',
      value: 5,
      used: false,
      customerEmail: email,
      expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    };
    coupons.set(code, coupon);
    getOrCreateCustomer(email).couponsEarned.push(code);
    rewards.push({ email, couponCode: code });
  }

  return { success: true, rewards };
}

// ================================================================
// DYNAMIC PRICING
// ================================================================

export function calculateDynamicPrice(basePrice, options = {}) {
  const {
    daysUntilEvent = 0,
    currentOccupancy = 0, // 0-1 (fraction of seats sold)
    totalSeats = 140,
    ticketCount = 1,
    couponCode = null,
  } = options;

  let finalPrice = basePrice;
  const appliedDiscounts = [];

  // ââ Early bird: 10% off if booked >7 days in advance ââ
  if (daysUntilEvent > 7) {
    const earlyBirdDiscount = finalPrice * 0.10;
    finalPrice -= earlyBirdDiscount;
    appliedDiscounts.push({
      name: 'Early Bird (10% off)',
      amount: earlyBirdDiscount,
      reason: `Booked ${daysUntilEvent} days before event`,
    });
  }

  // ââ Group discount: 4+ tickets = 15% off ââ
  if (ticketCount >= 4) {
    const groupDiscount = finalPrice * 0.15;
    finalPrice -= groupDiscount;
    appliedDiscounts.push({
      name: 'Group Discount (15% off)',
      amount: groupDiscount,
      reason: `${ticketCount} tickets purchased`,
    });
  }

  // ââ Flash sale: <40% sold within 24 hours = 25% off ââ
  if (daysUntilEvent <= 1 && currentOccupancy < 0.4) {
    const flashDiscount = finalPrice * 0.25;
    finalPrice -= flashDiscount;
    appliedDiscounts.push({
      name: 'Flash Sale (25% off)',
      amount: flashDiscount,
      reason: 'Last-minute deal â limited seats remain',
    });
  }

  // ââ Surge pricing: >85% sold = 10% premium ââ
  if (currentOccupancy > 0.85 && daysUntilEvent > 1) {
    const surge = finalPrice * 0.10;
    finalPrice += surge;
    appliedDiscounts.push({
      name: 'High Demand (+10%)',
      amount: -surge,
      reason: 'Popular showing â limited availability',
    });
  }

  // ââ Coupon redemption ââ
  if (couponCode) {
    const couponResult = redeemCoupon(couponCode);
    if (couponResult.valid) {
      const couponDiscount = couponResult.type === 'percent'
        ? finalPrice * (couponResult.discount / 100)
        : Math.min(couponResult.discount, finalPrice);
      finalPrice -= couponDiscount;
      appliedDiscounts.push({
        name: `Coupon ${couponCode}`,
        amount: couponDiscount,
        reason: couponResult.type === 'percent' ? `${couponResult.discount}% off` : `$${couponResult.discount} off`,
      });
    }
  }

  // Never go below $1
  finalPrice = Math.max(finalPrice, 1);

  return {
    originalPrice: basePrice,
    finalPrice: Math.round(finalPrice * 100) / 100,
    totalSaved: Math.round((basePrice - finalPrice) * 100) / 100,
    appliedDiscounts,
  };
}

// ================================================================
// FLASH SALE DETECTOR
// Called by cron â checks all events and triggers flash sales
// ================================================================

export function detectFlashSaleOpportunities(events) {
  const now = new Date();
  const opportunities = [];

  for (const event of events) {
    if (!event.active) continue;

    const eventDate = new Date(event.date + 'T' + event.time);
    const hoursUntil = (eventDate - now) / 3600000;
    const occupancy = event.bookedSeats / event.totalSeats;

    // Flash sale: <40% sold within 24 hours
    if (hoursUntil > 0 && hoursUntil <= 24 && occupancy < 0.4) {
      opportunities.push({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        occupancy: Math.round(occupancy * 100),
        hoursUntil: Math.round(hoursUntil),
        suggestedDiscount: 25,
        message: `"${event.title}" is only ${Math.round(occupancy * 100)}% sold with ${Math.round(hoursUntil)}h to go. Recommend 25% flash sale.`,
      });
    }
  }

  return opportunities;
}

// ================================================================
// BIRTHDAY CHECK
// Called daily â finds customers with birthdays today
// ================================================================

export function getBirthdayCustomers() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const birthdayPeople = [];
  for (const [email, customer] of customers) {
    if (customer.birthday) {
      const bday = customer.birthday.slice(5); // MM-DD from YYYY-MM-DD
      if (bday === todayStr) {
        // Generate birthday coupon
        const code = `BDAY-${uuidv4().slice(0, 8).toUpperCase()}`;
        const coupon = {
          code,
          type: 'fixed',
          value: 10, // Free popcorn equivalent
          used: false,
          customerEmail: email,
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        };
        coupons.set(code, coupon);
        customer.couponsEarned.push(code);
        birthdayPeople.push({ ...customer, birthdayCoupon: code });
      }
    }
  }

  return birthdayPeople;
}

// ================================================================
// WIN-BACK: Customers inactive >60 days
// ================================================================

export function getInactiveCustomers(daysSinceLastBooking = 60) {
  const cutoff = new Date(Date.now() - daysSinceLastBooking * 86400000);
  const inactive = [];

  for (const [email, customer] of customers) {
    if (customer.lastBooking && new Date(customer.lastBooking) < cutoff) {
      // Generate win-back coupon
      const code = `MISSYOU-${uuidv4().slice(0, 6).toUpperCase()}`;
      const coupon = {
        code,
        type: 'percent',
        value: 15, // 15% off
        used: false,
        customerEmail: email,
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      coupons.set(code, coupon);
      inactive.push({ ...customer, winBackCoupon: code });
    }
  }

  return inactive;
}

// ââ Stats ââ
export function getLoyaltyStats() {
  let totalCustomers = 0;
  let totalPoints = 0;
  let totalSpent = 0;
  let totalCoupons = coupons.size;
  let redeemedCoupons = 0;

  for (const [, c] of customers) {
    totalCustomers++;
    totalPoints += c.points;
    totalSpent += c.totalSpent;
  }
  for (const [, c] of coupons) {
    if (c.used) redeemedCoupons++;
  }

  return { totalCustomers, totalPoints, totalSpent, totalCoupons, redeemedCoupons };
}
