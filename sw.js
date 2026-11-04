const CACHE_NAME = 'ayet-app-v3';

// Kurulum: Eski önbellekleri sil ve hemen aktif ol
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Eski 5 ayetli hafızayı tamamen siler
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// veri.csv dosyasını her zaman ÖNCE İNTERNETTEN (güncel sunucudan) çek
self.addEventListener('fetch', function(event) {
  if (event.request.url.indexOf('veri.csv') !== -1) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          var clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clonedResponse);
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
