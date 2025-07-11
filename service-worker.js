const CACHE_NAME = 'calculadora-madeira-v2.0.4';
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

// Função para verificar se a URL é cacheable
function isCacheableRequest(request) {
    const url = request.url;
    
    // Log da URL para debug
    console.log('Service Worker: Verificando URL:', url);
    
    // Ignorar URLs de extensões do navegador
    if (url.startsWith('chrome-extension://') || 
        url.startsWith('chrome://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('safari-extension://') ||
        url.startsWith('edge-extension://') ||
        url.startsWith('about:') ||
        url.startsWith('blob:') ||
        url.startsWith('data:')) {
        console.log('Service Worker: URL não cacheable (extensão/protocolo especial):', url);
        return false;
    }
    
    // Apenas requests GET são cacheáveis
    if (request.method !== 'GET') {
        console.log('Service Worker: URL não cacheable (método não GET):', url);
        return false;
    }
    
    console.log('Service Worker: URL é cacheable:', url);
    return true;
}

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando versão', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Erro na instalação:', error);
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
                        console.log('Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Verificar se a requisição é cacheable ANTES de qualquer processamento
    if (!isCacheableRequest(event.request)) {
        console.log('Service Worker: Ignorando requisição não cacheable:', event.request.url);
        // Retornar imediatamente sem processar
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
                return fetch(event.request)
                    .then(response => {
                        // Verificar se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            console.log('Service Worker: Resposta inválida, não cacheando:', event.request.url);
                            return response;
                        }
                        
                        // Verificar NOVAMENTE se é cacheable antes de qualquer operação de cache
                        if (!isCacheableRequest(event.request)) {
                            console.log('Service Worker: Pulando cache para URL não cacheable:', event.request.url);
                            return response;
                        }
                        
                        // Clonar a resposta para cache
                        const responseToCache = response.clone();
                        
                        // Cachear a resposta de forma segura
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Tripla verificação antes de adicionar ao cache
                                if (isCacheableRequest(event.request)) {
                                    console.log('Service Worker: Adicionando ao cache:', event.request.url);
                                    return cache.put(event.request, responseToCache);
                                } else {
                                    console.log('Service Worker: Bloqueando cache para URL:', event.request.url);
                                    return Promise.resolve();
                                }
                            })
                            .catch(error => {
                                console.error('Service Worker: Erro ao cachear:', error, 'URL:', event.request.url);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.log('Service Worker: Erro na rede:', error);
                        // Retornar uma resposta de fallback se necessário
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
            .catch(error => {
                console.log('Service Worker: Erro no cache match:', error);
                // Tentar buscar da rede como fallback
                return fetch(event.request);
            })
    );
});

self.addEventListener('message', event => {
    console.log('Service Worker: Mensagem recebida:', event.data);
    
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        console.log('Service Worker: Verificando atualizações...');
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
                type: 'UPDATE_CHECK_COMPLETE',
                hasUpdate: true,
                version: CACHE_NAME
            });
        }
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Pulando espera e assumindo controle');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
                type: 'VERSION_RESPONSE',
                version: CACHE_NAME
            });
        }
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
        try {
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
        } catch (error) {
            console.error('Service Worker: Erro ao processar push:', error);
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

// Limpeza periódica de cache antigo
setInterval(() => {
    caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('calculadora-madeira-')) {
                console.log('Service Worker: Limpando cache antigo:', cacheName);
                caches.delete(cacheName);
            }
        });
    });
}, 300000); // A cada 5 minutos 