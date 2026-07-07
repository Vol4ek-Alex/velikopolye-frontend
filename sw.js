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

// Установка
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

// Активация
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

// Перехват fetch – исправленная версия
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Если нет в кеше, идём в сеть
                return fetch(event.request)
                    .then(networkResponse => {
                        // Клонируем только если ответ успешный
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        // Клонируем для кеширования
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(err => console.warn('[SW] Не удалось закешировать:', err));
                        return networkResponse;
                    })
                    .catch(() => {
                        // Если сеть недоступна, можно вернуть fallback
                        return new Response('Офлайн-режим: ресурс не доступен', { status: 503 });
                    });
            })
    );
});