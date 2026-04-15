// ═══════════════════════════════════════════════════════════════
// /app/api/square/catalog/route.js — Catalog & Menu API
//
// GET /api/square/catalog           — All menu items
// GET /api/square/catalog?type=tickets    — Ticket types only
// GET /api/square/catalog?type=concessions — Concessions only
// GET /api/square/catalog?search=popcorn  — Search items
// GET /api/square/catalog?id=xxx          — Single item
// ═══════════════════════════════════════════════════════════════

import {
  getMenuItems,
  getTicketTypes,
  getConcessionItems,
  searchCatalog,
  getCatalogObject,
} from '@/lib/square-catalog';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    // Single item lookup
    if (id) {
      const item = await getCatalogObject(id);
      return Response.json({ success: true, item });
    }

    // Search
    if (search) {
      const results = await searchCatalog(search);
      return Response.json({ success: true, items: results, count: results.length });
    }

    // Filtered by type
    if (type === 'tickets') {
      const tickets = await getTicketTypes();
      return Response.json({ success: true, items: tickets, count: tickets.length });
    }

    if (type === 'concessions' || type === 'food' || type === 'menu') {
      const concessions = await getConcessionItems();
      return Response.json({ success: true, items: concessions, count: concessions.length });
    }

    // Default: all items
    const allItems = await getMenuItems();

    // Group by category
    const byCategory = {};
    for (const item of allItems) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    }

    return Response.json({
      success: true,
      items: allItems,
      categories: byCategory,
      count: allItems.length,
    });

  } catch (err) {
    console.error('[Catalog API] Error:', err.message);
    return Response.json(
      { error: err.message || 'Failed to fetch catalog.' },
      { status: 500 }
    );
  }
}
