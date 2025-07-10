/**
 * PWA Auto-Updater
 * Sistema de verificação e atualização automática para PWA
 * Versão: 1.0.0
 */

class PWAUpdater {
    constructor() {
        this.registration = null;
        this.updateCheckInterval = 30000; // 30 segundos
        this.forceUpdateInterval = 300000; // 5 minutos
        this.lastUpdateCheck = Date.now();
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        
        this.init();
    }

    async init() {
        console.log('PWA Updater: Inicializando...');
        
        // Registrar Service Worker se disponível
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('PWA Updater: Service Worker registrado com sucesso');
                
                // Configurar listeners
                this.setupServiceWorkerListeners();
                this.setupNetworkListeners();
                this.setupVisibilityListeners();
                
                // Verificar atualizações imediatamente
                this.checkForUpdates();
                
                // Configurar verificação periódica
                this.startPeriodicUpdateCheck();
                
            } catch (error) {
                console.error('PWA Updater: Erro ao registrar Service Worker:', error);
            }
        } else {
            console.warn('PWA Updater: Service Worker não suportado');
        }
    }

    setupServiceWorkerListeners() {
        if (!this.registration) return;

        // Listener para atualizações do Service Worker
        this.registration.addEventListener('updatefound', () => {
            console.log('PWA Updater: Nova versão encontrada');
            const newWorker = this.registration.installing;
            
            if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('PWA Updater: Nova versão instalada');
                        this.updateAvailable = true;
                        this.showUpdateNotification();
                    }
                });
            }
        });

        // Listener para mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event.data);
        });

        // Verificar se já existe uma atualização pendente
        if (this.registration.waiting) {
            console.log('PWA Updater: Atualização pendente detectada');
            this.updateAvailable = true;
            this.showUpdateNotification();
        }
    }

    setupNetworkListeners() {
        // Monitorar status da conexão
        window.addEventListener('online', () => {
            console.log('PWA Updater: Conexão online detectada');
            this.isOnline = true;
            this.checkForUpdates();
        });

        window.addEventListener('offline', () => {
            console.log('PWA Updater: Conexão offline detectada');
            this.isOnline = false;
        });
    }

    setupVisibilityListeners() {
        // Verificar atualizações quando a página volta ao foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                const timeSinceLastCheck = Date.now() - this.lastUpdateCheck;
                if (timeSinceLastCheck > this.updateCheckInterval) {
                    console.log('PWA Updater: Verificando atualizações ao voltar ao foco');
                    this.checkForUpdates();
                }
            }
        });

        // Verificar atualizações quando a janela volta ao foco
        window.addEventListener('focus', () => {
            if (this.isOnline) {
                const timeSinceLastCheck = Date.now() - this.lastUpdateCheck;
                if (timeSinceLastCheck > this.updateCheckInterval) {
                    console.log('PWA Updater: Verificando atualizações ao focar janela');
                    this.checkForUpdates();
                }
            }
        });
    }

    startPeriodicUpdateCheck() {
        // Verificação periódica a cada 30 segundos
        setInterval(() => {
            if (this.isOnline && !document.hidden) {
                this.checkForUpdates();
            }
        }, this.updateCheckInterval);

        // Forçar atualização a cada 5 minutos se necessário
        setInterval(() => {
            if (this.updateAvailable && this.isOnline) {
                console.log('PWA Updater: Forçando atualização automática');
                this.applyUpdate(true);
            }
        }, this.forceUpdateInterval);
    }

    async checkForUpdates() {
        if (!this.registration || !this.isOnline) return;

        try {
            console.log('PWA Updater: Verificando atualizações...');
            this.lastUpdateCheck = Date.now();
            
            // Forçar verificação de atualização
            await this.registration.update();
            
            // Verificar se há cache antigo
            const cacheNames = await caches.keys();
            const currentCacheName = 'calc-madeira-v2.0.0';
            const hasOldCache = cacheNames.some(name => name !== currentCacheName && name.startsWith('calc-madeira-'));
            
            if (hasOldCache) {
                console.log('PWA Updater: Cache antigo detectado, limpando...');
                await this.clearOldCaches();
                this.updateAvailable = true;
                this.showUpdateNotification();
            }
            
        } catch (error) {
            console.error('PWA Updater: Erro ao verificar atualizações:', error);
        }
    }

    async clearOldCaches() {
        try {
            const cacheNames = await caches.keys();
            const currentCacheName = 'calc-madeira-v2.0.0';
            
            const deletePromises = cacheNames
                .filter(name => name !== currentCacheName && name.startsWith('calc-madeira-'))
                .map(name => {
                    console.log('PWA Updater: Removendo cache antigo:', name);
                    return caches.delete(name);
                });
            
            await Promise.all(deletePromises);
            console.log('PWA Updater: Caches antigos removidos');
        } catch (error) {
            console.error('PWA Updater: Erro ao limpar caches:', error);
        }
    }

    handleServiceWorkerMessage(data) {
        console.log('PWA Updater: Mensagem recebida do Service Worker:', data);
        
        switch (data.type) {
            case 'SW_UPDATED':
                console.log('PWA Updater: Service Worker atualizado para versão:', data.version);
                this.updateAvailable = true;
                this.showUpdateNotification();
                break;
                
            case 'CHECK_UPDATE_AVAILABLE':
                console.log('PWA Updater: Verificação de atualização solicitada');
                this.checkForUpdates();
                break;
                
            case 'FORCE_UPDATE':
                console.log('PWA Updater: Atualização forçada solicitada');
                this.applyUpdate(true);
                break;
        }
    }

    showUpdateNotification() {
        // Remover notificação existente se houver
        this.hideUpdateNotification();
        
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-update-content">
                <i class="fas fa-download"></i>
                <div class="pwa-update-text">
                    <strong>Nova versão disponível!</strong>
                    <p>Atualize para obter as últimas melhorias.</p>
                </div>
                <div class="pwa-update-actions">
                    <button class="pwa-update-btn pwa-update-btn-primary" onclick="pwaUpdater.applyUpdate()">
                        Atualizar
                    </button>
                    <button class="pwa-update-btn pwa-update-btn-secondary" onclick="pwaUpdater.hideUpdateNotification()">
                        Depois
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        this.addUpdateNotificationStyles();
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        console.log('PWA Updater: Notificação de atualização exibida');
    }

    hideUpdateNotification() {
        const notification = document.getElementById('pwa-update-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    async applyUpdate(force = false) {
        console.log('PWA Updater: Aplicando atualização...');
        
        try {
            // Esconder notificação
            this.hideUpdateNotification();
            
            // Mostrar indicador de carregamento
            this.showLoadingIndicator();
            
            // Limpar todos os caches
            await this.clearAllCaches();
            
            // Se há um service worker esperando, ativá-lo
            if (this.registration && this.registration.waiting) {
                this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Aguardar um momento para o service worker se atualizar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Recarregar a página
            console.log('PWA Updater: Recarregando página...');
            window.location.reload(true);
            
        } catch (error) {
            console.error('PWA Updater: Erro ao aplicar atualização:', error);
            this.hideLoadingIndicator();
            this.showErrorMessage('Erro ao atualizar. Tente novamente.');
        }
    }

    async clearAllCaches() {
        try {
            const cacheNames = await caches.keys();
            const deletePromises = cacheNames.map(name => {
                console.log('PWA Updater: Removendo cache:', name);
                return caches.delete(name);
            });
            await Promise.all(deletePromises);
            console.log('PWA Updater: Todos os caches removidos');
        } catch (error) {
            console.error('PWA Updater: Erro ao limpar caches:', error);
        }
    }

    showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.id = 'pwa-update-loader';
        loader.className = 'pwa-update-loader';
        loader.innerHTML = `
            <div class="pwa-loader-content">
                <div class="pwa-loader-spinner"></div>
                <p>Atualizando aplicativo...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoadingIndicator() {
        const loader = document.getElementById('pwa-update-loader');
        if (loader) {
            loader.remove();
        }
    }

    showErrorMessage(message) {
        const error = document.createElement('div');
        error.className = 'pwa-update-error';
        error.textContent = message;
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.remove();
        }, 5000);
    }

    addUpdateNotificationStyles() {
        if (document.getElementById('pwa-update-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pwa-update-styles';
        styles.textContent = `
            .pwa-update-notification {
                position: fixed;
                top: -100px;
                left: 20px;
                right: 20px;
                max-width: 400px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                z-index: 10000;
                transition: all 0.3s ease;
                border: 1px solid #e0e0e0;
            }
            
            .pwa-update-notification.show {
                top: 20px;
            }
            
            .pwa-update-content {
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .pwa-update-notification i {
                font-size: 24px;
                color: #4CAF50;
                flex-shrink: 0;
            }
            
            .pwa-update-text {
                flex-grow: 1;
            }
            
            .pwa-update-text strong {
                display: block;
                color: #333;
                margin-bottom: 4px;
                font-size: 16px;
            }
            
            .pwa-update-text p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            
            .pwa-update-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .pwa-update-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
            }
            
            .pwa-update-btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .pwa-update-btn-primary:hover {
                background: #45a049;
            }
            
            .pwa-update-btn-secondary {
                background: #f5f5f5;
                color: #666;
            }
            
            .pwa-update-btn-secondary:hover {
                background: #e0e0e0;
            }
            
            .pwa-update-loader {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }
            
            .pwa-loader-content {
                text-align: center;
                color: #333;
            }
            
            .pwa-loader-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4CAF50;
                border-radius: 50%;
                animation: pwa-spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            
            @keyframes pwa-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .pwa-update-error {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                max-width: 400px;
                margin: 0 auto;
                background: #f44336;
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                z-index: 10000;
            }
            
            @media (max-width: 768px) {
                .pwa-update-notification {
                    left: 10px;
                    right: 10px;
                }
                
                .pwa-update-content {
                    padding: 15px;
                    gap: 12px;
                }
                
                .pwa-update-actions {
                    flex-direction: row;
                }
                
                .pwa-update-btn {
                    font-size: 13px;
                    padding: 6px 12px;
                    min-width: 70px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Inicializar automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaUpdater = new PWAUpdater();
    });
} else {
    window.pwaUpdater = new PWAUpdater();
} 