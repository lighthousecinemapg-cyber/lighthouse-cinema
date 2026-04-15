// ═══════════════════════════════════════════════════════════════
// /lib/square-catalog.js — Square Catalog & Inventory API
//
// Fetches menu items, ticket types, pricing, and inventory
// from your Square catalog. Powers dynamic pricing on the site.
//
// REQUIRED ENV VARS:
//   SQUARE_ACCESS_TOKEN   — Your Square API access token
//   SQUARE_LOCATION_ID    — Your Square location ID
//   SQUARE_ENVIRONMENT    — "production" or "sandbox"
// ═══════════════════════════════════════════════════════════════

function getBaseUrl() {
  const env = process.env.SQUARE_ENVIRONMENT || 'production';
  return env === 'sandbox'
    ? 'https://connect.squareupsandbox.com/v2'
    : 'https://connect.squareup.com/v2';
}

const SQUARE_VERSION = '2024-01-18';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
  };
}

// ─── In-memory cache (TTL: 5 minutes) ───────────────────────
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

/**
 * List all catalog items, optionally filtered by type.
 */
export async function listCatalog({ types = 'ITEM,CATEGORY,IMAGE', cursor } = {}) {
  const cacheKey = `catalog_${types}_${cursor || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(`${getBaseUrl()}/catalog/list`);
  url.searchParams.set('types', types);
  if (cursor) url.searchParams.set('cursor', cursor);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: headers(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`List catalog failed: ${data.errors?.[0]?.detail || response.status}`);
  }

  const result = { objects: data.objects || [], cursor: data.cursor || null };
  setCache(cacheKey, result);
  return result;
}

/**
 * Get a single catalog object by ID.
 */
export async function getCatalogObject(objectId) {
  const cacheKey = `catalog_obj_${objectId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${getBaseUrl()}/catalog/object/${objectId}?include_related_objects=true`, {
    method: 'GET',
    headers: headers(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Get catalog object failed: ${data.errors?.[0]?.detail || response.status}`);
  }

  setCache(cacheKey, data.object);
  return data.object;
}

/**
 * Search catalog by name or keyword.
 */
export async function searchCatalog(query, objectTypes = 'ITEM') {
  const response = await fetch(`${getBaseUrl()}/catalog/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      object_types: objectTypes.split(','),
      query: { text_query: { keywords: [query] } },
      limit: 50,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Search catalog failed: ${data.errors?.[0]?.detail || response.status}`);
  }
  return data.objects || [];
}

/**
 * Get inventory counts for catalog item variation IDs.
 */
export async function getInventoryCounts(catalogObjectIds) {
  const response = await fetch(`${getBaseUrl()}/inventory/counts/batch-retrieve`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      catalog_object_ids: catalogObjectIds,
      location_ids: [process.env.SQUARE_LOCATION_ID],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Inventory counts failed: ${data.errors?.[0]?.detail || response.status}`);
  }
  return data.counts || [];
}

/**
 * Get all menu/concession items formatted for the website.
 */
export async function getMenuItems() {
  const cached = getCached('menu_items');
  if (cached) return cached;

  const { objects } = await listCatalog({ types: 'ITEM,CATEGORY,IMAGE' });

  const categories = {};
  const images = {};
  const items = [];

  for (const obj of objects) {
    if (obj.type === 'CATEGORY') {
      categories[obj.id] = obj.category_data?.name || 'Uncategorized';
    } else if (obj.type === 'IMAGE') {
      images[obj.id] = obj.image_data?.url || null;
    } else if (obj.type === 'ITEM') {
      items.push(obj);
    }
  }

  const formatted = items.map(item => {
    const data = item.item_data;
    const variations = (data.variations || []).map(v => ({
      id: v.id,
      name: v.item_variation_data?.name || 'Regular',
      priceCents: Number(v.item_variation_data?.price_money?.amount || 0),
      price: `$${(Number(v.item_variation_data?.price_money?.amount || 0) / 100).toFixed(2)}`,
      sku: v.item_variation_data?.sku || null,
    }));

    const categoryName = data.category_id
// Fetches menu items, ticket types, pricing, and inventory from your Square catalog.

function getBaseUrl() {
  const env = process.env.SQUARE_ENVIRONMENT || 'production';
  return env === 'sandbox'
    ? 'https://connect.squareupsandbox.com/v2'
    : 'https://connect.squareup.com/v2';
}

const SQUARE_VERSION = '2024-01-18';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
  };
}

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

  const url = new URL(`${getBaseUrl()}/catalog/list`);
  url.searchParams.set('types', types);
  if (cursor) url.searchParams.set('cursor', cursor);

  const response = await fetch(url.toString(), { method: 'GET', headers: headers() });
  const data = await response.json();
  if (!response.ok) throw new Error(`List catalog failed: ${data.errors?.[0]?.detail || response.status}`);

  const result = { objects: data.objects || [], cursor: data.cursor || null };
  setCache(cacheKey, result);
  return result;
}

export async function getCatalogObject(objectId) {
  const cacheKey = `catalog_obj_${objectId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(`${getBaseUrl()}/catalog/object/${objectId}?include_related_objects=true`, { method: 'GET', headers: headers() });
  const data = await response.json();
  if (!response.ok) throw new Error(`Get catalog object failed: ${data.errors?.[0]?.detail || response.status}`);

  setCache(cacheKey, data.object);
  return data.object;
}

export async function searchCatalog(query, objectTypes = 'ITEM') {
  const response = await fetch(`${getBaseUrl()}/catalog/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      object_types: objectTypes.split(','),
      query: { text_query: { keywords: [query] } },
      limit: 50,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Search catalog failed: ${data.errors?.[0]?.detail || response.status}`);
  return data.objects || [];
}

export async function getInventoryCounts(catalogObjectIds) {
  const response = await fetch(`${getBaseUrl()}/inventory/counts/batch-retrieve`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      catalog_object_ids: catalogObjectIds,
      location_ids: [process.env.SQUARE_LOCATION_ID],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Inventory counts failed: ${data.errors?.[0]?.detail || response.status}`);
  return data.counts || [];
}

export async function getMenuItems() {
  const cached = getCached('menu_items');
  if (cached) return cached;

  const { objects } = await listCatalog({ types: 'ITEM,CATEGORY,IMAGE' });
  const categories = {};
  const images = {};
  const items = [];

  for (const obj of objects) {
    if (obj.type === 'CATEGORY') categories[obj.id] = obj.category_data?.name || 'Uncategorized';
    else if (obj.type === 'IMAGE') images[obj.id] = obj.image_data?.url || null;
    else if (obj.type === 'ITEM') items.push(obj);
  }

  const formatted = items.map(item => {
    const data = item.item_data;
    const variations = (data.variations || []).map(v => ({
      id: v.id,
      name: v.item_variation_data?.name || 'Regular',
      priceCents: Number(v.item_variation_data?.price_money?.amount || 0),
      price: `$${(Number(v.item_variation_data?.price_money?.amount || 0) / 100).toFixed(2)}`,
      sku: v.item_variation_data?.sku || null,
    }));

    return {
      id: item.id,
      name: data.name,
      description: data.description || '',
      category: data.category_id ? categories[data.category_id] || 'Uncategorized' : 'Uncategorized',
      imageUrl: data.image_ids?.[0] ? images[data.image_ids[0]] || null : null,
      variations,
      defaultPrice: variations[0]?.price || '$0.00',
      defaultPriceCents: variations[0]?.priceCents || 0,
    };
  });

  formatted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  setCache('menu_items', formatted);
  return formatted;
}

export async function getTicketTypes() {
  const allItems = await getMenuItems();
  return allItems.filter(item =>
    item.category.toLowerCase().includes('ticket') ||
    item.name.toLowerCase().includes('ticket') ||
    item.name.toLowerCase().includes('admission')
  );
}

export async function getConcessionItems() {
  const allItems = await getMenuItems();
  return allItems.filter(item =>
    !item.category.toLowerCase().includes('ticket') &&
    !item.name.toLowerCase().includes('ticket') &&
    !item.name.toLowerCase().includes('admission')
  );
}
