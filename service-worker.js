const CACHE_NAME = 'calc-madeira-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/calc.html',
    '/perfil.html',
    '/orcamentos.html',
    '/planos.html',
    '/configuracoes.html',
    '/notificacoes.html',
    '/ajuda.html',
    '/styles.css',
    '/auth.js',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/logo.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando versão', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando versão', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Removendo cache antigo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        }).then(() => {
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        version: CACHE_NAME
                    });
                });
            });
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    fetch(event.request)
                        .then(fetchResponse => {
                            if (fetchResponse && fetchResponse.status === 200) {
                                const responseToCache = fetchResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                        })
                        .catch(() => {
                        });
                    
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

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        console.log('Service Worker: Verificando atualizações...');
        event.ports[0].postMessage({
            type: 'UPDATE_CHECK_COMPLETE',
            hasUpdate: true
        });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('sync', event => {
    if (event.tag === 'check-update') {
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CHECK_UPDATE_AVAILABLE'
                    });
                });
            })
        );
    }
});

self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        if (data.type === 'update') {
            event.waitUntil(
                self.registration.showNotification('Calculadora de Madeira', {
                    body: 'Nova atualização disponível!',
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: 'update',
                    requireInteraction: true,
                    actions: [
                        {
                            action: 'update',
                            title: 'Atualizar Agora'
                        },
                        {
                            action: 'later',
                            title: 'Mais Tarde'
                        }
                    ]
                })
            );
        }
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'update') {
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                if (clients.length > 0) {
                    clients[0].focus();
                    clients[0].postMessage({
                        type: 'FORCE_UPDATE'
                    });
                } else {
                    self.clients.openWindow('/');
                }
            })
        );
    }
}); 