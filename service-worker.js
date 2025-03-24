const CACHE_NAME = 'calc-madeira-v1';
const urlsToCache = [
    '/calculamadeira/',
    '/calculamadeira/index.html',
    '/calculamadeira/calc.html',
    '/calculamadeira/perfil.html',
    '/calculamadeira/configuracoes.html',
    '/calculamadeira/notificacoes.html',
    '/calculamadeira/ajuda.html',
    '/calculamadeira/planos.html',
    '/calculamadeira/orcamentos.html',
    '/calculamadeira/auth.js',
    '/calculamadeira/version.js',
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

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação do Service Worker
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

// Interceptação de requisições
self.addEventListener('fetch', event => {
    // Ignorar requisições para o service worker
    if (event.request.url.includes('service-worker.js')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retornar resposta do cache se existir
                if (response) {
                    return response;
                }

                // Buscar da rede
                return fetch(event.request)
                    .then(response => {
                        // Verificar se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar a resposta para poder usá-la duas vezes
                        const responseToCache = response.clone();

                        // Adicionar ao cache
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Em caso de erro na rede, tentar retornar do cache
                        return caches.match(event.request);
                    });
            })
    );
});

// Receber mensagens do cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
}); 