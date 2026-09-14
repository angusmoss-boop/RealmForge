const CACHE = 'realmforge-v9-6-2-pwa-v1';
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./js/data.js",
  "./js/main.js",
  "./js/state.js",
  "./js/ui.js",
  "./js/v2.js",
  "./js/v3.js",
  "./js/v4.js",
  "./js/v5.js",
  "./js/v6.js",
  "./js/v7.js",
  "./js/v8.js",
  "./js/v8_1.js",
  "./js/v8_2.js",
  "./js/v8_3.js",
  "./js/v9.js",
  "./js/v9_1.js",
  "./js/v9_2.js",
  "./js/v9_3.js",
  "./js/v9_4.js",
  "./js/v9_5.js",
  "./js/v9_6.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
