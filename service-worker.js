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
    '/images/card5-2.jpg'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { credentials: 'same-origin' })));
            })
            .catch(error => {
                console.error('Error in cache.addAll():', error);
                return Promise.reject(error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Add it to the cache
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => {
                                console.error('Error in cache.put():', error);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // You might want to return a custom offline image here
                        return caches.match('/images/placeholder.webp');
                    });
            })
    );
});
