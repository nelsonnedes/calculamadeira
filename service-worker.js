// Service Worker versão 2.2.0 - Arquitetura Modular Completa
const CACHE_NAME = 'calculadora-madeira-v2.2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/calc.html',
    '/orcamentos.html',
    '/perfil.html',
    '/configuracoes.html',
    '/planos.html',
    '/notificacoes.html',
    '/ajuda.html',
    '/admin.html',
    '/condicoes-pagamento.html',
    '/css/main.css',
    '/css/base/variables.css',
    '/css/base/reset.css',
    '/css/components/header.css',
    '/css/components/forms.css',
    '/css/components/results.css',
    '/css/pages/auth.css',
    '/css/pages/profile.css',
    '/js/core/app.js',
    '/js/modules/calculator.js',
    '/js/modules/storage.js',
    '/js/modules/pdf-generator.js',
    '/js/components/feedback.js',
    '/js/components/menu.js',
    '/js/components/autocomplete.js',
    '/js/utils/formatters.js',
    '/js/pages/auth.js',
    '/js/pages/calc.js',
    '/js/pages/orcamentos.js',
    '/js/pages/perfil.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/auth.js'  // Mantido para compatibilidade
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
    
    // Verificar se a URL tem esquema não cacheável
    for (const scheme of nonCacheableSchemes) {
        if (url.startsWith(scheme)) {
            console.log('SW: Request bloqueado por esquema:', scheme);
            return false;
        }
    }
    
    // SEGUNDA BARREIRA: Verificar domínios não cacheáveis
    const nonCacheableDomains = [
        'chrome.google.com',
        'clients2.google.com',
        'safebrowsing.googleapis.com',
        'update.googleapis.com',
        'accounts.google.com',
        'fonts.gstatic.com', // Exceção: permitir Google Fonts
        'cdnjs.cloudflare.com', // Exceção: permitir CDNJs
        'analytics.google.com',
        'googletagmanager.com',
        'doubleclick.net',
        'googlesyndication.com'
    ];
    
    // Verificar se é um domínio permitido especificamente
    const allowedDomains = [
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com',
        'fonts.googleapis.com'
    ];
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Se for um domínio permitido, cachear
        if (allowedDomains.some(domain => hostname.includes(domain))) {
            return true;
        }
        
        // Se for um domínio não cacheável, não cachear
        if (nonCacheableDomains.some(domain => hostname.includes(domain))) {
            console.log('SW: Request bloqueado por domínio:', hostname);
            return false;
        }
        
        // Se for localhost ou origem local, cachear
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.local')) {
            return true;
        }
        
        // Se for o mesmo origin, cachear
        if (urlObj.origin === self.location.origin) {
            return true;
        }
        
    } catch (e) {
        console.log('SW: Erro ao analisar URL:', e);
        return false;
    }
    
    // TERCEIRA BARREIRA: Verificar métodos HTTP
    if (request.method !== 'GET') {
        console.log('SW: Request bloqueado por método:', request.method);
        return false;
    }
    
    // QUARTA BARREIRA: Verificar tipos de recursos não cacheáveis
    const nonCacheableTypes = [
        '/api/',
        '/socket.',
        '.websocket',
        '/realtime',
        '/live',
        '/stream'
    ];
    
    if (nonCacheableTypes.some(type => url.includes(type))) {
        console.log('SW: Request bloqueado por tipo de recurso');
        return false;
    }
    
    return true;
}

// Event listener para instalação
self.addEventListener('install', event => {
    console.log('SW 2.2.0: Instalando service worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW 2.2.0: Cache aberto, adicionando recursos');
                return cache.addAll(urlsToCache.filter(url => {
                    // Filtrar URLs que podem falhar
                    return !url.includes('chrome-extension') && !url.includes('moz-extension');
                }));
            })
            .catch(error => {
                console.error('SW 2.2.0: Erro ao cachear recursos:', error);
            })
    );
    
    // Forçar ativação imediata
    self.skipWaiting();
});

// Event listener para ativação
self.addEventListener('activate', event => {
    console.log('SW 2.2.0: Ativando service worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Remover caches antigos
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW 2.2.0: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('SW 2.2.0: Service worker ativado');
            return self.clients.claim();
        })
    );
});

// Event listener para fetch
self.addEventListener('fetch', event => {
    // Verificar se a request é cacheável
    if (!isCacheableRequest(event.request)) {
        return; // Não interceptar requests não cacheáveis
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retornar do cache se disponível
                if (response) {
                    console.log('SW 2.2.0: Servindo do cache:', event.request.url);
                    return response;
                }
                
                // Fazer fetch da rede
                console.log('SW 2.2.0: Buscando da rede:', event.request.url);
                return fetch(event.request).then(response => {
                    // Verificar se a response é válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar response para cachear
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                }).catch(error => {
                    console.log('SW 2.2.0: Erro na rede:', error);
                    
                    // Para arquivos HTML, retornar página offline se disponível
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                    
                    throw error;
                });
            })
    );
});

// Event listener para mensagens
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('SW 2.2.0: Recebido comando SKIP_WAITING');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: '2.2.0',
            cacheName: CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('SW 2.2.0: Limpando cache');
        caches.delete(CACHE_NAME).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Notificação para debugging
console.log('SW 2.2.0: Service Worker registrado - Arquitetura Modular Completa'); 