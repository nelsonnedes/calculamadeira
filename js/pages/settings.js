/**
 * Settings Page Module - Calculadora de Madeira
 * Módulo responsável pela página de configurações
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('⚙️ Inicializando módulo de configurações...');
    
    const app = event.detail.app;
    initializeSettingsPage(app);
});

// Configurações padrão do sistema
const DEFAULT_SETTINGS = {
    // Preferências Gerais
    emailNotifications: true,
    darkMode: false,
    autoBackup: true,
    
    // Personalização
    unitSystem: 'metric',
    numberFormat: 'pt-BR',
    
    // Notificações
    pushNotifications: true,
    backupReminders: true,
    
    // Backup e Sincronização
    cloudSync: true,
    backupFrequency: 'daily',
    
    // Avançadas
    debugMode: false,
    performanceMode: false,
    experimentalFeatures: false
};

// Estado atual das configurações
let currentSettings = {};

/**
 * Inicializar página de configurações
 */
function initializeSettingsPage(app) {
    console.log('🔧 Configurando página de configurações...');
    
    // Verificar autenticação
    if (!checkUserAuthentication()) return;
    
    // Carregar configurações
    loadSettings();
    
    // Configurar eventos
    setupSettingsEvents();
    
    // Aplicar configurações visuais
    applyVisualSettings();
    
    // Carregar estatísticas
    loadSettingsStats();
    
    console.log('✅ Página de configurações inicializada');
}

/**
 * Verificar autenticação do usuário
 */
function checkUserAuthentication() {
    try {
        if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
            console.log('🔒 Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        window.location.href = 'index.html';
        return false;
    }
}

/**
 * Carregar configurações do localStorage
 */
function loadSettings() {
    try {
        const stored = localStorage.getItem('settings');
        
        if (stored) {
            currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } else {
            currentSettings = { ...DEFAULT_SETTINGS };
            saveSettings(); // Salvar configurações padrão
        }
        
        // Aplicar configurações na interface
        applySettingsToUI();
        
        console.log('📋 Configurações carregadas:', currentSettings);
        
    } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        currentSettings = { ...DEFAULT_SETTINGS };
        showSettingsFeedback('Erro ao carregar configurações, usando padrões', 'warning');
    }
}

/**
 * Aplicar configurações na interface
 */
function applySettingsToUI() {
    // Preferências Gerais
    setElementValue('emailNotifications', currentSettings.emailNotifications);
    setElementValue('darkMode', currentSettings.darkMode);
    setElementValue('autoBackup', currentSettings.autoBackup);
    
    // Personalização
    setElementValue('unitSystem', currentSettings.unitSystem);
    setElementValue('numberFormat', currentSettings.numberFormat);
    
    // Notificações
    setElementValue('pushNotifications', currentSettings.pushNotifications);
    setElementValue('backupReminders', currentSettings.backupReminders);
    
    // Backup e Sincronização
    setElementValue('cloudSync', currentSettings.cloudSync);
    setElementValue('backupFrequency', currentSettings.backupFrequency);
    
    // Configurações avançadas (se existirem)
    setElementValue('debugMode', currentSettings.debugMode);
    setElementValue('performanceMode', currentSettings.performanceMode);
    setElementValue('experimentalFeatures', currentSettings.experimentalFeatures);
}

/**
 * Definir valor de elemento da interface
 */
function setElementValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (element.type === 'checkbox') {
        element.checked = Boolean(value);
    } else {
        element.value = value;
    }
}

/**
 * Configurar eventos da página
 */
function setupSettingsEvents() {
    // Event listener para todos os controles de configuração
    const settingsControls = document.querySelectorAll('.settings-list input, .settings-list select');
    
    settingsControls.forEach(control => {
        control.addEventListener('change', handleSettingChange);
    });
    
    // Botões especiais
    setupSpecialButtons();
    
    console.log('⌨️ Eventos de configurações configurados');
}

/**
 * Configurar botões especiais
 */
function setupSpecialButtons() {
    // Botão de limpar dados
    const clearDataBtn = document.querySelector('[onclick="clearAllData()"]');
    if (clearDataBtn) {
        clearDataBtn.removeAttribute('onclick');
        clearDataBtn.addEventListener('click', clearAllData);
    }
    
    // Botão de exportar configurações
    const exportBtn = document.getElementById('exportSettings');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettings);
    }
    
    // Botão de importar configurações
    const importBtn = document.getElementById('importSettings');
    const importFile = document.getElementById('importFile');
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', importSettings);
    }
    
    // Botão de reset para padrões
    const resetBtn = document.getElementById('resetToDefaults');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefaults);
    }
}

/**
 * Manipular mudança de configuração
 */
function handleSettingChange(event) {
    const element = event.target;
    const settingKey = element.id;
    let value;
    
    // Obter valor baseado no tipo do elemento
    if (element.type === 'checkbox') {
        value = element.checked;
    } else {
        value = element.value;
    }
    
    // Atualizar configuração
    currentSettings[settingKey] = value;
    
    // Salvar configurações
    saveSettings();
    
    // Aplicar configuração específica
    applySpecificSetting(settingKey, value);
    
    console.log(`⚙️ Configuração alterada: ${settingKey} = ${value}`);
}

/**
 * Aplicar configuração específica
 */
function applySpecificSetting(key, value) {
    switch (key) {
        case 'darkMode':
            toggleDarkMode(value);
            break;
            
        case 'unitSystem':
            updateUnitSystem(value);
            break;
            
        case 'numberFormat':
            updateNumberFormat(value);
            break;
            
        case 'pushNotifications':
            handlePushNotifications(value);
            break;
            
        case 'debugMode':
            toggleDebugMode(value);
            break;
            
        case 'performanceMode':
            togglePerformanceMode(value);
            break;
    }
}

/**
 * Toggle modo escuro
 */
function toggleDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('theme-dark');
        showSettingsFeedback('Modo escuro ativado', 'success');
    } else {
        document.body.classList.remove('theme-dark');
        showSettingsFeedback('Modo claro ativado', 'success');
    }
}

/**
 * Atualizar sistema de unidades
 */
function updateUnitSystem(system) {
    // Aplicar sistema de unidades globalmente
    if (typeof window.updateUnitSystem === 'function') {
        window.updateUnitSystem(system);
    }
    
    const systemName = system === 'metric' ? 'Métrico' : 'Imperial';
    showSettingsFeedback(`Sistema ${systemName} aplicado`, 'success');
}

/**
 * Atualizar formato de números
 */
function updateNumberFormat(format) {
    // Aplicar formato de números globalmente
    if (typeof window.updateNumberFormat === 'function') {
        window.updateNumberFormat(format);
    }
    
    const formatName = format === 'pt-BR' ? 'Brasileiro' : 'Americano';
    showSettingsFeedback(`Formato ${formatName} aplicado`, 'success');
}

/**
 * Gerenciar notificações push
 */
function handlePushNotifications(enabled) {
    if (enabled) {
        // Solicitar permissão para notificações
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showSettingsFeedback('Notificações push ativadas', 'success');
                } else {
                    showSettingsFeedback('Permissão para notificações negada', 'warning');
                    // Desativar o toggle se permissão foi negada
                    currentSettings.pushNotifications = false;
                    setElementValue('pushNotifications', false);
                    saveSettings();
                }
            });
        } else {
            showSettingsFeedback('Notificações não suportadas neste navegador', 'warning');
            currentSettings.pushNotifications = false;
            setElementValue('pushNotifications', false);
            saveSettings();
        }
    } else {
        showSettingsFeedback('Notificações push desativadas', 'info');
    }
}

/**
 * Toggle modo debug
 */
function toggleDebugMode(enabled) {
    if (enabled) {
        console.log('🐛 Modo debug ativado');
        window.DEBUG_MODE = true;
        showSettingsFeedback('Modo debug ativado - Console habilitado', 'info');
    } else {
        console.log('🐛 Modo debug desativado');
        window.DEBUG_MODE = false;
        showSettingsFeedback('Modo debug desativado', 'info');
    }
}

/**
 * Toggle modo performance
 */
function togglePerformanceMode(enabled) {
    if (enabled) {
        document.body.classList.add('performance-mode');
        showSettingsFeedback('Modo performance ativado', 'success');
    } else {
        document.body.classList.remove('performance-mode');
        showSettingsFeedback('Modo performance desativado', 'info');
    }
}

/**
 * Salvar configurações no localStorage
 */
function saveSettings() {
    try {
        localStorage.setItem('settings', JSON.stringify(currentSettings));
        console.log('💾 Configurações salvas');
    } catch (error) {
        console.error('❌ Erro ao salvar configurações:', error);
        showSettingsFeedback('Erro ao salvar configurações', 'error');
    }
}

/**
 * Aplicar configurações visuais
 */
function applyVisualSettings() {
    // Aplicar modo escuro se ativado
    if (currentSettings.darkMode) {
        document.body.classList.add('theme-dark');
    }
    
    // Aplicar modo performance se ativado
    if (currentSettings.performanceMode) {
        document.body.classList.add('performance-mode');
    }
}

/**
 * Carregar estatísticas das configurações
 */
function loadSettingsStats() {
    try {
        // Obter dados de uso do localStorage
        const storageStats = getStorageStats();
        
        // Atualizar cards de status se existirem
        updateStatusCard('storageUsed', `${storageStats.usedFormatted} de dados salvos`);
        updateStatusCard('settingsCount', `${Object.keys(currentSettings).length} configurações`);
        updateStatusCard('lastBackup', getLastBackupInfo());
        updateStatusCard('appVersion', getAppVersion());
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
    }
}

/**
 * Atualizar card de status
 */
function updateStatusCard(id, value) {
    const card = document.getElementById(id);
    if (card) {
        const valueElement = card.querySelector('.status-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
}

/**
 * Obter estatísticas de storage
 */
function getStorageStats() {
    let used = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            used += localStorage[key].length;
        }
    }
    
    return {
        used: used,
        usedFormatted: formatBytes(used),
        available: '5MB', // Limite aproximado do localStorage
        percentUsed: Math.min((used / (5 * 1024 * 1024)) * 100, 100)
    };
}

/**
 * Formatar bytes em formato legível
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obter informações do último backup
 */
function getLastBackupInfo() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (lastBackup) {
        const date = new Date(lastBackup);
        return date.toLocaleDateString('pt-BR');
    }
    return 'Nunca';
}

/**
 * Obter versão da aplicação
 */
function getAppVersion() {
    return 'v2.3.0'; // Versão atual da aplicação
}

/**
 * Limpar todos os dados
 */
function clearAllData() {
    const confirmMessage = `⚠️ ATENÇÃO: Esta ação irá remover PERMANENTEMENTE:

• Todas as configurações personalizadas
• Todos os cálculos salvos
• Todos os orçamentos criados
• Dados de perfil do usuário
• Cache de autocomplete
• Histórico de notificações

Esta ação NÃO PODE ser desfeita!

Digite "CONFIRMAR" para prosseguir:`;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation === 'CONFIRMAR') {
        try {
            // Salvar algumas informações essenciais antes de limpar
            const userId = localStorage.getItem('currentUserId');
            
            // Limpar localStorage
            localStorage.clear();
            
            // Restaurar informações essenciais se necessário
            if (userId) {
                localStorage.setItem('lastClearDate', new Date().toISOString());
            }
            
            showSettingsFeedback('Todos os dados foram removidos. Redirecionando...', 'success');
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            console.log('🗑️ Todos os dados foram limpos');
            
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
            showSettingsFeedback('Erro ao limpar dados', 'error');
        }
    } else {
        showSettingsFeedback('Limpeza de dados cancelada', 'info');
    }
}

/**
 * Exportar configurações
 */
function exportSettings() {
    try {
        const exportData = {
            settings: currentSettings,
            exportDate: new Date().toISOString(),
            appVersion: getAppVersion(),
            userAgent: navigator.userAgent
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `calculadora-madeira-config-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSettingsFeedback('Configurações exportadas com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar configurações:', error);
        showSettingsFeedback('Erro ao exportar configurações', 'error');
    }
}

/**
 * Importar configurações
 */
function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (importData.settings) {
                // Validar e mesclar configurações
                const validSettings = validateSettings(importData.settings);
                currentSettings = { ...DEFAULT_SETTINGS, ...validSettings };
                
                // Salvar e aplicar
                saveSettings();
                applySettingsToUI();
                applyVisualSettings();
                
                showSettingsFeedback('Configurações importadas com sucesso', 'success');
                
                console.log('📥 Configurações importadas:', validSettings);
            } else {
                throw new Error('Formato de arquivo inválido');
            }
        } catch (error) {
            console.error('❌ Erro ao importar configurações:', error);
            showSettingsFeedback('Erro ao importar configurações', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Limpar o input
    event.target.value = '';
}

/**
 * Validar configurações importadas
 */
function validateSettings(settings) {
    const validSettings = {};
    
    for (const key in DEFAULT_SETTINGS) {
        if (settings.hasOwnProperty(key)) {
            const defaultType = typeof DEFAULT_SETTINGS[key];
            const importedType = typeof settings[key];
            
            if (defaultType === importedType) {
                validSettings[key] = settings[key];
            }
        }
    }
    
    return validSettings;
}

/**
 * Resetar para configurações padrão
 */
function resetToDefaults() {
    if (confirm('⚠️ Deseja restaurar todas as configurações para os valores padrão?')) {
        currentSettings = { ...DEFAULT_SETTINGS };
        saveSettings();
        applySettingsToUI();
        applyVisualSettings();
        
        showSettingsFeedback('Configurações restauradas para padrão', 'success');
        
        console.log('🔄 Configurações resetadas para padrão');
    }
}

/**
 * Mostrar feedback de configurações
 */
function showSettingsFeedback(message, type = 'success') {
    // Usar sistema de feedback global se disponível
    if (typeof window.showFeedback === 'function') {
        window.showFeedback(message, type);
        return;
    }
    
    // Fallback simples
    console.log(`📢 Settings Feedback (${type}):`, message);
}

// Disponibilizar funções globalmente para compatibilidade
window.SettingsModule = {
    loadSettings,
    saveSettings,
    clearAllData,
    exportSettings,
    importSettings,
    resetToDefaults,
    getCurrentSettings: () => currentSettings,
    updateSetting: (key, value) => {
        currentSettings[key] = value;
        saveSettings();
        applySpecificSetting(key, value);
    }
};

// Disponibilizar função específica globalmente (para onclick se necessário)
window.clearAllData = clearAllData;

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo de configurações carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo de configurações carregado (DOM já pronto)');
} 