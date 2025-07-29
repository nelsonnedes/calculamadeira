/**
 * Admin Page Module - Calculadora de Madeira
 * Módulo responsável pelo painel administrativo
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('👑 Inicializando módulo de administração...');
    
    const app = event.detail.app;
    initializeAdminPage(app);
});

/**
 * Inicializar página de administração
 */
function initializeAdminPage(app) {
    console.log('🔧 Configurando painel administrativo...');
    
    // Verificar autenticação primeiro
    if (!checkUserAuthentication()) return;
    
    // Verificar se é administrador
    if (!checkAdmin()) return;
    
    // Configurar eventos
    setupAdminEvents();
    
    // Carregar dados
    loadStats();
    loadPendingRequests();
    
    console.log('✅ Painel administrativo inicializado');
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
 * Verificar se é administrador
 */
function checkAdmin() {
    const adminPassword = localStorage.getItem('lastAdminAccess');
    
    if (!adminPassword) {
        const password = prompt('🔐 Digite a senha do administrador:');
        if (password !== 'admin123') {
            showAdminFeedback('Senha incorreta. Redirecionando...', 'error');
            setTimeout(() => {
                window.location.href = 'calc.html';
            }, 2000);
            return false;
        }
        
        // Salvar acesso temporário (24 horas)
        localStorage.setItem('lastAdminAccess', Date.now().toString());
        showAdminFeedback('Acesso administrativo concedido', 'success');
        return true;
    }
    
    // Validar se o acesso ainda é válido (24 horas)
    const lastAccess = parseInt(adminPassword);
    const now = Date.now();
    const hoursPassed = (now - lastAccess) / (1000 * 60 * 60);
    
    if (hoursPassed > 24) {
        localStorage.removeItem('lastAdminAccess');
        return checkAdmin(); // Recursivamente pedir senha novamente
    }
    
    return true;
}

/**
 * Configurar eventos da página
 */
function setupAdminEvents() {
    // Botão de logout/voltar
    const logoutButton = document.getElementById('logoutAdmin');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Limpar acesso administrativo
            localStorage.removeItem('lastAdminAccess');
            showAdminFeedback('Saindo do painel administrativo...', 'success');
            setTimeout(() => {
                window.location.href = 'calc.html';
            }, 1500);
        });
    }
    
    console.log('⌨️ Eventos administrativos configurados');
}

/**
 * Carregar estatísticas do sistema
 */
function loadStats() {
    try {
        const users = getAllUsers();
        const requests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        
        // Contar usuários e planos
        let activeCount = users.length;
        let premiumCount = 0;
        let businessCount = 0;
        let pendingCount = requests.filter(req => req.status === 'pending').length;
        
        users.forEach(user => {
            // Verificar plano de cada usuário
            try {
                const userPlan = JSON.parse(localStorage.getItem(`user_plan_${user.id}`) || '{}');
                if (userPlan.planName === 'Premium' || userPlan.plan === 'Premium') {
                    premiumCount++;
                } else if (userPlan.planName === 'Empresarial' || userPlan.plan === 'Empresarial') {
                    businessCount++;
                }
            } catch (error) {
                console.warn('Erro ao verificar plano do usuário:', user.id, error);
            }
        });
        
        // Atualizar interface
        updateStatCard('totalUsers', activeCount, 'Usuários Ativos');
        updateStatCard('premiumUsers', premiumCount, 'Planos Premium');
        updateStatCard('businessUsers', businessCount, 'Planos Empresariais');
        updateStatCard('pendingRequests', pendingCount, 'Solicitações Pendentes');
        
        console.log('📊 Estatísticas carregadas:', {
            active: activeCount,
            premium: premiumCount,
            business: businessCount,
            pending: pendingCount
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        showAdminFeedback('Erro ao carregar estatísticas', 'error');
    }
}

/**
 * Atualizar card de estatística
 */
function updateStatCard(id, value, title) {
    const card = document.getElementById(id);
    if (card) {
        const valueElement = card.querySelector('.stat-value');
        const titleElement = card.querySelector('.stat-title');
        
        if (valueElement) valueElement.textContent = value;
        if (titleElement) titleElement.textContent = title;
    }
}

/**
 * Obter todos os usuários do sistema
 */
function getAllUsers() {
    try {
        // Buscar usuários em diferentes locais de armazenamento
        const authUsers = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Combinar e deduplicar usuários
        const allUsers = [...authUsers, ...registeredUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id || u.email === user.email)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('❌ Erro ao obter usuários:', error);
        return [];
    }
}

/**
 * Carregar solicitações pendentes
 */
function loadPendingRequests() {
    try {
        const requests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        const tableBody = document.getElementById('pendingRequestsTable');
        
        if (!tableBody) {
            console.warn('⚠️ Tabela de solicitações não encontrada');
            return;
        }
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (requests.length === 0) {
            showEmptyState(tableBody, 'Nenhuma solicitação pendente', 'fas fa-inbox');
            return;
        }
        
        // Filtrar apenas solicitações pendentes
        const pendingRequests = requests.filter(req => req.status === 'pending');
        
        if (pendingRequests.length === 0) {
            showEmptyState(tableBody, 'Nenhuma solicitação pendente', 'fas fa-check-circle');
            return;
        }
        
        // Renderizar solicitações
        pendingRequests.forEach(request => {
            const row = createRequestRow(request);
            tableBody.appendChild(row);
        });
        
        console.log('📋 Solicitações pendentes carregadas:', pendingRequests.length);
        
    } catch (error) {
        console.error('❌ Erro ao carregar solicitações:', error);
        showAdminFeedback('Erro ao carregar solicitações', 'error');
    }
}

/**
 * Criar linha da tabela para solicitação
 */
function createRequestRow(request) {
    const row = document.createElement('tr');
    
    const requestDate = new Date(request.requestDate || request.date);
    const formattedDate = requestDate.toLocaleDateString('pt-BR') + ' ' + 
                         requestDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const planName = request.planName || request.plan || 'Não especificado';
    const userName = request.userName || request.name || 'Usuário';
    const userEmail = request.userEmail || request.email || 'Não informado';
    
    row.innerHTML = `
        <td>
            <strong>${userName}</strong><br>
            <small style="color: #666;">${userEmail}</small>
        </td>
        <td>
            <span class="status pending">${planName}</span>
        </td>
        <td>${formattedDate}</td>
        <td>
            <button class="action-button approve" onclick="approveRequest('${request.id}')">
                <i class="fas fa-check"></i> Aprovar
            </button>
            <button class="action-button reject" onclick="rejectRequest('${request.id}')">
                <i class="fas fa-times"></i> Rejeitar
            </button>
        </td>
    `;
    
    return row;
}

/**
 * Mostrar estado vazio
 */
function showEmptyState(container, message, iconClass = 'fas fa-inbox') {
    container.innerHTML = `
        <tr>
            <td colspan="4">
                <div class="empty-state">
                    <i class="${iconClass}"></i>
                    <p>${message}</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Aprovar solicitação
 */
function approveRequest(requestId) {
    try {
        const requests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            showAdminFeedback('Solicitação não encontrada', 'error');
            return;
        }
        
        const request = requests[requestIndex];
        
        // Atualizar status da solicitação
        request.status = 'approved';
        request.approvedDate = new Date().toISOString();
        
        // Criar/atualizar plano do usuário
        const planData = {
            userId: request.userId,
            name: request.planName || request.plan,
            planName: request.planName || request.plan,
            price: request.planPrice || request.price,
            status: 'active',
            startDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
            approvedBy: 'admin',
            approvedDate: new Date().toISOString()
        };
        
        // Salvar plano do usuário
        localStorage.setItem(`user_plan_${request.userId}`, JSON.stringify(planData));
        
        // Atualizar array de solicitações
        requests[requestIndex] = request;
        localStorage.setItem('pendingRequests', JSON.stringify(requests));
        
        // Atualizar interface
        loadPendingRequests();
        loadStats();
        
        showAdminFeedback(`Solicitação aprovada! Plano ${planData.name} ativado para ${request.userName || 'usuário'}`, 'success');
        
        console.log('✅ Solicitação aprovada:', requestId, planData);
        
    } catch (error) {
        console.error('❌ Erro ao aprovar solicitação:', error);
        showAdminFeedback('Erro ao aprovar solicitação', 'error');
    }
}

/**
 * Rejeitar solicitação
 */
function rejectRequest(requestId) {
    if (!confirm('⚠️ Tem certeza que deseja rejeitar esta solicitação?')) {
        return;
    }
    
    try {
        const requests = JSON.parse(localStorage.getItem('pendingRequests') || '[]');
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
            showAdminFeedback('Solicitação não encontrada', 'error');
            return;
        }
        
        const request = requests[requestIndex];
        
        // Atualizar status da solicitação
        request.status = 'rejected';
        request.rejectedDate = new Date().toISOString();
        request.rejectedBy = 'admin';
        
        // Atualizar array de solicitações
        requests[requestIndex] = request;
        localStorage.setItem('pendingRequests', JSON.stringify(requests));
        
        // Atualizar interface
        loadPendingRequests();
        loadStats();
        
        showAdminFeedback(`Solicitação rejeitada para ${request.userName || 'usuário'}`, 'warning');
        
        console.log('❌ Solicitação rejeitada:', requestId);
        
    } catch (error) {
        console.error('❌ Erro ao rejeitar solicitação:', error);
        showAdminFeedback('Erro ao rejeitar solicitação', 'error');
    }
}

/**
 * Mostrar feedback administrativo
 */
function showAdminFeedback(message, type = 'success') {
    // Remover feedback anterior se existir
    const existingFeedback = document.querySelector('.admin-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Criar novo feedback
    const feedback = document.createElement('div');
    feedback.className = `admin-feedback ${type}`;
    feedback.innerHTML = `
        <i class="fas fa-${getIconForType(type)}"></i>
        ${message}
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(feedback);
    
    // Remover automaticamente após 4 segundos
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 4000);
    
    console.log(`📢 Admin Feedback (${type}):`, message);
}

/**
 * Obter ícone para tipo de feedback
 */
function getIconForType(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

// Disponibilizar funções globalmente para compatibilidade
window.AdminPageModule = {
    checkAdmin,
    loadStats,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    getAllUsers
};

// Disponibilizar funções específicas globalmente (para onclick nos botões)
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo administrativo carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo administrativo carregado (DOM já pronto)');
} 