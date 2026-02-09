const CACHE_NAME = 'bible-reading-v1.0.14';
const ASSETS = [
    './',
    './index.html',
    './guide.html',
    './summary.html',
    './css/style.css',
    './css/guide.css',
    './css/summary.css',
    './js/app.js',
    './js/i18n.js',
    './js/summary.js',
    './js/pwa-handler.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './ref/tut01_tool.png',
    '../data/reading_plan.json',
    '../data/summary_texts.json',
    '../data/bible.js',
    '../data/bible_en.js'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
