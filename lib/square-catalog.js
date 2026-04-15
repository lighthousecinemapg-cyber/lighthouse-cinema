// /lib/square-catalog.js â Square Catalog & Inventory API
//
// Fetches menu items, ticket types, pricing, and inventory
// from your Square catalog. Powers dynamic pricing on the site.

const SQUARE_BASE = process.env.SQUARE_ENVIRONMENT === 'production'
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

const headers = {
  'Square-Version': '2024-01-18',
  'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

// Simple in-memory cache (5 min TTL)
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache[key] = { data, ts: Date.now() };
}

export async function listCatalog({ types = 'ITEM,CATEGORY,IMAGE', cursor } = {}) {
  const cacheKey = `catalog_${types}_${cursor || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ types });
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`${SQUARE_BASE}/v2/catalog/list?${params}`, { headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.errors?.[0]?.detail || 'Catalog list failed');

  const result = {
    objects: data.objects || [],
    cursor: data.cursor || null,
  };
  setCache(cacheKey, result);
  return result;
}

export async function getCatalogObject(objectId) {
  const cacheKey = `object_${objectId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${SQUARE_BASE}/v2/catalog/object/${objectId}?include_related_objects=true`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.detail || 'Object fetch failed');

  setCache(cacheKey, data.object);
  return data.object;
}

export async function searchCatalog(query, objectTypes = 'ITEM') {
  const res = await fetch(`${SQUARE_BASE}/v2/catalog/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      object_types: [objectTypes],
      query: {
        text_query: { keywords: [query] },
      },
      limit: 50,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.detail || 'Search failed');
  return data.objects || [];
}

export async function getInventoryCounts(catalogObjectIds) {
  const res = await fetch(`${SQUARE_BASE}/v2/inventory/counts/batch-retrieve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      catalog_object_ids: catalogObjectIds,
      location_ids: [process.env.SQUARE_LOCATION_ID],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.detail || 'Inventory fetch failed');
  return data.counts || [];
}

export async function getMenuItems() {
  const cacheKey = 'menu_items';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { objects } = await listCatalog({ types: 'ITEM,CATEGORY,IMAGE' });

  const categories = {};
  const images = {};
  const items = [];

  for (const obj of objects) {
    if (obj.type === 'CATEGORY') {
      categories[obj.id] = obj.category_data?.name || 'Uncategorized';
    } else if (obj.type === 'IMAGE') {
      images[obj.id] = obj.image_data?.url || '';
    }
  }

  for (const obj of objects) {
    if (obj.type !== 'ITEM') continue;
    const item = obj.item_data;
    if (!item) continue;

    const categoryName = item.category_id ? (categories[item.category_id] || 'Other') : 'Other';
    const imageUrl = item.image_ids?.[0] ? (images[item.image_ids[0]] || '') : '';

    const variations = (item.variations || []).map(v => ({
      id: v.id,
      name: v.item_variation_data?.name || '',
      priceCents: Number(v.item_variation_data?.price_money?.amount || 0),
      currency: v.item_variation_data?.price_money?.currency || 'USD',
    }));

    items.push({
      id: obj.id,
      name: item.name || '',
      description: item.description || '',
      category: categoryName,
      imageUrl,
      variations,
    });
  }

  setCache(cacheKey, items);
  return items;
}

export async function getTicketTypes() {
  const items = await getMenuItems();
  return items.filter(i =>
    i.category.toLowerCase().includes('ticket') ||
    i.name.toLowerCase().includes('ticket') ||
    i.name.toLowerCase().includes('admission')
  );
}

export async function getConcessionItems() {
  const items = await getMenuItems();
  return items.filter(i =>
    i.category.toLowerCase().includes('concession') ||
    i.category.toLowerCase().includes('food') ||
    i.category.toLowerCase().includes('drink') ||
    i.category.toLowerCase().includes('snack')
  );
}
