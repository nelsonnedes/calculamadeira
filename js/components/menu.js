/**
 * Menu Component - Calculadora de Madeira
 * ATENÇÃO: Preservar EXATAMENTE a estrutura e ordem do menu atual
 * Baseado no ELEMENTOS_PRESERVAR.md - seção 8 e calc.html linha ~150-300
 */

export class MenuComponent {
    constructor() {
        this.isOpen = false;
        this.menuPanel = null;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createMenuStructure();
        this.addStyles();
        this.setupEvents();
        this.loadUserInfo();
        console.log('✅ Menu lateral inicializado');
    }

    createMenuStructure() {
        // Remover menu existente se houver
        const existingMenu = document.getElementById('menuPanel');
        const existingOverlay = document.getElementById('overlay');
        
        if (existingMenu) existingMenu.remove();
        if (existingOverlay) existingOverlay.remove();

        // Criar overlay - PRESERVAR ESTRUTURA ATUAL
        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay';
        this.overlay.className = 'overlay';
        document.body.appendChild(this.overlay);

        // Criar painel do menu - PRESERVAR ESTRUTURA EXATA ATUAL
        this.menuPanel = document.createElement('div');
        this.menuPanel.id = 'menuPanel';
        this.menuPanel.className = 'menu-panel';
        
        // HTML do menu - PRESERVAR ORDEM EXATA DOS ITENS
        this.menuPanel.innerHTML = `
            <div class="menu-header">
                <div class="menu-avatar">👤</div>
                <div class="menu-user-info">
                    <div class="menu-user-name">Usuário</div>
                    <div class="menu-user-email">usuario@email.com</div>
                </div>
            </div>
            <div class="menu-items">
                <a href="perfil.html" class="menu-item">
                    <i class="fas fa-user"></i>
                    <span>Meu Perfil</span>
                </a>
                <a href="orcamentos.html" class="menu-item">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span>Orçamentos</span>
                </a>
                <a href="condicoes-pagamento.html" class="menu-item">
                    <i class="fas fa-credit-card"></i>
                    <span>Condições de Pagamentos</span>
                </a>
                <a href="configuracoes.html" class="menu-item">
                    <i class="fas fa-cog"></i>
                    <span>Configurações</span>
                </a>
                <a href="notificacoes.html" class="menu-item">
                    <i class="fas fa-bell"></i>
                    <span>Notificações</span>
                </a>
                <a href="ajuda.html" class="menu-item">
                    <i class="fas fa-question-circle"></i>
                    <span>Ajuda</span>
                </a>
                <div class="menu-item logout" id="logoutMenuItem">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Sair</span>
                </div>
            </div>
        `;

        document.body.appendChild(this.menuPanel);
    }

    setupEvents() {
        // Evento do overlay - COMPORTAMENTO ATUAL
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // Fechar menu ao clicar em links - COMPORTAMENTO ATUAL
        const menuLinks = this.menuPanel.querySelectorAll('.menu-item');
        menuLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.addEventListener('click', () => {
                    this.close();
                });
            }
        });

        // Evento de logout - PRESERVAR LÓGICA ATUAL
        const logoutItem = this.menuPanel.querySelector('#logoutMenuItem');
        if (logoutItem) {
            logoutItem.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Suporte a teclado - ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Prevenir scroll do body quando menu aberto
        this.menuPanel.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Abrir menu - PRESERVAR ANIMAÇÃO ATUAL
     */
    open() {
        this.isOpen = true;
        this.menuPanel.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // COMPORTAMENTO ATUAL
        
        // Foco no primeiro item para acessibilidade
        const firstMenuItem = this.menuPanel.querySelector('.menu-item');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }

        console.log('📂 Menu lateral aberto');
    }

    /**
     * Fechar menu - PRESERVAR ANIMAÇÃO ATUAL  
     */
    close() {
        this.isOpen = false;
        this.menuPanel.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = ''; // RESTAURAR SCROLL

        console.log('📂 Menu lateral fechado');
    }

    /**
     * Toggle menu - FUNÇÃO ATUAL
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Carregar informações do usuário - PRESERVAR LÓGICA ATUAL
     */
    loadUserInfo() {
        try {
            // Tentar obter informações do usuário atual
            let userName = 'Usuário';
            let userEmail = 'usuario@email.com';

            // Verificar se há dados de usuário no localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const currentUserId = localStorage.getItem('currentUserId');
            
            if (userData.name) {
                userName = userData.name;
            }
            
            if (userData.email) {
                userEmail = userData.email;
            }

            // Verificar dados de autenticação
            const authData = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
            if (currentUserId && authData.length > 0) {
                const currentUser = authData.find(u => u.id === currentUserId);
                if (currentUser) {
                    userName = currentUser.name || userName;
                    userEmail = currentUser.email || userEmail;
                }
            }

            // Atualizar interface do menu
            const nameElement = this.menuPanel.querySelector('.menu-user-name');
            const emailElement = this.menuPanel.querySelector('.menu-user-email');

            if (nameElement) nameElement.textContent = userName;
            if (emailElement) emailElement.textContent = userEmail;

            console.log('👤 Informações do usuário carregadas no menu:', { userName, userEmail });
        } catch (error) {
            console.error('❌ Erro ao carregar informações do usuário:', error);
        }
    }

    /**
     * Handle logout - PRESERVAR LÓGICA EXATA ATUAL
     */
    handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                // Usar função de logout global se disponível
                if (typeof window.logoutUser === 'function') {
                    window.logoutUser();
                } else {
                    // Fallback: limpeza manual
                    this.performLogout();
                }
                
                console.log('👋 Logout realizado');
            } catch (error) {
                console.error('❌ Erro durante logout:', error);
                // Forçar logout mesmo com erro
                this.performLogout();
            }
        }
    }

    /**
     * Realizar logout manual - LÓGICA ATUAL
     */
    performLogout() {
        // Limpar dados de sessão - PRESERVAR CHAVES ATUAIS
        const authUsers = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const updatedUsers = authUsers.map(user => ({ ...user, isLoggedIn: false }));
        localStorage.setItem('calc_madeira_auth', JSON.stringify(updatedUsers));
        
        // Limpar dados específicos do usuário - CHAVES ATUAIS
        localStorage.removeItem('woodList');
        localStorage.removeItem('currentUserId');
        
        // Redirecionar para login
        window.location.href = 'index.html';
    }

    /**
     * Atualizar informações do usuário
     */
    updateUserInfo(name, email) {
        const nameElement = this.menuPanel.querySelector('.menu-user-name');
        const emailElement = this.menuPanel.querySelector('.menu-user-email');

        if (nameElement && name) nameElement.textContent = name;
        if (emailElement && email) emailElement.textContent = email;
    }

    /**
     * Destacar item ativo do menu baseado na página atual
     */
    highlightActiveItem() {
        const currentPage = window.location.pathname.split('/').pop();
        const menuItems = this.menuPanel.querySelectorAll('.menu-item[href]');

        menuItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            }
        });
    }

    addStyles() {
        // Evitar duplicação de estilos
        if (document.getElementById('menu-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'menu-styles';
        styles.textContent = `
            /* Menu Panel - PRESERVAR POSICIONAMENTO E ANIMAÇÃO ATUAIS */
            .menu-panel {
                position: fixed;
                top: 0;
                left: -300px;                   /* POSIÇÃO INICIAL ATUAL */
                width: 300px;                   /* LARGURA ATUAL */
                height: 100vh;
                background-color: var(--white);
                box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                z-index: var(--z-modal);
                transition: left 0.3s ease;    /* ANIMAÇÃO ATUAL */
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }

            .menu-panel.active {
                left: 0;                        /* POSIÇÃO ABERTA ATUAL */
            }

            /* Menu Header - PRESERVAR VISUAL ATUAL */
            .menu-header {
                background-color: var(--primary-color); /* #8B0000 - COR ATUAL */
                color: var(--white);
                padding: 20px;                  /* PADDING ATUAL */
                display: flex;
                align-items: center;
                gap: 15px;                      /* GAP ATUAL */
                flex-shrink: 0;
            }

            /* Avatar - PRESERVAR ESTILO ATUAL */
            .menu-avatar {
                width: 50px;                    /* TAMANHO ATUAL */
                height: 50px;
                background-color: rgba(255,255,255,0.2); /* TRANSPARÊNCIA ATUAL */
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;              /* TAMANHO ÍCONE ATUAL */
                flex-shrink: 0;
            }

            /* User Info - PRESERVAR FORMATAÇÃO ATUAL */
            .menu-user-info {
                flex: 1;
            }

            .menu-user-name {
                font-weight: var(--font-weight-bold);
                margin-bottom: 2px;             /* MARGIN ATUAL */
                font-size: var(--font-size-base);
            }

            .menu-user-email {
                font-size: var(--font-size-sm);
                opacity: 0.8;                   /* OPACIDADE ATUAL */
            }

            /* Menu Items - PRESERVAR ESTRUTURA ATUAL */
            .menu-items {
                flex: 1;
                padding: 20px 0;               /* PADDING ATUAL */
                overflow-y: auto;
            }

            .menu-item {
                display: flex;
                align-items: center;
                padding: 15px 20px;             /* PADDING ATUAL */
                color: var(--text-color);
                text-decoration: none;
                transition: background-color 0.2s ease;
                gap: 15px;                      /* GAP ATUAL */
                cursor: pointer;
                border: none;
                background: none;
                width: 100%;
                font-size: var(--font-size-base);
            }

            .menu-item:hover {
                background-color: var(--background-color); /* COR HOVER ATUAL */
            }

            .menu-item.active {
                background-color: var(--primary-light);
                color: var(--primary-color);
                font-weight: var(--font-weight-medium);
            }

            .menu-item i {
                width: 20px;                    /* LARGURA ÍCONE ATUAL */
                color: var(--primary-color);   /* COR ÍCONE ATUAL */
                text-align: center;
                flex-shrink: 0;
            }

            .menu-item span {
                flex: 1;
            }

            /* Logout Item - PRESERVAR ESTILO ATUAL */
            .menu-item.logout {
                color: var(--error-color);     /* COR VERMELHA ATUAL */
                margin-top: auto;              /* PUSH PARA BOTTOM ATUAL */
            }

            .menu-item.logout i {
                color: var(--error-color);     /* ÍCONE VERMELHO ATUAL */
            }

            .menu-item.logout:hover {
                background-color: rgba(244, 67, 54, 0.1); /* HOVER VERMELHO CLARO */
            }

            /* Overlay - PRESERVAR COMPORTAMENTO ATUAL */
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5); /* TRANSPARÊNCIA ATUAL */
                z-index: var(--z-modal-backdrop);
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;    /* ANIMAÇÃO ATUAL */
            }

            .overlay.active {
                display: block;
                opacity: 1;
            }

            /* RESPONSIVIDADE MOBILE - PRESERVAR COMPORTAMENTO ATUAL */
            @media (max-width: 768px) {
                .menu-panel {
                    width: 280px;               /* LARGURA MOBILE ATUAL */
                }

                .menu-header {
                    padding: 15px;              /* PADDING MOBILE ATUAL */
                    gap: 12px;
                }

                .menu-avatar {
                    width: 45px;                /* TAMANHO MOBILE ATUAL */
                    height: 45px;
                    font-size: 1.3rem;
                }

                .menu-user-name {
                    font-size: var(--font-size-sm);
                }

                .menu-user-email {
                    font-size: var(--font-size-xs);
                }

                .menu-item {
                    padding: 12px 15px;         /* PADDING MOBILE ATUAL */
                }
            }

            @media (max-width: 480px) {
                .menu-panel {
                    width: 100%;                /* LARGURA TOTAL MOBILE PEQUENO */
                    left: -100%;
                }

                .menu-panel.active {
                    left: 0;
                }

                .menu-header {
                    padding: 12px;
                    gap: 10px;
                }

                .menu-avatar {
                    width: 40px;
                    height: 40px;
                    font-size: 1.1rem;
                }
            }

            /* Estados de Focus para Acessibilidade */
            .menu-item:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: -2px;
                background-color: var(--primary-light);
            }

            /* Animações suaves */
            .menu-item i {
                transition: transform 0.2s ease;
            }

            .menu-item:hover i {
                transform: scale(1.1);
            }

            /* Scrollbar do menu */
            .menu-items::-webkit-scrollbar {
                width: 4px;
            }

            .menu-items::-webkit-scrollbar-track {
                background: transparent;
            }

            .menu-items::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.2);
                border-radius: 2px;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Método público para uso externo
     */
    render() {
        // Menu já é criado no construtor
        this.highlightActiveItem();
        return this.menuPanel;
    }

    /**
     * Destruir menu (cleanup)
     */
    destroy() {
        if (this.menuPanel) this.menuPanel.remove();
        if (this.overlay) this.overlay.remove();
        
        const styles = document.getElementById('menu-styles');
        if (styles) styles.remove();
        
        document.body.style.overflow = '';
        console.log('🗑️ Menu destruído');
    }
}

// Instância global para compatibilidade
window.MenuComponent = MenuComponent;
window.menuSystem = new MenuComponent();

// Função global para toggle do menu - COMPATIBILIDADE ATUAL
window.toggleMenu = function() {
    if (window.menuSystem) {
        window.menuSystem.toggle();
    }
}; 