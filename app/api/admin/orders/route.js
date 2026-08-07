// GET /api/admin/orders — recent ticket orders (protected by staff auth).
import { authenticateRequest } from '@/lib/auth';
import { listRecentOrders } from '@/lib/square-orders';

export async function GET(request) {
  if (!authenticateRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const orders = await listRecentOrders({ limit: 200 });
    const revenueCents = orders
      .filter((o) => o.state === 'COMPLETED')
      .reduce((s, o) => s + (o.paidCents || o.totalCents || 0), 0);
    const paid = orders.filter((o) => o.state === 'COMPLETED');
    const byMovie = {}, byShow = {};
    for (const o of paid) {
      const c = o.paidCents || o.totalCents || 0;
      const mv = o.movie || 'unknown';
      byMovie[mv] = byMovie[mv] || { orders: 0, tickets: 0, revenueCents: 0 };
      byMovie[mv].orders++; byMovie[mv].tickets += o.quantity || 1; byMovie[mv].revenueCents += c;
      const k = [o.movie, o.date, o.time].filter(Boolean).join(' | ') || 'unknown';
      byShow[k] = byShow[k] || { orders: 0, tickets: 0, revenueCents: 0 };
      byShow[k].orders++; byShow[k].tickets += o.quantity || 1; byShow[k].revenueCents += c;
    }
    const rank = (obj) => Object.entries(obj).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenueCents - a.revenueCents);
    const rankedShows = rank(byShow);
    return Response.json({ ok: true, count: orders.length, revenueCents, ticketsSold: paid.reduce((s, o) => s + (o.quantity || 1), 0), avgOrderCents: paid.length ? Math.round(revenueCents / paid.length) : 0, salesByMovie: rank(byMovie), bestShowtimes: rankedShows.slice(0, 10), worstShowtimes: rankedShows.slice(-10).reverse(), orders });
  } catch (err) {
    const code = err.status === 401 || err.status === 403 ? 403 : 502;
    return Response.json({ error: err.message || 'Failed to load orders.' }, { status: code });
  }
}
