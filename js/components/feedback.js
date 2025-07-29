/**
 * Feedback Component - Calculadora de Madeira
 * ATENÇÃO: Substituir TODAS as implementações duplicadas de showFeedback()
 * Preservar comportamento EXATO atual das notificações
 */

export class FeedbackComponent {
    constructor() {
        this.container = null;
        this.activeNotifications = new Set();
        this.defaultDuration = 3000; // DURAÇÃO ATUAL DAS NOTIFICAÇÕES
        this.maxNotifications = 5;
        this.init();
    }

    init() {
        this.createContainer();
        this.addStyles();
        this.setupKeyboardSupport();
        console.log('✅ Sistema de feedback inicializado');
    }

    createContainer() {
        // Remover container existente se houver
        const existingContainer = document.getElementById('feedback-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        this.container = document.createElement('div');
        this.container.id = 'feedback-container';
        this.container.className = 'feedback-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notificações do sistema');
        document.body.appendChild(this.container);
    }

    /**
     * Função principal - SUBSTITUIR TODAS as showFeedback() duplicadas
     * Preservar comportamento EXATO atual
     */
    show(message, type = 'success', options = {}) {
        // Configurações padrão - PRESERVAR COMPORTAMENTO ATUAL
        const config = {
            duration: options.duration ?? this.defaultDuration,
            persistent: options.persistent ?? false,
            action: options.action ?? null,
            id: options.id ?? `notification_${Date.now()}`
        };

        // Remover notificação com mesmo ID se existir
        if (this.activeNotifications.has(config.id)) {
            this.remove(config.id);
        }

        // Limitar número de notificações - EVITAR SPAM
        if (this.activeNotifications.size >= this.maxNotifications) {
            this.removeOldest();
        }

        const notification = this.createNotification(message, type, config);
        this.container.appendChild(notification);
        this.activeNotifications.add(config.id);

        // Animar entrada - PRESERVAR ANIMAÇÃO ATUAL
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-remover se não for persistente - COMPORTAMENTO ATUAL
        if (!config.persistent && config.duration > 0) {
            setTimeout(() => this.remove(config.id), config.duration);
        }

        console.log(`📢 Feedback: ${type} - ${message}`);
        return config.id;
    }

    createNotification(message, type, config) {
        const notification = document.createElement('div');
        notification.className = `feedback-notification feedback-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('data-id', config.id);

        const icon = this.getIcon(type);
        const hasAction = config.action && typeof config.action.callback === 'function';

        // HTML da notificação - PRESERVAR ESTRUTURA VISUAL ATUAL
        notification.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="feedback-text">
                    <div class="feedback-message">${this.sanitizeHTML(message)}</div>
                    ${hasAction ? `<button class="feedback-action-btn" data-action="true">${config.action.text}</button>` : ''}
                </div>
                <button class="feedback-close" aria-label="Fechar notificação" title="Fechar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${config.duration > 0 ? `<div class="feedback-progress" style="animation-duration: ${config.duration}ms"></div>` : ''}
        `;

        // Eventos da notificação
        this.attachNotificationEvents(notification, config);
        return notification;
    }

    attachNotificationEvents(notification, config) {
        // Botão fechar - PRESERVAR COMPORTAMENTO ATUAL
        const closeBtn = notification.querySelector('.feedback-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(config.id);
        });

        // Botão de ação se existir
        const actionBtn = notification.querySelector('.feedback-action-btn');
        if (actionBtn && config.action) {
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                try {
                    config.action.callback();
                    if (config.action.closeAfter !== false) {
                        this.remove(config.id);
                    }
                } catch (error) {
                    console.error('❌ Erro ao executar ação da notificação:', error);
                }
            });
        }

        // Hover para pausar auto-remoção - MELHORIA
        notification.addEventListener('mouseenter', () => {
            notification.classList.add('paused');
        });

        notification.addEventListener('mouseleave', () => {
            notification.classList.remove('paused');
        });

        // Clique na notificação para fechar - COMPORTAMENTO ATUAL
        notification.addEventListener('click', () => {
            this.remove(config.id);
        });
    }

    remove(id) {
        const notification = document.querySelector(`[data-id="${id}"]`);
        if (notification && notification.parentElement) {
            notification.classList.add('removing');
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
                this.activeNotifications.delete(id);
            }, 300); // DURAÇÃO DA ANIMAÇÃO DE SAÍDA
        }
    }

    removeAll() {
        [...this.activeNotifications].forEach(id => this.remove(id));
    }

    removeOldest() {
        const oldestId = this.activeNotifications.values().next().value;
        if (oldestId) this.remove(oldestId);
    }

    getIcon(type) {
        // ÍCONES ATUAIS - PRESERVAR VISUAL
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle', 
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    setupKeyboardSupport() {
        // ESC para fechar todas as notificações - ATALHO ÚTIL
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeNotifications.size > 0) {
                this.removeAll();
            }
        });
    }

    addStyles() {
        // Evitar duplicação de estilos
        if (document.getElementById('feedback-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'feedback-styles';
        styles.textContent = `
            /* Container de Feedback - POSICIONAMENTO ATUAL */
            .feedback-container {
                position: fixed;
                bottom: 20px;                   /* POSIÇÃO ATUAL */
                left: 50%;
                transform: translateX(-50%);    /* CENTRALIZAR COMO ATUAL */
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            /* Notificação Individual - PRESERVAR VISUAL ATUAL */
            .feedback-notification {
                background: white;
                border-radius: 8px;            /* BORDER-RADIUS ATUAL */
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                position: relative;
                overflow: hidden;
                min-height: 60px;
                max-width: 90vw;
            }
            
            .feedback-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .feedback-notification.removing {
                transform: translateY(100px);
                opacity: 0;
            }
            
            .feedback-notification.paused .feedback-progress {
                animation-play-state: paused;
            }
            
            /* Conteúdo da Notificação */
            .feedback-content {
                padding: 16px;                 /* PADDING ATUAL */
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
            }
            
            .feedback-icon {
                flex-shrink: 0;
                font-size: 20px;
                margin-top: 2px;
            }
            
            .feedback-text {
                flex: 1;
                min-width: 0;
            }
            
            .feedback-message {
                font-size: 16px;               /* TAMANHO ATUAL */
                line-height: 1.4;
                color: var(--text-color);
                margin-bottom: 8px;
                font-weight: var(--font-weight-bold);
            }
            
            .feedback-action-btn {
                background: transparent;
                border: 1px solid;
                border-radius: 4px;
                padding: 4px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-top: 8px;
            }
            
            .feedback-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                color: #666;
                flex-shrink: 0;
                transition: all 0.2s ease;
                font-size: 16px;
            }
            
            .feedback-close:hover {
                background: rgba(0,0,0,0.1);
                color: #333;
            }
            
            /* Barra de Progresso */
            .feedback-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                animation: progress linear;
                transform-origin: left;
                opacity: 0.7;
            }
            
            @keyframes progress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }
            
            /* TIPOS DE NOTIFICAÇÃO - CORES ATUAIS */
            .feedback-success {
                border-left: 4px solid var(--success-color);
            }
            .feedback-success .feedback-icon,
            .feedback-success .feedback-progress { 
                color: var(--success-color); 
            }
            .feedback-success .feedback-action-btn {
                border-color: var(--success-color);
                color: var(--success-color);
            }
            
            .feedback-error { 
                border-left: 4px solid var(--error-color); 
            }
            .feedback-error .feedback-icon,
            .feedback-error .feedback-progress { 
                color: var(--error-color); 
            }
            .feedback-error .feedback-action-btn {
                border-color: var(--error-color);
                color: var(--error-color);
            }
            
            .feedback-warning { 
                border-left: 4px solid var(--warning-color); 
            }
            .feedback-warning .feedback-icon,
            .feedback-warning .feedback-progress { 
                color: var(--warning-color); 
            }
            .feedback-warning .feedback-action-btn {
                border-color: var(--warning-color);
                color: var(--warning-color);
            }
            
            .feedback-info { 
                border-left: 4px solid var(--primary-color); 
            }
            .feedback-info .feedback-icon,
            .feedback-info .feedback-progress { 
                color: var(--primary-color); 
            }
            .feedback-info .feedback-action-btn {
                border-color: var(--primary-color);
                color: var(--primary-color);
            }
            
            /* RESPONSIVIDADE MOBILE - CRÍTICO */
            @media (max-width: 768px) {
                .feedback-container {
                    left: 10px;
                    right: 10px;
                    transform: none;
                    max-width: none;
                }
                
                .feedback-content {
                    padding: 12px;
                    gap: 10px;
                }
                
                .feedback-icon {
                    font-size: 18px;
                }
                
                .feedback-message {
                    font-size: 14px;           /* AJUSTE MOBILE */
                }
                
                .feedback-close {
                    min-width: 32px;           /* ÁREA TOQUE MÍNIMA */
                    min-height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
            
            @media (max-width: 480px) {
                .feedback-container {
                    bottom: 10px;
                }
                
                .feedback-notification {
                    min-height: 50px;
                }
                
                .feedback-content {
                    padding: 10px;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Método para compatibilidade com feedback existente
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
}

// Instância global para compatibilidade
window.FeedbackComponent = FeedbackComponent;
window.feedbackSystem = new FeedbackComponent();

// FUNÇÃO GLOBAL CRÍTICA - SUBSTITUIR TODAS AS DUPLICADAS
window.showFeedback = function(message, type = 'success', options = {}) {
    if (window.feedbackSystem) {
        return window.feedbackSystem.show(message, type, options);
    } else {
        // Fallback para desenvolvimento
        console.log(`%c${type.toUpperCase()}: ${message}`, 
            `color: ${type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'green'}`);
        return null;
    }
}; 