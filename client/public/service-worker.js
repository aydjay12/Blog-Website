/* eslint-disable no-restricted-globals */

// Service Worker for caching Font Awesome and other external resources
const CACHE_NAME = 'blog-website-cache-v1';
const FONT_AWESOME_CACHE = 'font-awesome-cache-v1';

// Resources to cache immediately on install
const urlsToCache = [
    '/',
    '/index.html',
    '/static/css/main.css',
    '/static/js/main.js',
];

// External resources to cache (Font Awesome)
const externalResourcesToCache = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-brands-400.woff2',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        Promise.all([
            // Cache local resources
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache).catch((err) => {
                    console.warn('[Service Worker] Failed to cache some app resources:', err);
                });
            }),
            // Cache Font Awesome resources
            caches.open(FONT_AWESOME_CACHE).then((cache) => {
                console.log('[Service Worker] Caching Font Awesome resources');
                return Promise.all(
                    externalResourcesToCache.map((url) =>
                        fetch(url, { mode: 'cors' })
                            .then((response) => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                                console.warn(`[Service Worker] Failed to cache ${url}`);
                            })
                            .catch((err) => {
                                console.warn(`[Service Worker] Error caching ${url}:`, err);
                            })
                    )
                );
            }),
        ]).then(() => {
            console.log('[Service Worker] Installation complete');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== FONT_AWESOME_CACHE) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network, then cache new resources
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle Font Awesome and other CDN resources
    if (
        url.hostname === 'cdnjs.cloudflare.com' ||
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com'
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    // Return cached version and update cache in background
                    fetch(request, { mode: 'cors' })
                        .then((response) => {
                            if (response && response.ok) {
                                caches.open(FONT_AWESOME_CACHE).then((cache) => {
                                    cache.put(request, response.clone());
                                });
                            }
                        })
                        .catch(() => {
                            // Network failed, but we have cache
                            console.log('[Service Worker] Network failed, using cache for:', request.url);
                        });
                    return cachedResponse;
                }

                // Not in cache, fetch from network and cache it
                return fetch(request, { mode: 'cors' })
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(FONT_AWESOME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                            console.log('[Service Worker] Cached new resource:', request.url);
                        });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed for:', request.url, error);
                        throw error;
                    });
            })
        );
        return;
    }

    // Handle app resources with network-first strategy
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the fetched resource
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[Service Worker] Network failed, serving from cache:', request.url);
                        return cachedResponse;
                    }
                    // If not in cache and network failed, return error
                    console.error('[Service Worker] No cache available for:', request.url);
                });
            })
    );
});

// Message event - for manual cache updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(FONT_AWESOME_CACHE).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});
