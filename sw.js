// sw.js – улучшенная версия
const CACHE_NAME = 'arm-v1';
const STATIC_CACHE = 'arm-static-v1';
const API_CACHE = 'arm-api-v1';

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

// Активация
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

// Перехват запросов
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API-запросы кешируем с сетью в приоритете
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

    // Статика – сначала кеш, потом сеть
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});