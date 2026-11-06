const CACHE_NAME = 'ayet-app-v4';

// Yeni sürüm yüklendiğinde eski hafızayı anında siler
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// index.html ve veri.csv dosyalarını her zaman doğrudan güncel sunucudan (network-first) çeker
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate' || event.request.url.indexOf('index.html') !== -1 || event.request.url.indexOf('veri.csv') !== -1) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var cloned = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, cloned);
          });
          return response;
        })
        .catch(function() {
          return caches.match(event.request);
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});
