/**
 * Payment Terms Page Module - Calculadora de Madeira
 * Módulo responsável pelo gerenciamento de condições de pagamento
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('💳 Inicializando módulo de condições de pagamento...');
    
    const app = event.detail.app;
    initializePaymentTermsPage(app);
});

// Condições de pagamento padrão do sistema
const DEFAULT_PAYMENT_TERMS = [
    '50% entrada, 50% na entrega',
    'À vista',
    '30% entrada, 70% na entrega',
    'Pagamento na entrega',
    '1+2 (33% entrada, 33% em 30 dias, 34% em 60 dias)',
    '1+3 (25% entrada, 25% em 30 dias, 25% em 60 dias, 25% em 90 dias)',
    'Parcelado em 2x sem juros',
    'Parcelado em 3x sem juros',
    '70% entrada, 30% na entrega',
    'Pagamento em 30 dias',
    'Pagamento em 45 dias',
    'Pagamento em 60 dias'
];

// Estado atual das condições
let currentPaymentTerms = [];

/**
 * Inicializar página de condições de pagamento
 */
function initializePaymentTermsPage(app) {
    console.log('🔧 Configurando página de condições de pagamento...');
    
    // Verificar autenticação
    if (!checkUserAuthentication()) return;
    
    // Inicializar condições padrão
    initializeDefaultPaymentTerms();
    
    // Carregar condições de pagamento
    loadPaymentTerms();
    
    // Configurar eventos
    setupPaymentTermsEvents();
    
    // Carregar estatísticas
    loadPaymentStats();
    
    console.log('✅ Página de condições de pagamento inicializada');
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
 * Inicializar condições de pagamento padrão
 */
function initializeDefaultPaymentTerms() {
    try {
        const existingTerms = JSON.parse(localStorage.getItem('paymentTerms')) || [];
        let updated = false;
        
        // Adicionar termos padrão que não existem
        DEFAULT_PAYMENT_TERMS.forEach(term => {
            if (!existingTerms.includes(term)) {
                existingTerms.push(term);
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem('paymentTerms', JSON.stringify(existingTerms));
            console.log('📋 Condições de pagamento padrão inicializadas');
        }
        
        currentPaymentTerms = existingTerms;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar condições padrão:', error);
        currentPaymentTerms = [...DEFAULT_PAYMENT_TERMS];
        savePaymentTerms();
    }
}

/**
 * Configurar eventos da página
 */
function setupPaymentTermsEvents() {
    // Botão de adicionar
    const addButton = document.querySelector('.add-form button');
    if (addButton) {
        addButton.addEventListener('click', addPaymentTerm);
    }
    
    // Enter no campo de input
    const newTermInput = document.getElementById('newPaymentTerm');
    if (newTermInput) {
        newTermInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addPaymentTerm();
            }
        });
        
        // Validação em tempo real
        newTermInput.addEventListener('input', validateTermInput);
    }
    
    console.log('⌨️ Eventos de condições de pagamento configurados');
}

/**
 * Validar entrada do campo de texto
 */
function validateTermInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remover caracteres inválidos
    input.value = value.replace(/[<>]/g, '');
    
    // Verificar se já existe
    if (value && currentPaymentTerms.includes(value)) {
        input.style.borderColor = 'var(--error-color)';
        input.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
    } else {
        input.style.borderColor = 'var(--border-color)';
        input.style.boxShadow = 'none';
    }
}

/**
 * Carregar e exibir condições de pagamento
 */
function loadPaymentTerms() {
    try {
        currentPaymentTerms = JSON.parse(localStorage.getItem('paymentTerms')) || [];
        const container = document.getElementById('paymentTermsList');
        
        if (!container) {
            console.warn('⚠️ Container de condições não encontrado');
            return;
        }
        
        // Filtrar apenas condições personalizadas (não padrão)
        const customTerms = currentPaymentTerms.filter(term => 
            !DEFAULT_PAYMENT_TERMS.includes(term)
        );
        
        if (customTerms.length === 0) {
            showEmptyState(container);
            return;
        }
        
        // Renderizar condições personalizadas
        container.innerHTML = customTerms.map((term, index) => {
            const originalIndex = currentPaymentTerms.indexOf(term);
            return createPaymentTermElement(term, originalIndex);
        }).join('');
        
        console.log(`📄 Exibindo ${customTerms.length} condições personalizadas`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar condições:', error);
        showPaymentTermsFeedback('Erro ao carregar condições de pagamento', 'error');
    }
}

/**
 * Criar elemento HTML de condição de pagamento
 */
function createPaymentTermElement(term, index) {
    return `
        <div class="payment-term-item" data-index="${index}">
            <span class="payment-term-text">${escapeHtml(term)}</span>
            <div class="payment-term-actions">
                <button class="action-btn edit-btn" onclick="editPaymentTerm(${index})" title="Editar condição">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="action-btn delete-btn" onclick="deletePaymentTerm(${index})" title="Excluir condição">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `;
}

/**
 * Mostrar estado vazio
 */
function showEmptyState(container) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-credit-card"></i>
            <p><strong>Nenhuma condição personalizada</strong></p>
            <p>Adicione condições de pagamento personalizadas usando o formulário acima. As condições padrão do sistema estão sempre disponíveis.</p>
        </div>
    `;
}

/**
 * Adicionar nova condição de pagamento
 */
function addPaymentTerm() {
    try {
        const input = document.getElementById('newPaymentTerm');
        if (!input) return;
        
        const term = input.value.trim();
        
        // Validações
        if (!term) {
            showPaymentTermsFeedback('Por favor, digite uma condição de pagamento', 'warning');
            input.focus();
            return;
        }
        
        if (term.length < 3) {
            showPaymentTermsFeedback('A condição deve ter pelo menos 3 caracteres', 'warning');
            input.focus();
            return;
        }
        
        if (term.length > 100) {
            showPaymentTermsFeedback('A condição não pode ter mais de 100 caracteres', 'warning');
            input.focus();
            return;
        }
        
        if (currentPaymentTerms.includes(term)) {
            showPaymentTermsFeedback('Esta condição de pagamento já existe', 'warning');
            input.focus();
            return;
        }
        
        // Adicionar condição
        currentPaymentTerms.push(term);
        savePaymentTerms();
        
        // Limpar input e recarregar lista
        input.value = '';
        input.style.borderColor = 'var(--border-color)';
        input.style.boxShadow = 'none';
        
        loadPaymentTerms();
        loadPaymentStats();
        
        showPaymentTermsFeedback('Condição de pagamento adicionada com sucesso!', 'success');
        
        console.log('➕ Nova condição adicionada:', term);
        
    } catch (error) {
        console.error('❌ Erro ao adicionar condição:', error);
        showPaymentTermsFeedback('Erro ao adicionar condição de pagamento', 'error');
    }
}

/**
 * Editar condição de pagamento
 */
function editPaymentTerm(index) {
    try {
        if (index < 0 || index >= currentPaymentTerms.length) {
            showPaymentTermsFeedback('Condição não encontrada', 'error');
            return;
        }
        
        const currentTerm = currentPaymentTerms[index];
        
        // Verificar se é uma condição padrão (não pode ser editada)
        if (DEFAULT_PAYMENT_TERMS.includes(currentTerm)) {
            showPaymentTermsFeedback('Condições padrão do sistema não podem ser editadas', 'warning');
            return;
        }
        
        const newTerm = prompt('Editar condição de pagamento:', currentTerm);
        
        if (newTerm === null) return; // Cancelou
        
        const trimmedTerm = newTerm.trim();
        
        // Validações
        if (!trimmedTerm) {
            showPaymentTermsFeedback('A condição de pagamento não pode estar vazia', 'warning');
            return;
        }
        
        if (trimmedTerm.length < 3) {
            showPaymentTermsFeedback('A condição deve ter pelo menos 3 caracteres', 'warning');
            return;
        }
        
        if (trimmedTerm.length > 100) {
            showPaymentTermsFeedback('A condição não pode ter mais de 100 caracteres', 'warning');
            return;
        }
        
        if (trimmedTerm !== currentTerm && currentPaymentTerms.includes(trimmedTerm)) {
            showPaymentTermsFeedback('Esta condição de pagamento já existe', 'warning');
            return;
        }
        
        // Atualizar condição
        currentPaymentTerms[index] = trimmedTerm;
        savePaymentTerms();
        
        loadPaymentTerms();
        loadPaymentStats();
        
        showPaymentTermsFeedback('Condição de pagamento atualizada com sucesso!', 'success');
        
        console.log('✏️ Condição editada:', currentTerm, '→', trimmedTerm);
        
    } catch (error) {
        console.error('❌ Erro ao editar condição:', error);
        showPaymentTermsFeedback('Erro ao editar condição de pagamento', 'error');
    }
}

/**
 * Excluir condição de pagamento
 */
function deletePaymentTerm(index) {
    try {
        if (index < 0 || index >= currentPaymentTerms.length) {
            showPaymentTermsFeedback('Condição não encontrada', 'error');
            return;
        }
        
        const termToDelete = currentPaymentTerms[index];
        
        // Verificar se é uma condição padrão (não pode ser excluída)
        if (DEFAULT_PAYMENT_TERMS.includes(termToDelete)) {
            showPaymentTermsFeedback('Condições padrão do sistema não podem ser excluídas', 'warning');
            return;
        }
        
        if (!confirm(`⚠️ Tem certeza que deseja excluir esta condição de pagamento?\n\n"${termToDelete}"\n\nEsta ação não pode ser desfeita.`)) {
            return;
        }
        
        // Remover condição
        currentPaymentTerms.splice(index, 1);
        savePaymentTerms();
        
        // Animar remoção do elemento
        const element = document.querySelector(`[data-index="${index}"]`);
        if (element) {
            element.style.animation = 'paymentItemSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                loadPaymentTerms();
                loadPaymentStats();
            }, 300);
        } else {
            loadPaymentTerms();
            loadPaymentStats();
        }
        
        showPaymentTermsFeedback('Condição de pagamento excluída com sucesso!', 'success');
        
        console.log('🗑️ Condição excluída:', termToDelete);
        
    } catch (error) {
        console.error('❌ Erro ao excluir condição:', error);
        showPaymentTermsFeedback('Erro ao excluir condição de pagamento', 'error');
    }
}

/**
 * Salvar condições no localStorage
 */
function savePaymentTerms() {
    try {
        localStorage.setItem('paymentTerms', JSON.stringify(currentPaymentTerms));
        console.log('💾 Condições de pagamento salvas');
    } catch (error) {
        console.error('❌ Erro ao salvar condições:', error);
        showPaymentTermsFeedback('Erro ao salvar condições', 'error');
    }
}

/**
 * Carregar estatísticas das condições
 */
function loadPaymentStats() {
    try {
        const totalTerms = currentPaymentTerms.length;
        const defaultTerms = currentPaymentTerms.filter(term => 
            DEFAULT_PAYMENT_TERMS.includes(term)
        ).length;
        const customTerms = totalTerms - defaultTerms;
        
        // Atualizar cards de estatísticas se existirem
        updateStatCard('totalTerms', `${totalTerms} condições`, 'Total de Condições');
        updateStatCard('defaultTerms', `${defaultTerms} padrão`, 'Condições Padrão');
        updateStatCard('customTerms', `${customTerms} personalizadas`, 'Condições Personalizadas');
        updateStatCard('lastUpdated', getLastUpdateInfo(), 'Última Atualização');
        
        console.log(`📊 Stats: ${totalTerms} total, ${defaultTerms} padrão, ${customTerms} personalizadas`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
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
 * Obter informações da última atualização
 */
function getLastUpdateInfo() {
    const lastUpdate = localStorage.getItem('paymentTermsLastUpdate');
    if (lastUpdate) {
        const date = new Date(lastUpdate);
        return date.toLocaleDateString('pt-BR');
    }
    return 'Hoje';
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Mostrar feedback específico da página
 */
function showPaymentTermsFeedback(message, type = 'success') {
    // Atualizar timestamp da última modificação
    if (type === 'success') {
        localStorage.setItem('paymentTermsLastUpdate', new Date().toISOString());
    }
    
    // Usar sistema de feedback global se disponível
    if (typeof window.showFeedback === 'function') {
        window.showFeedback(message, type);
        return;
    }
    
    // Fallback simples
    console.log(`📢 Payment Terms Feedback (${type}):`, message);
}

/**
 * Exportar condições de pagamento
 */
function exportPaymentTerms() {
    try {
        const exportData = {
            paymentTerms: currentPaymentTerms,
            exportDate: new Date().toISOString(),
            appVersion: '2.3.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `condicoes-pagamento-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showPaymentTermsFeedback('Condições de pagamento exportadas com sucesso', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar condições:', error);
        showPaymentTermsFeedback('Erro ao exportar condições', 'error');
    }
}

/**
 * Importar condições de pagamento
 */
function importPaymentTerms(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (importData.paymentTerms && Array.isArray(importData.paymentTerms)) {
                // Mesclar com condições existentes
                const newTerms = importData.paymentTerms.filter(term => 
                    !currentPaymentTerms.includes(term)
                );
                
                if (newTerms.length > 0) {
                    currentPaymentTerms.push(...newTerms);
                    savePaymentTerms();
                    loadPaymentTerms();
                    loadPaymentStats();
                    
                    showPaymentTermsFeedback(`${newTerms.length} condições importadas com sucesso`, 'success');
                } else {
                    showPaymentTermsFeedback('Nenhuma condição nova foi encontrada para importar', 'info');
                }
            } else {
                throw new Error('Formato de arquivo inválido');
            }
        } catch (error) {
            console.error('❌ Erro ao importar condições:', error);
            showPaymentTermsFeedback('Erro ao importar condições - arquivo inválido', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Disponibilizar funções globalmente para compatibilidade
window.PaymentTermsModule = {
    addPaymentTerm,
    editPaymentTerm,
    deletePaymentTerm,
    loadPaymentTerms,
    exportPaymentTerms,
    importPaymentTerms,
    getCurrentTerms: () => currentPaymentTerms
};

// Disponibilizar funções específicas globalmente (para onclick nos botões)
window.addPaymentTerm = addPaymentTerm;
window.editPaymentTerm = editPaymentTerm;
window.deletePaymentTerm = deletePaymentTerm;

// Adicionar animação CSS para saída
const style = document.createElement('style');
style.textContent = `
    @keyframes paymentItemSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo de condições de pagamento carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo de condições de pagamento carregado (DOM já pronto)');
} 