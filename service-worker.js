/**
 * Service Worker - Calculadora de Madeira
 * Responsável pelo cache e funcionamento offline (PWA)
 * Versão atualizada para arquitetura modular COMPLETA
 */

const CACHE_NAME = 'calculadora-madeira-v2.4.0';
const urlsToCache = [
    // Páginas principais
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
    
    // CSS modular - ARQUITETURA COMPLETA
    '/css/main.css',
    '/css/base/variables.css',
    '/css/base/reset.css',
    '/css/components/header.css',
    '/css/components/forms.css',
    '/css/components/results.css',
    '/css/pages/auth.css',
    '/css/pages/profile.css',
    '/css/pages/plans.css',
    '/css/pages/admin.css',
    '/css/pages/notifications.css',
    '/css/pages/settings.css',
    '/css/pages/payment-terms.css',
    '/css/pages/help.css',
    
    // JavaScript modular - ARQUITETURA COMPLETA
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
    '/js/pages/plans.js',
    '/js/pages/admin.js',
    '/js/pages/notifications.js',
    '/js/pages/settings.js',
    '/js/pages/payment-terms.js',
    '/js/pages/help.js',
    
    // PWA essentials
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-384x384.png',
    '/favicon.ico',
    
    // Compatibilidade (temporário)
    '/auth.js',
    '/pwa-updater.js',
    '/update-checker.js'
];

self.addEventListener('install', (event) => {
    console.log('📦 Service Worker instalando v2.4.0 - Arquitetura Modular COMPLETA');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📁 Cache aberto:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Todos os arquivos foram cached com sucesso');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Erro ao fazer cache dos arquivos:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando v2.4.0');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker ativado - v2.4.0');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Filtrar apenas requisições que devem ser cacheadas
    if (event.request.method !== 'GET' || 
        event.request.url.includes('chrome-extension://') ||
        event.request.url.includes('moz-extension://') ||
        event.request.url.includes('localhost:') ||
        event.request.url.includes('127.0.0.1:') ||
        event.request.url.includes('analytics') ||
        event.request.url.includes('gtag') ||
        event.request.url.includes('google') ||
        event.request.url.includes('facebook') ||
        event.request.url.includes('twitter') ||
        event.request.url.includes('api.') ||
        event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna o cache se encontrado
                if (response) {
                    return response;
                }
                
                // Senão, busca na rede
                return fetch(event.request).then((response) => {
                    // Verifica se é uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clona a resposta
                    const responseToCache = response.clone();
                    
                    // Adiciona ao cache apenas arquivos relevantes
                    if (shouldCache(event.request.url)) {
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    
                    return response;
                });
            })
            .catch(() => {
                // Fallback para offline - retorna página principal se disponível
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

/**
 * Determina se uma URL deve ser cacheada
 */
function shouldCache(url) {
    const cacheableExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json'];
    const uncacheableStrings = ['analytics', 'gtag', 'facebook', 'twitter', 'google-analytics'];
    
    // Não cachear URLs que contêm strings problemáticas
    if (uncacheableStrings.some(str => url.includes(str))) {
        return false;
    }
    
    // Cachear URLs com extensões relevantes
    return cacheableExtensions.some(ext => url.includes(ext));
}

/**
 * Mensagem de atualização disponível
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('🔄 Forçando atualização do Service Worker');
        self.skipWaiting();
    }
});

console.log('🎉 Service Worker v2.4.0 carregado - Arquitetura Modular COMPLETA!'); 