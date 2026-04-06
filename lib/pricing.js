// ================================================================
// PRICING ENGINE â Tax, Fees, Packages, Deposits
// Pacific Grove, CA: 9.25% sales tax + 18% service fee
// ================================================================

const TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_SALES_TAX_RATE || '0.0925');
const SERVICE_FEE_RATE = parseFloat(process.env.NEXT_PUBLIC_SERVICE_FEE_RATE || '0.18');
const DEPOSIT_RATE = parseFloat(process.env.NEXT_PUBLIC_DEPOSIT_RATE || '0.20');

// Pre-defined packages
export const PACKAGES = [
  {
    id: 'single',
    name: 'Single Ticket',
    description: 'Standard admission',
    minTickets: 1,
    maxTickets: 1,
    discountType: 'none',
    discountValue: 0,
  },
  {
    id: 'date-night',
    name: 'Date Night',
    description: '2 tickets + 2 drinks + shared popcorn',
    minTickets: 2,
    maxTickets: 2,
    discountType: 'fixed_addon',
    discountValue: 0, // Bundle price set per event
    bundleIncludes: ['2 craft drinks', '1 large popcorn'],
  },
  {
    id: 'group-5',
    name: 'Group of 5',
    description: 'Buy 5 tickets, pay for 4 â save 20%',
    minTickets: 5,
    maxTickets: 5,
    discountType: 'buy_x_pay_y',
    buyCount: 5,
    payCount: 4,
  },
  {
    id: 'family-4',
    name: 'Family Pack',
    description: '4 tickets + 4 drinks + 2 popcorns + kid combo',
    minTickets: 4,
    maxTickets: 4,
    discountType: 'percent',
    discountValue: 15,
    bundleIncludes: ['4 drinks', '2 large popcorns', '1 kids slider combo'],
  },
  {
    id: 'season-pass',
    name: 'Season Pass (10 Events)',
    description: '10 admissions â use anytime. Save 30%.',
    minTickets: 10,
    maxTickets: 10,
    discountType: 'percent',
    discountValue: 30,
  },
  {
    id: 'vip-screening',
    name: 'VIP Private Screening',
    description: 'Full auditorium (140 seats) for your group',
    minTickets: 1,
    maxTickets: 1,
    discountType: 'flat_rate',
    flatRate: 2500, // $2,500 for private screening
    bundleIncludes: ['140 seats', 'Projection & sound', 'Dedicated coordinator', '2 hours'],
  },
];

/**
 * Calculate full pricing breakdown for a cart
 * @param {Array} items - Array of { eventId, eventTitle, ticketPrice, quantity, packageId }
 * @returns {Object} Full pricing breakdown
 */
export function calculatePricing(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  const lineItems = [];

  for (const item of items) {
    const pkg = PACKAGES.find(p => p.id === item.packageId) || PACKAGES[0];
    let itemTotal = 0;
    let discount = 0;

    if (pkg.discountType === 'flat_rate') {
      itemTotal = pkg.flatRate * item.quantity;
    } else if (pkg.discountType === 'buy_x_pay_y') {
      const paidTickets = Math.floor(item.quantity / pkg.buyCount) * pkg.payCount +
        (item.quantity % pkg.buyCount);
      itemTotal = paidTickets * item.ticketPrice;
      discount = (item.quantity - paidTickets) * item.ticketPrice;
    } else if (pkg.discountType === 'percent') {
      itemTotal = item.quantity * item.ticketPrice;
      discount = itemTotal * (pkg.discountValue / 100);
      itemTotal -= discount;
    } else {
      itemTotal = item.quantity * item.ticketPrice;
    }

    subtotal += itemTotal;
    totalDiscount += discount;

    lineItems.push({
      eventId: item.eventId,
      eventTitle: item.eventTitle,
      quantity: item.quantity,
      unitPrice: item.ticketPrice,
      packageId: pkg.id,
      packageName: pkg.name,
      discount,
      lineTotal: itemTotal,
      bundleIncludes: pkg.bundleIncludes || [],
    });
  }

  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const taxableAmount = subtotal + serviceFee;
  const salesTax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((subtotal + serviceFee + salesTax) * 100) / 100;
  const depositAmount = Math.round(grandTotal * DEPOSIT_RATE * 100) / 100;
  const remainingBalance = Math.round((grandTotal - depositAmount) * 100) / 100;

  return {
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    serviceFee,
    serviceFeeRate: SERVICE_FEE_RATE,
    salesTax,
    salesTaxRate: TAX_RATE,
    grandTotal,
    depositAmount,
    depositRate: DEPOSIT_RATE,
    remainingBalance,
  };
}

/**
 * Format cents to dollars string
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
