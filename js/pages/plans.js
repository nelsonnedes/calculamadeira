/**
 * Plans Page Module - Calculadora de Madeira
 * Módulo responsável pela página de planos e assinaturas
 * Integrado com a arquitetura modular
 */

// Estado das assinaturas
let currentPlan = 'Gratuito';
let pendingRequest = false;
let selectedPlanForPayment = null;

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('💳 Inicializando módulo de planos...');
    
    const app = event.detail.app;
    initializePlansPage(app);
});

/**
 * Inicializar página de planos
 */
function initializePlansPage(app) {
    console.log('📋 Configurando página de planos...');
    
    // Verificar autenticação (flexível para visitantes)
    checkAuthentication();
    
    // Carregar dados do usuário
    loadUserData();
    
    // Atualizar interface dos planos
    updatePlanUI();
    
    // Configurar eventos
    setupPlansEvents();
    
    console.log('✅ Página de planos inicializada');
}

/**
 * Verificar autenticação (flexível)
 */
function checkAuthentication() {
    try {
        // Verificar se a função isUserLoggedIn existe e executá-la
        if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
            console.log('Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
        } else if (typeof isUserLoggedIn !== 'function') {
            console.warn('Função isUserLoggedIn não encontrada. Criando ID de visitante temporário.');
            // Criar ID temporário para visitantes
            if (!localStorage.getItem('currentUserId')) {
                localStorage.setItem('currentUserId', 'visitor_' + Date.now());
            }
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, não bloquear o acesso à página
        // Apenas criar um ID temporário
        if (!localStorage.getItem('currentUserId')) {
            localStorage.setItem('currentUserId', 'visitor_' + Date.now());
        }
    }
}

/**
 * Carregar dados do usuário
 */
function loadUserData() {
    // Obter ID do usuário de várias fontes possíveis
    let userId = localStorage.getItem('currentUserId');
    
    // Se não tiver userId, tentar obter da função getCurrentUser
    if (!userId && typeof getCurrentUser === 'function') {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id) {
            userId = currentUser.id;
        }
    }
    
    // Se ainda não tiver userId, criar um temporário (será substituído no login)
    if (!userId) {
        console.log('Criando ID temporário para visitante');
        userId = 'visitor_' + Date.now();
        localStorage.setItem('currentUserId', userId);
    }
    
    // Obter dados do usuário
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Dados do usuário carregados:', user);
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        user = {};
    }
    
    // Verificar se tem plano associado (tentar diferentes chaves)
    const planKeys = [
        `user_plan_${userId}`,
        'currentPlan',
        'userPlan'
    ];
    
    let planData = null;
    for (const key of planKeys) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                planData = JSON.parse(data);
                console.log(`Plano encontrado na chave ${key}:`, planData);
                break;
            }
        } catch (error) {
            console.error(`Erro ao carregar plano da chave ${key}:`, error);
        }
    }
    
    // Definir plano atual
    if (planData) {
        currentPlan = planData.name || planData.plan || 'Premium';
        
        // Verificar se tem request pendente
        if (planData.status === 'pending') {
            pendingRequest = true;
        }
    } else {
        currentPlan = 'Gratuito';
        pendingRequest = false;
    }
    
    console.log('Plano atual determinado:', currentPlan);
    console.log('Request pendente:', pendingRequest);
}

/**
 * Atualizar interface dos planos
 */
function updatePlanUI() {
    // Atualizar status do plano atual
    const currentPlanElement = document.getElementById('currentPlan');
    const planExpiryElement = document.getElementById('planExpiry');
    const pendingStatusElement = document.getElementById('pendingStatus');
    
    if (currentPlanElement) {
        currentPlanElement.textContent = currentPlan;
    }
    
    if (planExpiryElement) {
        if (currentPlan === 'Gratuito') {
            planExpiryElement.textContent = 'Sem data de expiração';
        } else {
            // Verificar data de expiração se existir
            const userId = localStorage.getItem('currentUserId');
            const planData = JSON.parse(localStorage.getItem(`user_plan_${userId}`) || '{}');
            if (planData.expiryDate) {
                const expiryDate = new Date(planData.expiryDate);
                planExpiryElement.textContent = `Válido até: ${expiryDate.toLocaleDateString('pt-BR')}`;
            } else {
                planExpiryElement.textContent = 'Sem data de expiração definida';
            }
        }
    }
    
    // Mostrar/ocultar status pendente
    if (pendingStatusElement) {
        pendingStatusElement.style.display = pendingRequest ? 'block' : 'none';
    }
    
    // Atualizar botões dos planos
    updatePlanButtons();
}

/**
 * Atualizar botões dos planos
 */
function updatePlanButtons() {
    const freeButton = document.getElementById('freeButton');
    const basicButton = document.getElementById('basicButton');
    const premiumButton = document.getElementById('premiumButton');
    
    // Reset todos os botões
    [freeButton, basicButton, premiumButton].forEach(button => {
        if (button) {
            button.classList.remove('primary', 'secondary');
            button.classList.add('secondary');
            button.textContent = 'Selecionar Plano';
            button.disabled = false;
        }
    });
    
    // Marcar plano atual
    if (currentPlan === 'Gratuito' && freeButton) {
        freeButton.textContent = 'Plano Atual';
        freeButton.disabled = true;
    } else if (currentPlan === 'Básico' && basicButton) {
        basicButton.textContent = 'Plano Atual';
        basicButton.disabled = true;
    } else if (currentPlan === 'Premium' && premiumButton) {
        premiumButton.textContent = 'Plano Atual';
        premiumButton.disabled = true;
    }
    
    // Desabilitar botões se tiver request pendente
    if (pendingRequest) {
        [basicButton, premiumButton].forEach(button => {
            if (button && !button.disabled) {
                button.textContent = 'Solicitação Pendente';
                button.disabled = true;
            }
        });
    }
}

/**
 * Configurar eventos da página
 */
function setupPlansEvents() {
    // Botões de seleção de plano
    const basicButton = document.getElementById('basicButton');
    const premiumButton = document.getElementById('premiumButton');
    
    if (basicButton) {
        basicButton.addEventListener('click', () => {
            if (!basicButton.disabled) {
                openPaymentModal('Básico', 'R$ 29,90');
            }
        });
    }
    
    if (premiumButton) {
        premiumButton.addEventListener('click', () => {
            if (!premiumButton.disabled) {
                openPaymentModal('Premium', 'R$ 59,90');
            }
        });
    }
    
    // Botão de fechar modal
    const closeModalButton = document.querySelector('.payment-close');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closePaymentModal);
    }
    
    // Fechar modal clicando fora
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });
    }
    
    // Botão de notificar pagamento
    const notifyPaymentButton = document.getElementById('notifyPayment');
    if (notifyPaymentButton) {
        notifyPaymentButton.addEventListener('click', notifyPayment);
    }
    
    // Link de admin (se existir)
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAdminPanel();
        });
    }
    
    console.log('⌨️ Eventos dos planos configurados');
}

/**
 * Abrir modal de pagamento
 */
function openPaymentModal(planName, planPrice) {
    selectedPlanForPayment = { name: planName, price: planPrice };
    
    // Atualizar conteúdo do modal
    const paymentPlanElement = document.querySelector('.payment-plan');
    const paymentValueElement = document.querySelector('.payment-value');
    
    if (paymentPlanElement) {
        paymentPlanElement.textContent = `Plano ${planName}`;
    }
    
    if (paymentValueElement) {
        paymentValueElement.textContent = planPrice;
    }
    
    // Mostrar modal
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    console.log('💳 Modal de pagamento aberto para:', planName);
}

/**
 * Fechar modal de pagamento
 */
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
    
    selectedPlanForPayment = null;
    console.log('❌ Modal de pagamento fechado');
}

/**
 * Notificar pagamento realizado
 */
function notifyPayment() {
    if (!selectedPlanForPayment) {
        showFeedback('Erro: Plano não selecionado', 'error');
        return;
    }
    
    try {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
            showFeedback('Erro: Usuário não identificado', 'error');
            return;
        }
        
        // Salvar solicitação pendente
        const requestData = {
            userId: userId,
            planName: selectedPlanForPayment.name,
            planPrice: selectedPlanForPayment.price,
            requestDate: new Date().toISOString(),
            status: 'pending',
            paymentNotified: true
        };
        
        // Salvar no localStorage (em um sistema real, seria enviado para servidor)
        localStorage.setItem(`user_plan_${userId}`, JSON.stringify(requestData));
        
        // Atualizar estado local
        pendingRequest = true;
        
        // Atualizar interface
        updatePlanUI();
        
        // Fechar modal
        closePaymentModal();
        
        // Mostrar feedback de sucesso
        showFeedback('Pagamento notificado! Sua solicitação está sendo analisada pelo administrador.', 'success');
        
        console.log('✅ Pagamento notificado:', requestData);
        
    } catch (error) {
        console.error('❌ Erro ao notificar pagamento:', error);
        showFeedback('Erro ao processar notificação. Tente novamente.', 'error');
    }
}

/**
 * Abrir painel administrativo
 */
function openAdminPanel() {
    // Verificar se é admin (em um sistema real teria verificação mais robusta)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.isAdmin || user.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        showFeedback('Acesso restrito a administradores', 'error');
    }
}

/**
 * Mostrar feedback ao usuário
 */
function showFeedback(message, type = 'success') {
    // Remover feedback anterior se existir
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Criar novo feedback
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(feedback);
    
    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 4000);
    
    console.log(`📢 Feedback (${type}):`, message);
}

// Disponibilizar funções globalmente para compatibilidade
window.PlansPageModule = {
    loadUserData,
    updatePlanUI,
    openPaymentModal,
    closePaymentModal,
    notifyPayment,
    openAdminPanel
};

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo de planos carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo de planos carregado (DOM já pronto)');
} 