const CACHE_NAME = 'arm-v4.2-' + Date.now(); // уникальный ключ версии

// Файлы для кэширования
const ASSETS = [
  'index.html',
  'manifest.json'
];

// Активация и удаление СТАРОГО кэша
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Удален старый кэш:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Умный перехват запросов: берем из сети, если не получается — из кэша.
// Для JS модулей мы всегда форсируем проверку сети.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Если это файл модуля или имеет метку ?v=, всегда берем свежий из сети
  if (url.pathname.includes('/js/') || url.search.includes('v=')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Для остальных ресурсов (картинки, каркас)
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});