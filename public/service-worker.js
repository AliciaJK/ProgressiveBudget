// install event handler
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static').then( cache => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './icons/icon-192x192.png',
        './icons/icon-512x512.png',
      ]);
    })
  );
  console.log('Install');
  self.skipWaiting();
});

// retrieve assets from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then( response => {
      return response || fetch(event.request);
    })
  );
});

// THE FOLLOWING IS FROM THE MINI PROJECT

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});

