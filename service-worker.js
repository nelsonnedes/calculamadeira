/**
 * Service Worker - Calculadora de Madeira
 * Responsável pelo cache e funcionamento offline (PWA)
 * Versão atualizada para arquitetura modular
 */

const CACHE_NAME = 'calculadora-madeira-v2.3.0';
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
    
    // CSS modular
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
    
    // JavaScript modular
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
    
    // PWA e ícones
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    
    // Compatibilidade
    '/auth.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando versão', CACHE_NAME);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cache aberto, adicionando arquivos...');
                
                // Filtrar URLs válidas e adicionar ao cache
                const validUrls = urlsToCache.filter(url => {
                    // Verificar se é uma URL válida
                    try {
                        new URL(url, self.location);
                        return true;
                    } catch {
                        // Se for um caminho relativo válido
                        return url.startsWith('/') && !url.includes('..') && !url.includes('//');
                    }
                });
                
                return cache.addAll(validUrls);
            })
            .then(() => {
                console.log('✅ Service Worker: Todos os arquivos foram cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Erro ao fazer cache:', error);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Ativando versão', CACHE_NAME);
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Deletar caches antigos
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('calculadora-madeira-')) {
                        console.log('🗑️ Service Worker: Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Cache limpo, assumindo controle');
            return self.clients.claim();
        })
    );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // Ignorar requisições não GET ou com esquemas especiais
    if (request.method !== 'GET' || 
        !request.url.startsWith('http') ||
        request.url.includes('chrome-extension') ||
        request.url.includes('extension') ||
        request.url.includes('moz-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Retornar do cache se disponível
                if (response) {
                    console.log('📋 Service Worker: Servindo do cache:', request.url);
                    return response;
                }
                
                // Senão, buscar da rede
                console.log('🌐 Service Worker: Buscando da rede:', request.url);
                return fetch(request).then((response) => {
                    // Verificar se é uma resposta válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar a resposta pois ela pode ser consumida apenas uma vez
                    const responseToCache = response.clone();
                    
                    // Adicionar ao cache se for um recurso da nossa aplicação
                    if (request.url.startsWith(self.location.origin)) {
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                    }
                    
                    return response;
                }).catch((error) => {
                    console.warn('⚠️ Service Worker: Erro na rede:', error);
                    
                    // Para páginas HTML, retornar a página offline se disponível
                    if (request.destination === 'document') {
                        return caches.match('/offline.html').then((offlineResponse) => {
                            return offlineResponse || new Response(
                                '<h1>Sem conexão</h1><p>Verifique sua conexão com a internet.</p>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        });
                    }
                    
                    return new Response('Recurso não disponível offline', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Mensagem recebida:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⏭️ Service Worker: Pulando espera...');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'CACHE_STATUS') {
        caches.keys().then((cacheNames) => {
            event.ports[0].postMessage({
                type: 'CACHE_STATUS',
                caches: cacheNames,
                current: CACHE_NAME,
                urlsCount: urlsToCache.length
            });
        });
    }
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: Sincronização em background');
        event.waitUntil(doBackgroundSync());
    }
});

// Função de sincronização
async function doBackgroundSync() {
    try {
        // Aqui você pode implementar lógica para sincronizar dados
        // quando a conexão voltar, como enviar cálculos salvos offline
        console.log('✅ Service Worker: Sincronização concluída');
    } catch (error) {
        console.error('❌ Service Worker: Erro na sincronização:', error);
    }
}

console.log('📦 Service Worker carregado - Versão:', CACHE_NAME); 