// sw.js
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
    // Отвечаем только на GET-запросы и только на свои URL
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== location.origin) {
        // Пропускаем POST и запросы к другим доменам (Supabase)
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
                        // Клонируем только успешные GET-ответы
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