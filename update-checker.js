/**
 * Update Checker - Verificação agressiva de atualizações
 * Este script força a verificação de atualizações sempre que o app é aberto
 */

(function() {
    'use strict';
    
    const CURRENT_VERSION = '2.0.0';
    const VERSION_KEY = 'app_version';
    const LAST_UPDATE_CHECK = 'last_update_check';
    const UPDATE_CHECK_INTERVAL = 10000; // 10 segundos
    
    // Verificar versão armazenada
    function checkStoredVersion() {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        console.log('Update Checker: Versão armazenada:', storedVersion, 'Versão atual:', CURRENT_VERSION);
        
        if (!storedVersion || storedVersion !== CURRENT_VERSION) {
            console.log('Update Checker: Versão diferente detectada, limpando cache...');
            clearAppCache();
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            return true;
        }
        return false;
    }
    
    // Limpar cache da aplicação
    async function clearAppCache() {
        try {
            // Limpar localStorage específico da aplicação (manter dados do usuário)
            const keysToKeep = [
                'currentUserId',
                'user',
                'menuInfo',
                'companyLogo',
                'userData'
            ];
            
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key) && !key.startsWith('plan_') && !key.startsWith('auth_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Limpar caches do navegador
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('Update Checker: Removendo cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }
            
            console.log('Update Checker: Cache limpo com sucesso');
        } catch (error) {
            console.error('Update Checker: Erro ao limpar cache:', error);
        }
    }
    
    // Verificar se é necessário recarregar
    function shouldForceReload() {
        const lastCheck = localStorage.getItem(LAST_UPDATE_CHECK);
        const now = Date.now();
        
        if (!lastCheck) {
            localStorage.setItem(LAST_UPDATE_CHECK, now.toString());
            return false;
        }
        
        const timeSinceLastCheck = now - parseInt(lastCheck);
        return timeSinceLastCheck > UPDATE_CHECK_INTERVAL;
    }
    
    // Verificar se há service worker ativo
    async function checkServiceWorkerUpdate() {
        if (!('serviceWorker' in navigator)) return false;
        
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) return false;
            
            // Forçar verificação de atualização
            await registration.update();
            
            // Verificar se há um worker esperando
            if (registration.waiting) {
                console.log('Update Checker: Service Worker esperando ativação');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Update Checker: Erro ao verificar Service Worker:', error);
            return false;
        }
    }
    
    // Forçar atualização da página
    function forcePageUpdate() {
        console.log('Update Checker: Forçando atualização da página...');
        
        // Mostrar indicador de carregamento
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p style="color: #333; margin: 0;">Atualizando aplicativo...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(loader);
        
        // Aguardar um momento e recarregar
        setTimeout(() => {
            window.location.reload(true);
        }, 1500);
    }
    
    // Verificação principal
    async function performUpdateCheck() {
        console.log('Update Checker: Iniciando verificação...');
        
        // Verificar versão armazenada
        const versionChanged = checkStoredVersion();
        
        // Verificar Service Worker
        const swNeedsUpdate = await checkServiceWorkerUpdate();
        
        // Se a versão mudou ou SW precisa de atualização, forçar reload
        if (versionChanged || swNeedsUpdate) {
            console.log('Update Checker: Atualização necessária detectada');
            forcePageUpdate();
            return;
        }
        
        // Verificar se deve fazer verificação periódica
        if (shouldForceReload()) {
            console.log('Update Checker: Verificação periódica necessária');
            localStorage.setItem(LAST_UPDATE_CHECK, Date.now().toString());
            
            // Apenas verificar, não forçar reload imediatamente
            await checkServiceWorkerUpdate();
        }
    }
    
    // Executar verificação quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', performUpdateCheck);
    } else {
        performUpdateCheck();
    }
    
    // Verificar quando a página volta ao foco
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(performUpdateCheck, 1000);
        }
    });
    
    // Verificar quando a janela ganha foco
    window.addEventListener('focus', () => {
        setTimeout(performUpdateCheck, 1000);
    });
    
    // Verificar quando volta online
    window.addEventListener('online', () => {
        setTimeout(performUpdateCheck, 2000);
    });
    
})(); 