/**
 * Notifications Page Module - Calculadora de Madeira
 * Módulo responsável pelo sistema de notificações
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('🔔 Inicializando módulo de notificações...');
    
    const app = event.detail.app;
    initializeNotificationsPage(app);
});

// Tipos de notificações
const NOTIFICATION_TYPES = {
    SYSTEM: 'system',
    UPDATE: 'update', 
    CALCULATION: 'calculation',
    PROFILE: 'profile',
    PLAN: 'plan',
    ERROR: 'error',
    SUCCESS: 'success'
};

// Estado global das notificações
let currentNotifications = [];
let currentFilter = 'all';

/**
 * Inicializar página de notificações
 */
function initializeNotificationsPage(app) {
    console.log('🔧 Configurando sistema de notificações...');
    
    // Configurar eventos
    setupNotificationEvents();
    
    // Carregar notificações
    loadNotifications();
    
    // Atualizar estatísticas
    updateNotificationStats();
    
    console.log('✅ Sistema de notificações inicializado');
}

/**
 * Configurar eventos da página
 */
function setupNotificationEvents() {
    // Filtros de notificações
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Botão marcar todas como lidas
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }
    
    console.log('⌨️ Eventos de notificações configurados');
}

/**
 * Carregar notificações
 */
function loadNotifications() {
    try {
        // Tentar carregar notificações do localStorage
        const stored = localStorage.getItem('notifications');
        
        if (stored) {
            currentNotifications = JSON.parse(stored);
        } else {
            // Criar notificações de exemplo se não existirem
            currentNotifications = getSampleNotifications();
            saveNotifications();
        }
        
        // Ordenar por data (mais recentes primeiro)
        currentNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        displayNotifications(currentNotifications, currentFilter);
        updateNotificationStats();
        
        console.log('📋 Notificações carregadas:', currentNotifications.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        showNotificationFeedback('Erro ao carregar notificações', 'error');
    }
}

/**
 * Exibir notificações
 */
function displayNotifications(notifications, filter = 'all') {
    const container = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) {
        console.warn('⚠️ Container de notificações não encontrado');
        return;
    }
    
    // Filtrar notificações
    let filteredNotifications = filterNotifications(notifications, filter);
    
    // Limpar container
    container.innerHTML = '';
    
    if (filteredNotifications.length === 0) {
        showEmptyState(filter);
        return;
    }
    
    // Ocultar estado vazio
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Renderizar notificações
    filteredNotifications.forEach((notification, index) => {
        const notificationElement = createNotificationElement(notification);
        
        // Animar entrada com delay
        setTimeout(() => {
            container.appendChild(notificationElement);
        }, index * 50);
    });
    
    console.log(`📄 Exibindo ${filteredNotifications.length} notificações (filtro: ${filter})`);
}

/**
 * Filtrar notificações
 */
function filterNotifications(notifications, filter) {
    switch (filter) {
        case 'unread':
            return notifications.filter(n => !n.read);
        case 'system':
            return notifications.filter(n => n.type === NOTIFICATION_TYPES.SYSTEM);
        case 'updates':
            return notifications.filter(n => n.type === NOTIFICATION_TYPES.UPDATE);
        case 'calculations':
            return notifications.filter(n => n.type === NOTIFICATION_TYPES.CALCULATION);
        case 'plans':
            return notifications.filter(n => n.type === NOTIFICATION_TYPES.PLAN);
        default:
            return notifications;
    }
}

/**
 * Criar elemento de notificação
 */
function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.read ? '' : 'unread'}`;
    div.dataset.id = notification.id;

    const icon = getNotificationIcon(notification.type);
    const iconClass = getNotificationIconClass(notification.type);
    const time = formatTime(new Date(notification.time));

    div.innerHTML = `
        <div class="notification-icon ${iconClass}">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">
                <i class="fas fa-clock"></i>
                ${time}
            </div>
        </div>
        <div class="notification-actions">
            ${!notification.read ? `
                <button class="mark-read" title="Marcar como lida" data-id="${notification.id}">
                    <i class="fas fa-check"></i>
                </button>
            ` : ''}
            <button class="delete-notification" title="Excluir notificação" data-id="${notification.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    // Adicionar event listeners
    const markReadBtn = div.querySelector('.mark-read');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            markAsRead(notification.id);
        });
    }
    
    const deleteBtn = div.querySelector('.delete-notification');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
        });
    }

    // Clique na notificação para marcar como lida (se não lida)
    if (!notification.read) {
        div.addEventListener('click', () => markAsRead(notification.id));
        div.style.cursor = 'pointer';
    }

    return div;
}

/**
 * Obter ícone baseado no tipo de notificação
 */
function getNotificationIcon(type) {
    const icons = {
        [NOTIFICATION_TYPES.SYSTEM]: 'fa-info-circle',
        [NOTIFICATION_TYPES.UPDATE]: 'fa-sync-alt',
        [NOTIFICATION_TYPES.CALCULATION]: 'fa-calculator',
        [NOTIFICATION_TYPES.PROFILE]: 'fa-user',
        [NOTIFICATION_TYPES.PLAN]: 'fa-crown',
        [NOTIFICATION_TYPES.ERROR]: 'fa-exclamation-triangle',
        [NOTIFICATION_TYPES.SUCCESS]: 'fa-check-circle'
    };
    return icons[type] || 'fa-bell';
}

/**
 * Obter classe CSS do ícone baseado no tipo
 */
function getNotificationIconClass(type) {
    const classes = {
        [NOTIFICATION_TYPES.SYSTEM]: 'system',
        [NOTIFICATION_TYPES.UPDATE]: 'update',
        [NOTIFICATION_TYPES.CALCULATION]: 'calculation',
        [NOTIFICATION_TYPES.PROFILE]: 'profile',
        [NOTIFICATION_TYPES.PLAN]: 'plan',
        [NOTIFICATION_TYPES.ERROR]: 'error',
        [NOTIFICATION_TYPES.SUCCESS]: 'success'
    };
    return classes[type] || '';
}

/**
 * Formatar tempo relativo
 */
function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutos atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} horas atrás`;
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)} dias atrás`;
    if (diff < 31536000000) return `${Math.floor(diff / 2592000000)} meses atrás`;
    return date.toLocaleDateString('pt-BR');
}

/**
 * Marcar notificação como lida
 */
function markAsRead(id) {
    try {
        const notification = currentNotifications.find(n => n.id == id);
        
        if (notification && !notification.read) {
            notification.read = true;
            saveNotifications();
            
            // Atualizar elemento visual
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.classList.remove('unread');
                
                // Remover botão "marcar como lida"
                const markReadBtn = element.querySelector('.mark-read');
                if (markReadBtn) {
                    markReadBtn.remove();
                }
                
                // Remover cursor pointer
                element.style.cursor = 'default';
            }
            
            updateNotificationStats();
            showNotificationFeedback('Notificação marcada como lida', 'success');
            
            console.log('✅ Notificação marcada como lida:', id);
        }
    } catch (error) {
        console.error('❌ Erro ao marcar como lida:', error);
        showNotificationFeedback('Erro ao marcar notificação', 'error');
    }
}

/**
 * Excluir notificação
 */
function deleteNotification(id) {
    if (!confirm('⚠️ Tem certeza que deseja excluir esta notificação?')) {
        return;
    }
    
    try {
        const index = currentNotifications.findIndex(n => n.id == id);
        
        if (index !== -1) {
            const notification = currentNotifications[index];
            currentNotifications.splice(index, 1);
            saveNotifications();
            
            // Remover elemento visual com animação
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.style.animation = 'notificationSlideOut 0.3s ease-in';
                setTimeout(() => {
                    element.remove();
                    
                    // Verificar se precisa mostrar estado vazio
                    if (currentNotifications.length === 0) {
                        showEmptyState(currentFilter);
                    }
                }, 300);
            }
            
            updateNotificationStats();
            showNotificationFeedback('Notificação excluída', 'success');
            
            console.log('🗑️ Notificação excluída:', notification.title);
        }
    } catch (error) {
        console.error('❌ Erro ao excluir notificação:', error);
        showNotificationFeedback('Erro ao excluir notificação', 'error');
    }
}

/**
 * Marcar todas as notificações como lidas
 */
function markAllAsRead() {
    try {
        const unreadCount = currentNotifications.filter(n => !n.read).length;
        
        if (unreadCount === 0) {
            showNotificationFeedback('Não há notificações não lidas', 'info');
            return;
        }
        
        if (!confirm(`⚠️ Marcar ${unreadCount} notificação(ões) como lidas?`)) {
            return;
        }
        
        currentNotifications.forEach(notification => {
            notification.read = true;
        });
        
        saveNotifications();
        loadNotifications(); // Recarregar para atualizar visual
        
        showNotificationFeedback(`${unreadCount} notificações marcadas como lidas`, 'success');
        
        console.log(`✅ ${unreadCount} notificações marcadas como lidas`);
        
    } catch (error) {
        console.error('❌ Erro ao marcar todas como lidas:', error);
        showNotificationFeedback('Erro ao marcar notificações', 'error');
    }
}

/**
 * Manipular clique nos filtros
 */
function handleFilterClick(event) {
    const button = event.currentTarget;
    const filter = button.dataset.filter;
    
    // Atualizar UI dos filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Aplicar filtro
    currentFilter = filter;
    displayNotifications(currentNotifications, filter);
    
    console.log('🔍 Filtro aplicado:', filter);
}

/**
 * Mostrar estado vazio
 */
function showEmptyState(filter) {
    const emptyState = document.getElementById('emptyState');
    if (!emptyState) return;
    
    const messages = {
        all: 'Nenhuma notificação encontrada',
        unread: 'Não há notificações não lidas',
        system: 'Nenhuma notificação do sistema',
        updates: 'Nenhuma notificação de atualização',
        calculations: 'Nenhuma notificação de cálculo',
        plans: 'Nenhuma notificação de planos'
    };
    
    const icons = {
        all: 'fa-bell-slash',
        unread: 'fa-check-double',
        system: 'fa-info-circle',
        updates: 'fa-sync-alt',
        calculations: 'fa-calculator',
        plans: 'fa-crown'
    };
    
    const message = messages[filter] || messages.all;
    const icon = icons[filter] || icons.all;
    
    emptyState.innerHTML = `
        <i class="fas ${icon}"></i>
        <p><strong>${message}</strong></p>
        <p>Suas notificações aparecerão aqui quando disponíveis.</p>
    `;
    
    emptyState.style.display = 'block';
}

/**
 * Atualizar estatísticas de notificações
 */
function updateNotificationStats() {
    const total = currentNotifications.length;
    const unread = currentNotifications.filter(n => !n.read).length;
    
    // Atualizar badge de não lidas (se existir)
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Atualizar título da página com contador
    const title = document.querySelector('.notifications-title');
    if (title && unread > 0) {
        title.innerHTML = `
            <i class="fas fa-bell"></i>
            Notificações
            <span class="notification-badge">${unread}</span>
        `;
    }
    
    console.log(`📊 Stats: ${total} total, ${unread} não lidas`);
}

/**
 * Salvar notificações no localStorage
 */
function saveNotifications() {
    try {
        localStorage.setItem('notifications', JSON.stringify(currentNotifications));
    } catch (error) {
        console.error('❌ Erro ao salvar notificações:', error);
    }
}

/**
 * Obter notificações de exemplo
 */
function getSampleNotifications() {
    return [
        {
            id: Date.now() + 1,
            type: NOTIFICATION_TYPES.SYSTEM,
            title: 'Bem-vindo à Calculadora de Madeira!',
            message: 'Obrigado por usar nossa ferramenta. Explore todas as funcionalidades disponíveis.',
            time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
            read: false
        },
        {
            id: Date.now() + 2,
            type: NOTIFICATION_TYPES.UPDATE,
            title: 'Nova versão disponível',
            message: 'Uma nova versão da aplicação está disponível com melhorias de performance e novas funcionalidades.',
            time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hora atrás
            read: true
        },
        {
            id: Date.now() + 3,
            type: NOTIFICATION_TYPES.CALCULATION,
            title: 'Cálculo salvo com sucesso',
            message: 'Seu último cálculo foi salvo automaticamente no sistema.',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
            read: false
        },
        {
            id: Date.now() + 4,
            type: NOTIFICATION_TYPES.PLAN,
            title: 'Plano Premium disponível',
            message: 'Faça upgrade para o plano Premium e tenha acesso a funcionalidades avançadas.',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
            read: true
        }
    ];
}

/**
 * Mostrar feedback de notificação
 */
function showNotificationFeedback(message, type = 'success') {
    // Usar sistema de feedback global se disponível
    if (typeof window.showFeedback === 'function') {
        window.showFeedback(message, type);
        return;
    }
    
    // Fallback simples
    console.log(`📢 Feedback (${type}):`, message);
}

/**
 * Adicionar nova notificação (API pública)
 */
function addNotification(notification) {
    const newNotification = {
        id: Date.now(),
        type: notification.type || NOTIFICATION_TYPES.SYSTEM,
        title: notification.title,
        message: notification.message,
        time: new Date().toISOString(),
        read: false,
        ...notification
    };
    
    currentNotifications.unshift(newNotification);
    saveNotifications();
    
    // Recarregar se estamos na página
    if (document.getElementById('notificationsList')) {
        displayNotifications(currentNotifications, currentFilter);
        updateNotificationStats();
    }
    
    console.log('➕ Nova notificação adicionada:', newNotification.title);
    
    return newNotification;
}

// Disponibilizar funções globalmente para compatibilidade
window.NotificationsModule = {
    addNotification,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    loadNotifications,
    NOTIFICATION_TYPES
};

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo de notificações carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo de notificações carregado (DOM já pronto)');
}

// Adicionar animação CSS para saída
const style = document.createElement('style');
style.textContent = `
    @keyframes notificationSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style); 