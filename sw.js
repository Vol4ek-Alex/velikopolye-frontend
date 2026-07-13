// sw.js
const CACHE_NAME = 'arm-v3';
const STATIC_CACHE = 'arm-static-v3';
const API_CACHE = 'arm-api-v3';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/js/dashboard.js',
    '/js/orders.js',
    '/js/fleet.js',
    '/js/links.js',
    '/js/repair_requests.js',
    '/js/my_lists.js',
    '/js/inspection.js'
];

// Установка
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Активация – удаляем старые кэши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== API_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Перехват запросов – сначала сеть, потом кэш
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API-запросы: сначала сеть, потом кэш (для офлайн)
    if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(API_CACHE).then(cache => {
                        cache.put(event.request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Статика: сначала сеть (всегда свежая), если сеть недоступна – кэш
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Если успешно загрузили из сети – обновляем кэш
                const clone = response.clone();
                caches.open(STATIC_CACHE).then(cache => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                // Если сеть недоступна – берём из кэша
                return caches.match(event.request);
            })
    );
});

// Автоматическое обновление приложения при переходе на сайт
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});