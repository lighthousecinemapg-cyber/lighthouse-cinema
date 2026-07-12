// GET /api/order?id=<squareOrderId>   or   /api/order?ref=<confirmationRef>
// Returns normalized order data (movie, date, showtime, amount, status).
import { getOrder, findOrderByRef } from '@/lib/square-orders';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const ref = searchParams.get('ref');
  if (!id && !ref) {
    return Response.json({ error: 'Provide an order id or confirmation ref.' }, { status: 400 });
  }
  try {
    const order = id ? await getOrder(id) : await findOrderByRef(ref);
    if (!order) return Response.json({ error: 'No matching order found.' }, { status: 404 });
    return Response.json({ ok: true, order });
  } catch (err) {
    const code = err.status === 401 || err.status === 403 ? 403 : 502;
    return Response.json({ error: err.message || 'Lookup failed.', needsScope: code === 403 }, { status: code });
  }
}
