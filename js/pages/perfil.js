/**
 * Profile Page Module - Calculadora de Madeira
 * Módulo responsável pela página de perfil do usuário
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('👤 Inicializando módulo de perfil...');
    
    const app = event.detail.app;
    initializeProfilePage(app);
});

/**
 * Inicializar página de perfil
 */
function initializeProfilePage(app) {
    console.log('📝 Configurando página de perfil...');
    
    // Verificar autenticação
    if (!checkAuthentication(app)) return;
    
    // Configurar eventos
    setupProfileEvents(app);
    
    // Carregar dados do perfil
    loadProfileData(app);
    
    // Carregar dados do plano
    loadPlanData(app);
    
    // Aplicar formatações se necessário
    if (app.getModule('formatters')) {
        applyFormattingToProfileForms(app.getModule('formatters'));
    }
    
    console.log('✅ Página de perfil inicializada');
}

/**
 * Verificar autenticação
 */
function checkAuthentication(app) {
    try {
        const storage = app.getModule('storage');
        if (!storage) {
            console.error('❌ Módulo de storage não disponível');
            return false;
        }
        
        const currentUserId = storage.getCurrentUserId();
        if (!currentUserId) {
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
 * Configurar eventos da página
 */
function setupProfileEvents(app) {
    // Evento de salvar perfil
    const saveButton = document.getElementById('saveProfile');
    if (saveButton) {
        saveButton.addEventListener('click', () => saveProfile(app));
    }
    
    // Evento de exportar dados
    const exportButton = document.getElementById('exportData');
    if (exportButton) {
        exportButton.addEventListener('click', () => exportUserData(app));
    }
    
    // Evento de excluir conta
    const deleteButton = document.getElementById('deleteAccount');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => deleteAccount(app));
    }
    
    // Evento de upload de logo
    const logoInput = document.getElementById('logoInput');
    if (logoInput) {
        logoInput.addEventListener('change', (event) => handleLogoUpload(event, app));
    }
    
    // Evento de remover logo
    const removeLogoButton = document.getElementById('removeLogo');
    if (removeLogoButton) {
        removeLogoButton.addEventListener('click', () => removeLogo(app));
    }
    
    console.log('⌨️ Eventos do perfil configurados');
}

/**
 * Carregar dados do perfil
 */
function loadProfileData(app) {
    try {
        const storage = app.getModule('storage');
        const userData = storage.getUserData();
        
        if (userData) {
            // Preencher campos pessoais
            document.getElementById('userName').value = userData.name || '';
            document.getElementById('userEmail').value = userData.email || '';
            document.getElementById('userPhone').value = userData.phone || '';
            
            // Preencher dados da empresa
            document.getElementById('companyName').value = userData.company || '';
            document.getElementById('companyCNPJ').value = userData.cnpj || '';
            document.getElementById('companyAddress').value = userData.address || '';
            document.getElementById('companyPhone').value = userData.companyPhone || '';
            
            // Carregar logo se existir
            const logoData = localStorage.getItem('companyLogo');
            if (logoData) {
                displayLogo(logoData);
            }
            
            console.log('✅ Dados do perfil carregados');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do perfil:', error);
        if (app.getModule('feedback')) {
            app.getModule('feedback').error('Erro ao carregar dados do perfil');
        }
    }
}

/**
 * Carregar dados do plano
 */
function loadPlanData(app) {
    try {
        const storage = app.getModule('storage');
        const currentUserId = storage.getCurrentUserId();
        
        // Verificar plano atual
        const planData = localStorage.getItem(`user_plan_${currentUserId}`);
        const currentPlanElement = document.getElementById('currentPlan');
        const planStatusElement = document.getElementById('planStatus');
        const planExpiryElement = document.getElementById('planExpiry');
        
        if (planData) {
            const plan = JSON.parse(planData);
            
            currentPlanElement.textContent = plan.name || 'Plano Básico';
            planStatusElement.textContent = plan.active ? 'Ativo' : 'Inativo';
            
            if (plan.expiryDate) {
                const expiryDate = new Date(plan.expiryDate);
                planExpiryElement.textContent = `Válido até: ${expiryDate.toLocaleDateString('pt-BR')}`;
            } else {
                planExpiryElement.textContent = 'Sem data de expiração';
            }
        } else {
            currentPlanElement.textContent = 'Plano Gratuito';
            planStatusElement.textContent = 'Ativo';
            planExpiryElement.textContent = 'Sem limitações';
        }
        
        console.log('✅ Dados do plano carregados');
    } catch (error) {
        console.error('❌ Erro ao carregar dados do plano:', error);
    }
}

/**
 * Salvar perfil
 */
function saveProfile(app) {
    try {
        const storage = app.getModule('storage');
        const feedback = app.getModule('feedback');
        
        // Coletar dados do formulário
        const profileData = {
            name: document.getElementById('userName').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            phone: document.getElementById('userPhone').value.trim(),
            company: document.getElementById('companyName').value.trim(),
            cnpj: document.getElementById('companyCNPJ').value.trim(),
            address: document.getElementById('companyAddress').value.trim(),
            companyPhone: document.getElementById('companyPhone').value.trim()
        };
        
        // Validar dados essenciais
        if (!profileData.name) {
            feedback.error('Nome é obrigatório');
            document.getElementById('userName').focus();
            return;
        }
        
        if (!profileData.email) {
            feedback.error('Email é obrigatório');
            document.getElementById('userEmail').focus();
            return;
        }
        
        // Salvar dados
        const currentUserId = storage.getCurrentUserId();
        const existingData = storage.getUserData() || {};
        const updatedData = { ...existingData, ...profileData };
        
        localStorage.setItem('user', JSON.stringify(updatedData));
        
        // Atualizar dados de autenticação se necessário
        const authData = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const userIndex = authData.findIndex(u => u.id === currentUserId);
        if (userIndex !== -1) {
            authData[userIndex] = { ...authData[userIndex], ...profileData };
            localStorage.setItem('calc_madeira_auth', JSON.stringify(authData));
        }
        
        feedback.success('Perfil salvo com sucesso!');
        console.log('✅ Perfil salvo:', profileData);
        
    } catch (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        if (app.getModule('feedback')) {
            app.getModule('feedback').error('Erro ao salvar perfil');
        }
    }
}

/**
 * Handle upload de logo
 */
function handleLogoUpload(event, app) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        app.getModule('feedback').error('Por favor, selecione uma imagem válida');
        return;
    }
    
    // Verificar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
        app.getModule('feedback').error('Imagem muito grande. Máximo 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoData = e.target.result;
        
        // Salvar logo no localStorage
        localStorage.setItem('companyLogo', logoData);
        
        // Exibir logo
        displayLogo(logoData);
        
        app.getModule('feedback').success('Logo carregada com sucesso!');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Exibir logo
 */
function displayLogo(logoData) {
    const logoPreview = document.getElementById('logoPreview');
    const noLogo = document.getElementById('noLogo');
    const removeButton = document.getElementById('removeLogo');
    
    if (logoPreview && noLogo && removeButton) {
        logoPreview.src = logoData;
        logoPreview.style.display = 'block';
        noLogo.style.display = 'none';
        removeButton.style.display = 'inline-flex';
    }
}

/**
 * Remover logo
 */
function removeLogo(app) {
    localStorage.removeItem('companyLogo');
    
    const logoPreview = document.getElementById('logoPreview');
    const noLogo = document.getElementById('noLogo');
    const removeButton = document.getElementById('removeLogo');
    const logoInput = document.getElementById('logoInput');
    
    if (logoPreview && noLogo && removeButton && logoInput) {
        logoPreview.style.display = 'none';
        noLogo.style.display = 'block';
        removeButton.style.display = 'none';
        logoInput.value = '';
    }
    
    app.getModule('feedback').success('Logo removida');
}

/**
 * Exportar dados do usuário
 */
function exportUserData(app) {
    try {
        const storage = app.getModule('storage');
        const userData = storage.getUserData();
        const currentUserId = storage.getCurrentUserId();
        
        // Coletar todos os dados do usuário
        const exportData = {
            perfil: userData,
            orçamentos: JSON.parse(localStorage.getItem(`quotes_${currentUserId}`) || '[]'),
            listaItens: storage.loadWoodList(),
            configurações: {
                version: '2.0.0',
                exportDate: new Date().toISOString()
            }
        };
        
        // Criar e baixar arquivo JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `calculadora-madeira-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        app.getModule('feedback').success('Dados exportados com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        app.getModule('feedback').error('Erro ao exportar dados');
    }
}

/**
 * Excluir conta
 */
function deleteAccount(app) {
    if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja excluir sua conta e todos os dados?')) {
        return;
    }
    
    if (!confirm('Esta é sua última chance! Todos os orçamentos, configurações e dados serão perdidos permanentemente.\n\nConfirma a exclusão?')) {
        return;
    }
    
    try {
        const storage = app.getModule('storage');
        const currentUserId = storage.getCurrentUserId();
        
        // Remover todos os dados do usuário
        const keysToRemove = [
            'user',
            'isLoggedIn',
            'currentUserId',
            'woodList',
            'companyLogo',
            `quotes_${currentUserId}`,
            `user_plan_${currentUserId}`
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Remover da lista de usuários autenticados
        const authData = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const updatedAuthData = authData.filter(u => u.id !== currentUserId);
        localStorage.setItem('calc_madeira_auth', JSON.stringify(updatedAuthData));
        
        app.getModule('feedback').success('Conta excluída com sucesso');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('❌ Erro ao excluir conta:', error);
        app.getModule('feedback').error('Erro ao excluir conta');
    }
}

/**
 * Aplicar formatações aos formulários
 */
function applyFormattingToProfileForms(formatters) {
    // Aplicar máscara de telefone
    const phoneInputs = ['userPhone', 'companyPhone'];
    phoneInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input && formatters.applyPhoneMask) {
            formatters.applyPhoneMask(input);
        }
    });
    
    // Aplicar máscara de CNPJ
    const cnpjInput = document.getElementById('companyCNPJ');
    if (cnpjInput && formatters.applyCNPJMask) {
        formatters.applyCNPJMask(cnpjInput);
    }
    
    console.log('🎨 Formatações aplicadas aos formulários de perfil');
}

// Disponibilizar funções globalmente para compatibilidade
window.ProfilePageModule = {
    loadProfileData,
    saveProfile,
    handleLogoUpload,
    exportUserData,
    deleteAccount
};

console.log('📦 Módulo de perfil carregado'); 