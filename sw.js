const CACHE_NAME = 'seoul-elevation-map-v9';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
];

// External CDN resources to cache (updated versions)
const CDN_RESOURCES = [
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js',
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        return caches.open(CACHE_NAME + '-cdn')
          .then((cdnCache) => {
            console.log('[SW] Caching CDN resources');
            return Promise.allSettled(
              CDN_RESOURCES.map(url =>
                fetch(url, { mode: 'no-cors' })
                  .then(response => cdnCache.put(url, response))
                  .catch(err => console.log('[SW] Failed to cache:', url))
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - wipe ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== CACHE_NAME + '-cdn' && name !== CACHE_NAME + '-tiles')
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Map tiles - cache first (tiles don't change)
  if (url.hostname.includes('cartocdn.com') ||
      url.hostname.includes('wmflabs.org') ||
      url.hostname.includes('amazonaws.com')) {
    event.respondWith(
      caches.open(CACHE_NAME + '-tiles').then((cache) => {
        return cache.match(request).then((response) => {
          if (response) return response;
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return new Response(
              new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], { type: 'image/png' }),
              { status: 200, headers: { 'Content-Type': 'image/png' } }
            );
          });
        });
      })
    );
    return;
  }

  // CDN resources - cache first (versioned URLs don't change)
  if (CDN_RESOURCES.includes(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME + '-cdn').then((cache) => {
        return cache.match(request).then((response) => {
          if (response) return response;
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // App shell (index.html) - NETWORK FIRST so updates deploy immediately
  if (request.mode === 'navigate' || APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        // Update cache with fresh version
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match(request);
      })
    );
    return;
  }

  // Default - network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
