const CACHE_NAME = 'fox-couture-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Bypass service worker caching for local development to avoid HMR and local cache locks
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.port === '3000' || url.port === '5173') {
    return;
  }

  // Only handle GET requests
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    fetch(e.request).then((response) => {
      // Dynamically cache valid responses in production
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      // Offline fallback
      return caches.match(e.request);
    })
  );
});
