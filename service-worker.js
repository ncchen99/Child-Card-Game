const CACHE_NAME = 'card-game-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/images/card1-1.webp',
    '/images/card1-2.webp',
    '/images/card2-1.jpg',
    '/images/card2-2.jpg',
    '/images/card3-1.jpg',
    '/images/card3-2.jpg',
    '/images/card4-1.jpg',
    '/images/card4-2.jpg',
    '/images/card5-1.jpg',
    '/images/card5-2.jpg',
    '/images/placeholder.webp',
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching all assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('All assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Pre-caching failed:', error);
            })
    );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch event - 離線優先策略
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => {
                                console.error('Cache put failed:', error);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                            return caches.match('/images/placeholder.webp');
                        }
                        return new Response('Offline content not available');
                    });
            })
    );
});
