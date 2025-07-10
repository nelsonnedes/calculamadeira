const CACHE_NAME = 'calc-madeira-v2.1.0';
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
    '/pwa-updater.js',
    '/update-checker.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
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
                console.log('Service Worker: Pulando espera para ativação imediata');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Erro durante instalação:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando versão', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('calc-madeira-')) {
                        console.log('Service Worker: Removendo cache antigo', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Assumindo controle de todas as abas');
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
    // Estratégia Network First para HTML (sempre buscar versão mais recente)
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Se conseguiu buscar online, atualizar cache
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Se offline, usar cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Estratégia Cache First para outros recursos
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Buscar atualização em background
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
                            // Ignorar erros de rede
                        });
                    
                    return response;
                }
                
                // Se não está em cache, buscar online
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
    console.log('Service Worker: Mensagem recebida:', event.data);
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        console.log('Service Worker: Verificando atualizações...');
        event.ports[0].postMessage({
            type: 'UPDATE_CHECK_COMPLETE',
            hasUpdate: true,
            version: CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Pulando espera e assumindo controle');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION_RESPONSE',
            version: CACHE_NAME
        });
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
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-192x192.png',
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

// Forçar verificação de atualização periodicamente
setInterval(() => {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'CHECK_UPDATE_AVAILABLE'
            });
        });
    });
}, 60000); // A cada minuto 