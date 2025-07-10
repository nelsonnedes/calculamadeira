/**
 * Update Checker
 * Verifica atualizações do aplicativo
 * Versão: 1.1.0
 */

class UpdateChecker {
    constructor() {
        this.currentVersion = '2.1.0';
        this.lastCheckTime = 0;
        this.checkInterval = 60000; // 1 minuto
        this.init();
    }

    init() {
        console.log('Update Checker: Inicializando versão', this.currentVersion);
        
        // Verificar versão atual
        this.checkVersion();
        
        // Configurar verificação periódica
        this.startPeriodicCheck();
        
        // Verificar quando a página fica visível
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkVersion();
            }
        });
        
        // Verificar quando o foco volta para a janela
        window.addEventListener('focus', () => {
            this.checkVersion();
        });
        
        // Verificar quando a página é restaurada (mobile)
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.checkVersion();
            }
        });
    }

    checkVersion() {
        const now = Date.now();
        if (now - this.lastCheckTime < 30000) { // Não verificar mais de uma vez a cada 30 segundos
            return;
        }
        
        this.lastCheckTime = now;
        
        try {
            const storedVersion = localStorage.getItem('app-version');
            console.log('Update Checker: Versão armazenada:', storedVersion, 'Versão atual:', this.currentVersion);
            
            if (!storedVersion || storedVersion !== this.currentVersion) {
                console.log('Update Checker: Nova versão detectada!');
                this.showUpdateAvailable();
                return true;
            }
            
            // Verificar se há PWA updater disponível
            if (window.pwaUpdater) {
                window.pwaUpdater.checkForUpdates();
            }
            
            return false;
        } catch (error) {
            console.error('Update Checker: Erro ao verificar versão:', error);
            return false;
        }
    }

    showUpdateAvailable() {
        // Se já existe um PWA updater, usar ele
        if (window.pwaUpdater) {
            window.pwaUpdater.updateAvailable = true;
            window.pwaUpdater.showUpdateNotification();
            return;
        }
        
        // Caso contrário, mostrar notificação simples
        this.showSimpleUpdateNotification();
    }

    showSimpleUpdateNotification() {
        // Remover notificação existente
        const existing = document.getElementById('simple-update-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'simple-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            max-width: 400px;
            margin: 0 auto;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            text-align: center;
            font-family: Arial, sans-serif;
        `;
        
        notification.innerHTML = `
            <strong>Nova versão disponível!</strong><br>
            <small>Recarregue a página para atualizar</small><br>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #4CAF50;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 10px;
                cursor: pointer;
            ">Atualizar Agora</button>
            <button onclick="this.parentElement.remove()" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 10px;
                margin-left: 10px;
                cursor: pointer;
            ">Depois</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    startPeriodicCheck() {
        setInterval(() => {
            if (navigator.onLine && !document.hidden) {
                this.checkVersion();
            }
        }, this.checkInterval);
    }

    forceUpdate() {
        localStorage.setItem('app-version', this.currentVersion);
        
        // Limpar caches se possível
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('calc-madeira-')) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }).then(() => {
                window.location.reload(true);
            });
        } else {
            window.location.reload(true);
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.updateChecker = new UpdateChecker();
    });
} else {
    window.updateChecker = new UpdateChecker();
}

// Função global para forçar atualização
window.forceAppUpdate = function() {
    if (window.updateChecker) {
        window.updateChecker.forceUpdate();
    } else if (window.pwaUpdater) {
        window.pwaUpdater.applyUpdate(true);
    } else {
        window.location.reload(true);
    }
}; 