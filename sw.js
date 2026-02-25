const CACHE_VERSION = 'v0.4';
const CACHE_PREFIX = `seoul-elevation-map-${CACHE_VERSION}`;
const APP_CACHE = `${CACHE_PREFIX}-app`;
const CDN_CACHE = `${CACHE_PREFIX}-cdn`;
const TILE_CACHE = `${CACHE_PREFIX}-tiles`;
const KNOWN_CACHES = [APP_CACHE, CDN_CACHE, TILE_CACHE];

const APP_SHELL = ['/', '/index.html', '/manifest.json'];
const CDN_RESOURCES = [
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  'https://unpkg.com/maplibre-contour@0.0.7/dist/index.min.js'
];

const TILE_CACHE_MAX_ENTRIES = 450;
const TILE_CACHE_MAX_BYTES = 180 * 1024 * 1024;
const CDN_CACHE_MAX_ENTRIES = 16;
const CDN_CACHE_MAX_BYTES = 12 * 1024 * 1024;

const TILE_HOST_MATCHERS = ['cartocdn.com', 'wmflabs.org', 'amazonaws.com', 'openfreemap.org'];
const cacheStats = { hits: 0, misses: 0 };
const cacheMeta = new Map();
let lastStatsBroadcastAt = 0;

function cacheMetaKey(cacheName, requestUrl) {
  return `${cacheName}::${requestUrl}`;
}

function estimateResponseBytes(request, response) {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 0) return contentLength;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('javascript') || request.url.endsWith('.js')) return 300 * 1024;
  if (contentType.includes('css') || request.url.endsWith('.css')) return 80 * 1024;
  if (contentType.includes('png') || request.url.endsWith('.png')) return 120 * 1024;
  if (contentType.includes('webp') || request.url.endsWith('.webp')) return 70 * 1024;
  if (contentType.includes('json') || request.url.endsWith('.json')) return 20 * 1024;
  return 60 * 1024;
}

function touchCacheMeta(cacheName, requestUrl, response) {
  const key = cacheMetaKey(cacheName, requestUrl);
  const existing = cacheMeta.get(key);
  const size = response ? estimateResponseBytes({ url: requestUrl }, response) : (existing?.size || 60 * 1024);
  cacheMeta.set(key, { size, lastAccess: Date.now() });
}

async function enforceCacheBudget(cacheName, maxEntries, maxBytes) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const entries = requests.map((request) => {
    const key = cacheMetaKey(cacheName, request.url);
    if (!cacheMeta.has(key)) {
      cacheMeta.set(key, { size: 60 * 1024, lastAccess: 0 });
    }
    const meta = cacheMeta.get(key);
    return { request, key, size: meta.size, lastAccess: meta.lastAccess };
  });

  let totalBytes = entries.reduce((sum, entry) => sum + entry.size, 0);
  if (entries.length <= maxEntries && totalBytes <= maxBytes) return;

  entries.sort((a, b) => a.lastAccess - b.lastAccess);
  while ((entries.length > maxEntries || totalBytes > maxBytes) && entries.length > 0) {
    const oldest = entries.shift();
    await cache.delete(oldest.request);
    cacheMeta.delete(oldest.key);
    totalBytes -= oldest.size;
  }
}

function markCacheResult(hit) {
  if (hit) cacheStats.hits += 1;
  else cacheStats.misses += 1;
  const now = Date.now();
  if (now - lastStatsBroadcastAt < 4000) return;
  lastStatsBroadcastAt = now;
  broadcastCacheStats();
}

async function broadcastCacheStats() {
  const allClients = await self.clients.matchAll({ type: 'window' });
  allClients.forEach((client) => {
    client.postMessage({ type: 'sw-cache-stats', hits: cacheStats.hits, misses: cacheStats.misses });
  });
}

function isTileRequest(url) {
  return TILE_HOST_MATCHERS.some((matcher) => url.hostname.includes(matcher));
}

function emptyPngResponse() {
  return new Response(
    new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], { type: 'image/png' }),
    { status: 200, headers: { 'Content-Type': 'image/png' } }
  );
}

async function updateCache(cacheName, request, maxEntries, maxBytes) {
  const response = await fetch(request);
  const cacheable = response.ok || response.type === 'opaque';
  if (!cacheable) return response;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  touchCacheMeta(cacheName, request.url, response);
  await enforceCacheBudget(cacheName, maxEntries, maxBytes);
  return response;
}

async function tileStaleWhileRevalidate(request, event) {
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    markCacheResult(true);
    touchCacheMeta(TILE_CACHE, request.url);
    event.waitUntil(
      updateCache(TILE_CACHE, request, TILE_CACHE_MAX_ENTRIES, TILE_CACHE_MAX_BYTES).catch(() => {})
    );
    return cached;
  }

  markCacheResult(false);
  try {
    return await updateCache(TILE_CACHE, request, TILE_CACHE_MAX_ENTRIES, TILE_CACHE_MAX_BYTES);
  } catch {
    return emptyPngResponse();
  }
}

async function cdnStaleWhileRevalidate(request, event) {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    markCacheResult(true);
    touchCacheMeta(CDN_CACHE, request.url);
    event.waitUntil(
      updateCache(CDN_CACHE, request, CDN_CACHE_MAX_ENTRIES, CDN_CACHE_MAX_BYTES).catch(() => {})
    );
    return cached;
  }

  markCacheResult(false);
  return updateCache(CDN_CACHE, request, CDN_CACHE_MAX_ENTRIES, CDN_CACHE_MAX_BYTES);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const appCache = await caches.open(APP_CACHE);
    await appCache.addAll(APP_SHELL);

    const cdnCache = await caches.open(CDN_CACHE);
    await Promise.allSettled(
      CDN_RESOURCES.map(async (url) => {
        try {
          const response = await fetch(url, { mode: 'no-cors' });
          await cdnCache.put(url, response);
          touchCacheMeta(CDN_CACHE, url, response);
        } catch {
          // ignore CDN warmup failures
        }
      })
    );
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const existing = await caches.keys();
    await Promise.all(
      existing
        .filter((cacheName) => !KNOWN_CACHES.includes(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();
    await broadcastCacheStats();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'sw-report-cache-stats') {
    event.waitUntil(broadcastCacheStats());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (isTileRequest(url)) {
    event.respondWith(tileStaleWhileRevalidate(request, event));
    return;
  }

  if (CDN_RESOURCES.includes(request.url)) {
    event.respondWith(cdnStaleWhileRevalidate(request, event));
    return;
  }

  if (request.mode === 'navigate' || APP_SHELL.includes(url.pathname)) {
    event.respondWith((async () => {
      try {
        const network = await fetch(request);
        const appCache = await caches.open(APP_CACHE);
        appCache.put(request, network.clone());
        markCacheResult(false);
        return network;
      } catch {
        markCacheResult(true);
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match('/index.html');
      }
    })());
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
