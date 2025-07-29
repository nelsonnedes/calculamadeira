/**
 * Help Page Module - Calculadora de Madeira
 * Módulo responsável pela página de ajuda e suporte
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('❓ Inicializando módulo de ajuda...');
    
    const app = event.detail.app;
    initializeHelpPage(app);
});

// Estado da página de ajuda
let helpPageState = {
    searchTerm: '',
    activeTab: null,
    formData: {}
};

/**
 * Inicializar página de ajuda
 */
function initializeHelpPage(app) {
    console.log('🔧 Configurando página de ajuda...');
    
    // Verificar autenticação (opcionalmente)
    // checkUserAuthentication();
    
    // Configurar eventos
    setupHelpEvents();
    
    // Configurar FAQ
    setupFAQInteractions();
    
    // Configurar formulário de contato
    setupContactForm();
    
    // Configurar busca
    setupSearchFunctionality();
    
    // Carregar conteúdo adicional
    loadHelpContent();
    
    console.log('✅ Página de ajuda inicializada');
}

/**
 * Verificar autenticação do usuário (opcional)
 */
function checkUserAuthentication() {
    try {
        // Verificação opcional - ajuda pode ser acessível sem login
        if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
            console.log('⚠️ Usuário não autenticado - algumas funcionalidades podem estar limitadas');
            // Não redirecionar, apenas limitar funcionalidades
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível verificar autenticação:', error);
    }
}

/**
 * Configurar eventos da página
 */
function setupHelpEvents() {
    // Botões de navegação rápida
    const quickNavButtons = document.querySelectorAll('[data-help-section]');
    quickNavButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sectionId = e.currentTarget.dataset.helpSection;
            scrollToSection(sectionId);
        });
    });
    
    // Botões de ação
    const actionButtons = document.querySelectorAll('.help-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleActionButton);
    });
    
    console.log('⌨️ Eventos de ajuda configurados');
}

/**
 * Configurar interações do FAQ
 */
function setupFAQInteractions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Fechar todos os itens FAQ
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Abrir o item clicado se não estava ativo
            if (!isActive) {
                faqItem.classList.add('active');
                
                // Animar scroll suave se necessário
                setTimeout(() => {
                    faqItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 300);
                
                // Tracking de analytics (se disponível)
                trackFAQInteraction(question.textContent.trim());
            }
        });
    });
    
    console.log('❓ FAQ interativo configurado');
}

/**
 * Configurar formulário de contato
 */
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        
        // Validação em tempo real
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', validateFormField);
            input.addEventListener('input', clearFieldError);
        });
        
        // Auto-save do formulário
        formInputs.forEach(input => {
            input.addEventListener('input', saveFormData);
        });
        
        // Restaurar dados salvos
        restoreFormData();
    }
    
    console.log('📝 Formulário de contato configurado');
}

/**
 * Configurar funcionalidade de busca
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchHelp');
    
    if (searchInput) {
        // Busca em tempo real com debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });
        
        // Limpar busca com Escape
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                performSearch('');
            }
        });
    }
    
    console.log('🔍 Funcionalidade de busca configurada');
}

/**
 * Realizar busca no conteúdo de ajuda
 */
function performSearch(searchTerm) {
    helpPageState.searchTerm = searchTerm.toLowerCase().trim();
    
    const sections = document.querySelectorAll('.help-section');
    let visibleSections = 0;
    
    sections.forEach(section => {
        const sectionText = section.textContent.toLowerCase();
        const shouldShow = !helpPageState.searchTerm || sectionText.includes(helpPageState.searchTerm);
        
        if (shouldShow) {
            section.style.display = 'block';
            section.classList.remove('hidden');
            visibleSections++;
            
            // Destacar termos encontrados
            if (helpPageState.searchTerm) {
                highlightSearchTerms(section, helpPageState.searchTerm);
            } else {
                removeHighlights(section);
            }
        } else {
            section.style.display = 'none';
            section.classList.add('hidden');
        }
    });
    
    // Mostrar/ocultar mensagem de "nenhum resultado"
    toggleNoResultsMessage(visibleSections === 0 && helpPageState.searchTerm);
    
    console.log(`🔍 Busca realizada: "${helpPageState.searchTerm}" - ${visibleSections} seções encontradas`);
}

/**
 * Destacar termos de busca
 */
function highlightSearchTerms(element, searchTerm) {
    // Remover destaques anteriores
    removeHighlights(element);
    
    if (!searchTerm) return;
    
    const textNodes = getTextNodes(element);
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    
    textNodes.forEach(node => {
        if (regex.test(node.textContent)) {
            const parent = node.parentNode;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = node.textContent.replace(regex, '<span class="search-highlight">$1</span>');
            
            while (wrapper.firstChild) {
                parent.insertBefore(wrapper.firstChild, node);
            }
            parent.removeChild(node);
        }
    });
}

/**
 * Remover destaques de busca
 */
function removeHighlights(element) {
    const highlights = element.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
    });
}

/**
 * Obter nós de texto de um elemento
 */
function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Ignorar nós em scripts, styles, etc.
                const parent = node.parentElement;
                if (parent && ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

/**
 * Escapar caracteres especiais do regex
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Mostrar/ocultar mensagem de nenhum resultado
 */
function toggleNoResultsMessage(show) {
    let noResultsMsg = document.getElementById('noResultsMessage');
    
    if (show && !noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'noResultsMessage';
        noResultsMsg.className = 'help-section';
        noResultsMsg.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                <h3 style="color: var(--text-color); margin-bottom: 10px;">Nenhum resultado encontrado</h3>
                <p style="color: var(--text-light);">Tente pesquisar com outros termos ou navegue pelas seções disponíveis.</p>
            </div>
        `;
        
        document.querySelector('.help-container').appendChild(noResultsMsg);
    } else if (!show && noResultsMsg) {
        noResultsMsg.remove();
    }
}

/**
 * Manipular envio do formulário de contato
 */
function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Coletar dados do formulário
    const contactData = {
        name: formData.get('name') || document.getElementById('name')?.value,
        email: formData.get('email') || document.getElementById('email')?.value,
        subject: formData.get('subject') || document.getElementById('subject')?.value,
        message: formData.get('message') || document.getElementById('message')?.value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // Validar dados
    if (!validateContactData(contactData)) {
        return;
    }
    
    // Enviar formulário
    submitContactForm(contactData, form);
}

/**
 * Validar dados do formulário de contato
 */
function validateContactData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Email deve ter um formato válido');
    }
    
    if (!data.subject || data.subject.trim().length < 3) {
        errors.push('Assunto deve ter pelo menos 3 caracteres');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showHelpFeedback(`Erro na validação:\n${errors.join('\n')}`, 'error');
        return false;
    }
    
    return true;
}

/**
 * Validar formato de email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Enviar formulário de contato
 */
function submitContactForm(contactData, form) {
    try {
        // Simular envio (em produção, seria uma requisição real)
        console.log('📧 Formulário de contato enviado:', contactData);
        
        // Salvar no localStorage como backup
        const savedContacts = JSON.parse(localStorage.getItem('helpContacts') || '[]');
        savedContacts.push(contactData);
        localStorage.setItem('helpContacts', JSON.stringify(savedContacts));
        
        // Limpar formulário
        form.reset();
        clearSavedFormData();
        
        // Mostrar feedback de sucesso
        showHelpFeedback('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
        
        // Scroll para o topo do formulário
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Tracking de analytics
        trackContactFormSubmission(contactData.subject);
        
    } catch (error) {
        console.error('❌ Erro ao enviar formulário:', error);
        showHelpFeedback('Erro ao enviar mensagem. Tente novamente.', 'error');
    }
}

/**
 * Validar campo do formulário
 */
function validateFormField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remover mensagens de erro anteriores
    clearFieldError(event);
    
    let isValid = true;
    let errorMessage = '';
    
    switch (field.id) {
        case 'name':
            if (value.length < 2) {
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!isValidEmail(value)) {
                errorMessage = 'Email deve ter um formato válido';
                isValid = false;
            }
            break;
            
        case 'subject':
            if (value.length < 3) {
                errorMessage = 'Assunto deve ter pelo menos 3 caracteres';
                isValid = false;
            }
            break;
            
        case 'message':
            if (value.length < 10) {
                errorMessage = 'Mensagem deve ter pelo menos 10 caracteres';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

/**
 * Mostrar erro em campo específico
 */
function showFieldError(field, message) {
    field.style.borderColor = 'var(--error-color)';
    field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
    
    // Criar ou atualizar mensagem de erro
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: var(--error-color);
            font-size: 0.8rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
}

/**
 * Limpar erro de campo
 */
function clearFieldError(event) {
    const field = event.target;
    field.style.borderColor = 'var(--border-color)';
    field.style.boxShadow = 'none';
    
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Salvar dados do formulário (auto-save)
 */
function saveFormData() {
    const formData = {
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        subject: document.getElementById('subject')?.value || '',
        message: document.getElementById('message')?.value || ''
    };
    
    helpPageState.formData = formData;
    localStorage.setItem('helpFormDraft', JSON.stringify(formData));
}

/**
 * Restaurar dados salvos do formulário
 */
function restoreFormData() {
    try {
        const savedData = localStorage.getItem('helpFormDraft');
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            Object.keys(formData).forEach(key => {
                const field = document.getElementById(key);
                if (field && formData[key]) {
                    field.value = formData[key];
                }
            });
            
            console.log('📝 Dados do formulário restaurados');
        }
    } catch (error) {
        console.warn('⚠️ Erro ao restaurar dados do formulário:', error);
    }
}

/**
 * Limpar dados salvos do formulário
 */
function clearSavedFormData() {
    localStorage.removeItem('helpFormDraft');
    helpPageState.formData = {};
}

/**
 * Manipular botões de ação
 */
function handleActionButton(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    
    switch (action) {
        case 'scroll-top':
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
            
        case 'toggle-faq':
            toggleAllFAQ();
            break;
            
        case 'clear-search':
            clearSearch();
            break;
            
        case 'download-guide':
            downloadHelpGuide();
            break;
            
        default:
            console.log('Ação não reconhecida:', action);
    }
}

/**
 * Rolar para seção específica
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Destacar seção brevemente
        section.style.animation = 'helpSectionHighlight 2s ease-out';
        setTimeout(() => {
            section.style.animation = '';
        }, 2000);
    }
}

/**
 * Toggle todos os itens FAQ
 */
function toggleAllFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    const anyOpen = Array.from(faqItems).some(item => item.classList.contains('active'));
    
    faqItems.forEach(item => {
        if (anyOpen) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    });
}

/**
 * Limpar busca
 */
function clearSearch() {
    const searchInput = document.getElementById('searchHelp');
    if (searchInput) {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
    }
}

/**
 * Baixar guia de ajuda (mock)
 */
function downloadHelpGuide() {
    showHelpFeedback('Funcionalidade de download será implementada em breve!', 'info');
}

/**
 * Carregar conteúdo adicional
 */
function loadHelpContent() {
    // Carregar estatísticas de uso
    loadHelpStatistics();
    
    // Verificar atualizações de conteúdo
    checkForContentUpdates();
    
    // Configurar tooltips se necessário
    setupTooltips();
}

/**
 * Carregar estatísticas de ajuda
 */
function loadHelpStatistics() {
    try {
        const stats = {
            totalSections: document.querySelectorAll('.help-section').length,
            faqItems: document.querySelectorAll('.faq-item').length,
            lastVisit: localStorage.getItem('lastHelpVisit') || 'Primeira visita',
            searchCount: parseInt(localStorage.getItem('helpSearchCount') || '0')
        };
        
        // Atualizar última visita
        localStorage.setItem('lastHelpVisit', new Date().toISOString());
        
        console.log('📊 Estatísticas de ajuda:', stats);
        
    } catch (error) {
        console.warn('⚠️ Erro ao carregar estatísticas:', error);
    }
}

/**
 * Verificar atualizações de conteúdo
 */
function checkForContentUpdates() {
    // Mock - em produção verificaria contra uma API
    console.log('🔄 Verificando atualizações de conteúdo...');
}

/**
 * Configurar tooltips
 */
function setupTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    // Implementar tooltips customizados se necessário
    console.log(`💡 ${elementsWithTooltips.length} tooltips configurados`);
}

/**
 * Tracking de interações (analytics)
 */
function trackFAQInteraction(question) {
    try {
        console.log('📈 FAQ clicado:', question);
        // Implementar analytics real aqui
    } catch (error) {
        console.warn('⚠️ Erro no tracking:', error);
    }
}

/**
 * Tracking de envio de formulário
 */
function trackContactFormSubmission(subject) {
    try {
        console.log('📈 Formulário enviado:', subject);
        // Implementar analytics real aqui
    } catch (error) {
        console.warn('⚠️ Erro no tracking:', error);
    }
}

/**
 * Mostrar feedback específico da página de ajuda
 */
function showHelpFeedback(message, type = 'success') {
    // Usar sistema de feedback global se disponível
    if (typeof window.showFeedback === 'function') {
        window.showFeedback(message, type);
        return;
    }
    
    // Fallback simples
    console.log(`📢 Help Feedback (${type}):`, message);
}

// Disponibilizar funções globalmente para compatibilidade
window.HelpModule = {
    performSearch,
    scrollToSection,
    toggleAllFAQ,
    clearSearch,
    validateContactData,
    getCurrentState: () => helpPageState
};

// Adicionar estilos CSS dinâmicos
const style = document.createElement('style');
style.textContent = `
    @keyframes helpSectionHighlight {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(76, 175, 80, 0.1); }
    }
    
    .field-error {
        animation: fieldErrorShake 0.5s ease-out;
    }
    
    @keyframes fieldErrorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Verificar se DOM já carregou (fallback para compatibilidade)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📦 Módulo de ajuda carregado (DOMContentLoaded)');
    });
} else {
    console.log('📦 Módulo de ajuda carregado (DOM já pronto)');
} 