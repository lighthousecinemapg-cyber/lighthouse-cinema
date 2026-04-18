// ================================================================
// PRICING ENGINE â Fixed bundle prices (no per-ticket multiplication)
// Pacific Grove, CA: 9.25% sales tax
// ================================================================

const TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_SALES_TAX_RATE || '0.0925');

// Fixed-price packages. Each package = ONE price, period.
export const PACKAGES = [
  {
    id: 'single',
    name: 'Adult Ticket',
    description: 'General admission (adult)',
    price: 15,
    seats: 1,
    badge: null,
  },
  {
    id: 'senior',
    name: 'Senior Ticket',
    description: 'Senior admission (65+)',
    price: 12,
    seats: 1,
    badge: null,
  },
  {
    id: 'date-night',
    name: 'Date Night',
    description: '2 seats + 2 craft drinks + shared popcorn',
    price: 65,
    seats: 2,
    badge: 'â­ Most Popular',
    includes: ['2 seats', '2 craft drinks', 'Large popcorn'],
  },
  {
    id: 'group-5',
    name: 'Group of 5',
    description: '5 seats â bundled discount',
    price: 75,
    seats: 5,
    badge: 'ð¥ Best Value',
    includes: ['5 seats'],
  },
  {
    id: 'family-pack',
    name: 'Family Pack',
    description: '4 seats + drinks + 2 popcorns + kids combo',
    price: 95,
    seats: 4,
    includes: ['4 seats', '4 drinks', '2 large popcorns', 'Kids slider combo'],
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    description: 'Front-row recliners, welcome drinks, premium snacks',
    price: 145,
    seats: 2,
    badge: 'ð Premium',
    includes: ['2 VIP recliners', 'Welcome cocktails', 'Premium snack board'],
  },
  {
    id: 'private',
    name: 'Private Screening',
    description: 'Your own auditorium â book the whole room',
    price: 2500,
    seats: 1,
    badge: 'ð¬ Exclusive',
    includes: ['Full auditorium', 'Projection & sound', 'Dedicated host', '2 hours'],
  },
];

// Food / experience add-ons shown at checkout
export const ADDONS = [
  { id: 'vip-combo', name: 'VIP Combo', description: 'Cocktail + charcuterie for two', price: 38 },
  { id: 'date-dinner', name: 'Date Night Dinner', description: 'Two-course dinner for two', price: 55 },
  { id: 'cinema-box', name: 'Cinema Box', description: 'Popcorn, candy, drinks for two', price: 22 },
  { id: 'family-feast', name: 'Family Feast', description: 'Sliders, fries, drinks, popcorn for 4', price: 48 },
];

/**
 * Calculate pricing for a cart of { packageId, quantity, addonIds? }
 * Pricing is FIXED per package. Quantity multiplies the bundle, not tickets.
 */
export function calculatePricing(items) {
  let subtotal = 0;
  const lineItems = [];

  for (const item of items) {
    const pkg = PACKAGES.find(p => p.id === item.packageId);
    if (!pkg) continue;
    const qty = Math.max(1, item.quantity || 1);
    const lineTotal = pkg.price * qty;
    subtotal += lineTotal;
    lineItems.push({
      packageId: pkg.id,
      packageName: pkg.name,
      unitPrice: pkg.price,
      quantity: qty,
      lineTotal,
      includes: pkg.includes || [],
    });

    for (const addonId of item.addonIds || []) {
      const addon = ADDONS.find(a => a.id === addonId);
      if (!addon) continue;
      subtotal += addon.price;
      lineItems.push({
        packageId: `${pkg.id}+${addon.id}`,
        packageName: `+ ${addon.name}`,
        unitPrice: addon.price,
        quantity: 1,
        lineTotal: addon.price,
      });
    }
  }

  const salesTax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const grandTotal = Math.round((subtotal + salesTax) * 100) / 100;

  return {
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    salesTax,
    salesTaxRate: TAX_RATE,
    grandTotal,
  };
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
