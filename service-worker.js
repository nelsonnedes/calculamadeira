const CACHE_NAME = 'calculadora-madeira-v2.1.0';
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

// Função para verificar se a URL é cacheable - VERSÃO ULTRA ROBUSTA
function isCacheableRequest(request) {
    const url = request.url;
    
    // PRIMEIRA BARREIRA: Verificar esquemas não cacheáveis
    const nonCacheableSchemes = [
        'chrome-extension',
        'chrome:',
        'moz-extension',
        'safari-extension',
        'edge-extension',
        'about:',
        'blob:',
        'data:',
        'file:',
        'ftp:',
        'ws:',
        'wss:'
    ];
    
    // Verificar se a URL contém qualquer esquema não cacheável
    for (const scheme of nonCacheableSchemes) {
        if (url.includes(scheme)) {
            console.log('Service Worker: URL BLOQUEADA (contém esquema não cacheável):', url);
            return false;
        }
    }
    
    // SEGUNDA BARREIRA: Verificar se começa com esquemas válidos
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log('Service Worker: URL BLOQUEADA (não HTTP/HTTPS):', url);
        return false;
    }
    
    // TERCEIRA BARREIRA: Apenas requests GET são cacheáveis
    if (request.method !== 'GET') {
        console.log('Service Worker: URL não cacheable (método não GET):', url);
        return false;
    }
    
    // QUARTA BARREIRA: Verificar se é uma URL válida
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            console.log('Service Worker: URL BLOQUEADA (protocolo inválido):', url);
            return false;
        }
    } catch (e) {
        console.log('Service Worker: URL BLOQUEADA (URL inválida):', url);
        return false;
    }
    
    console.log('Service Worker: URL é cacheable:', url);
    return true;
}

// Função para limpar todos os caches antigos
function clearOldCaches() {
    return caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    console.log('Service Worker: Removendo cache antigo:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        );
    });
}

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando versão', CACHE_NAME);
    
    // Pular espera e assumir controle imediatamente
    self.skipWaiting();
    
    event.waitUntil(
        clearOldCaches().then(() => {
            return caches.open(CACHE_NAME);
        }).then(cache => {
            console.log('Service Worker: Cache aberto');
            return cache.addAll(urlsToCache);
        }).catch(error => {
            console.error('Service Worker: Erro na instalação:', error);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando versão', CACHE_NAME);
    
    event.waitUntil(
        clearOldCaches().then(() => {
            console.log('Service Worker: Assumindo controle de todas as abas');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    // BLOQUEIO IMEDIATO: Se não for cacheable, ignorar completamente
    if (!isCacheableRequest(event.request)) {
        console.log('Service Worker: IGNORANDO requisição não cacheable:', event.request.url);
        return; // Não processar
    }
    
    // BLOQUEIO SECUNDÁRIO: Verificação extra para extensões
    if (event.request.url.includes('extension')) {
        console.log('Service Worker: BLOQUEANDO URL com extensão:', event.request.url);
        return; // Não processar
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
                        
                        // VERIFICAÇÃO FINAL: Antes de cachear
                        if (!isCacheableRequest(event.request)) {
                            console.log('Service Worker: FINAL - Pulando cache para URL não cacheable:', event.request.url);
                            return response;
                        }
                        
                        // Clonar a resposta para cache
                        const responseToCache = response.clone();
                        
                        // Cachear a resposta de forma segura
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // VERIFICAÇÃO ULTRA FINAL: Última verificação antes de adicionar ao cache
                                if (isCacheableRequest(event.request) && 
                                    !event.request.url.includes('extension') &&
                                    event.request.url.startsWith('http')) {
                                    console.log('Service Worker: Adicionando ao cache:', event.request.url);
                                    return cache.put(event.request, responseToCache);
                                } else {
                                    console.log('Service Worker: FINAL - Bloqueando cache para URL:', event.request.url);
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
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
            .catch(error => {
                console.log('Service Worker: Erro no cache match:', error);
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

// Evento de notificação (se necessário)
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Clique na notificação');
    event.notification.close();
    
    if (event.action === 'update') {
        console.log('Service Worker: Ação de atualização clicada');
        // Implementar lógica de atualização se necessário
    }
    
    // Focar ou abrir a aplicação
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
});

// Limpeza periódica de cache (a cada 5 minutos)
setInterval(() => {
    console.log('Service Worker: Executando limpeza periódica de cache');
    clearOldCaches();
}, 300000); // 5 minutos 