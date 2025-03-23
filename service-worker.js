const CACHE_NAME = 'calc-madeira-v1';
const urlsToCache = [
    '/calculamadeira/',
    '/calculamadeira/index.html',
    '/calculamadeira/calc.html',
    '/calculamadeira/perfil.html',
    '/calculamadeira/configuracoes.html',
    '/calculamadeira/notificacoes.html',
    '/calculamadeira/ajuda.html',
    '/calculamadeira/manifest.json',
    '/calculamadeira/logo.png',
    '/calculamadeira/icons/icon-72x72.png',
    '/calculamadeira/icons/icon-96x96.png',
    '/calculamadeira/icons/icon-128x128.png',
    '/calculamadeira/icons/icon-144x144.png',
    '/calculamadeira/icons/icon-152x152.png',
    '/calculamadeira/icons/icon-192x192.png',
    '/calculamadeira/icons/icon-384x384.png',
    '/calculamadeira/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

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
                            });
                        return response;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 