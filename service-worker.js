// service-worker.js
const CACHE_NAME = 'arm-v0.1'; // Меняй версию (v2, v3) при глобальных правках

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Сразу активировать новый SW
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
        })
    );
});