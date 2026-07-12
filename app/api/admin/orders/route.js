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
    return Response.json({ ok: true, count: orders.length, revenueCents, orders });
  } catch (err) {
    const code = err.status === 401 || err.status === 403 ? 403 : 502;
    return Response.json({ error: err.message || 'Failed to load orders.' }, { status: code });
  }
}
