const CACHE_NAME = 'calculadora-madeira-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/calc.html',
    '/orcamentos.html',
    '/perfil.html',
    '/configuracoes.html',
    '/styles.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Filtrar URLs problemáticas
    const url = event.request.url;
    
    // Ignorar URLs de chrome-extension e outros protocolos não suportados
    if (url.startsWith('chrome-extension://') || 
        url.startsWith('chrome://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('safari-extension://') ||
        url.startsWith('edge-extension://')) {
        return;
    }
    
    // Ignorar requests que não são GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Servindo do cache:', event.request.url);
                    return response;
                }
                
                console.log('Service Worker: Buscando da rede:', event.request.url);
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            // Verificar novamente se a URL é cacheable
                            if (!event.request.url.startsWith('chrome-extension://') &&
                                !event.request.url.startsWith('chrome://') &&
                                !event.request.url.startsWith('moz-extension://') &&
                                !event.request.url.startsWith('safari-extension://') &&
                                !event.request.url.startsWith('edge-extension://')) {
                                cache.put(event.request, responseToCache);
                            }
                        })
                        .catch(error => {
                            console.log('Service Worker: Erro ao cachear:', error);
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