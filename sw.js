const CACHE_NAME = 'arm-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/js/dashboard.js',
    '/js/orders.js',
    '/js/fleet.js',
    '/js/links.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Кеширование ресурсов');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Ошибка кеширования:', err))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Не кешируем POST, PUT, DELETE и т.п.
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(err => console.warn('[SW] Не удалось закешировать:', err));
                        return networkResponse;
                    })
                    .catch(() => {
                        return new Response('Офлайн-режим: ресурс не доступен', { status: 503 });
                    });
            })
    );
});