/**
 * Página Perfil - Calculadora de Madeira
 * Seguindo o padrão modular do REFACTORING_PLAN.md
 * Substitui JavaScript inline em perfil.html
 * ATENÇÃO: Preservar EXATAMENTE toda funcionalidade atual
 */

import { StorageModule } from '../modules/storage.js';

class PerfilPage {
    constructor() {
        this.storage = new StorageModule();
        this.feedback = null;
        
        console.log('🏗️ Página Perfil inicializada');
        this.init();
    }

    async init() {
        try {
            // Aguardar app global estar pronto
            await this.waitForApp();
            
            // Obter módulos do app global
            this.feedback = window.app?.getModule('feedback');
            
            // Expor funções globalmente para compatibilidade
            this.exposeFunctionsGlobally();
            
            console.log('✅ Página Perfil carregada com módulos');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar página Perfil:', error);
        }
    }

    /**
     * Aguardar aplicação principal estar pronta
     */
    async waitForApp() {
        let attempts = 0;
        while (!window.app?.isInitialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.app?.isInitialized) {
            console.warn('⚠️ App global não inicializou, usando fallback');
        }
    }

    /**
     * Carregar dados do perfil do localStorage
     */
    loadProfileData() {
        try {
            const user = this.storage.get('user', {});
            
            // Preencher campos do formulário
            const fields = {
                'name': user.name || '',
                'email': user.email || '',
                'phone': user.phone || '',
                'company': user.company || '',
                'address': user.address || '',
                'cnpj': user.cnpj || ''
            };

            Object.entries(fields).forEach(([fieldId, value]) => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.value = value;
                }
            });

            console.log('✅ Dados do perfil carregados');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do perfil:', error);
            this.showFeedback('Erro ao carregar dados do perfil', 'error');
        }
    }

    /**
     * Salvar dados do perfil no localStorage
     */
    saveProfile() {
        try {
            // Obter dados do formulário
            const formData = {
                name: document.getElementById('name')?.value?.trim() || '',
                email: document.getElementById('email')?.value?.trim() || '',
                phone: document.getElementById('phone')?.value?.trim() || '',
                company: document.getElementById('company')?.value?.trim() || '',
                address: document.getElementById('address')?.value?.trim() || '',
                cnpj: document.getElementById('cnpj')?.value?.trim() || ''
            };

            // Validar dados básicos
            if (!formData.name) {
                this.showFeedback('Nome é obrigatório', 'error');
                return;
            }

            if (!formData.email) {
                this.showFeedback('Email é obrigatório', 'error');
                return;
            }

            // Validar formato do email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                this.showFeedback('Email em formato inválido', 'error');
                return;
            }

            // Salvar no storage
            const currentUser = this.storage.get('user', {});
            const updatedUser = { ...currentUser, ...formData };
            
            this.storage.set('user', updatedUser);
            
            // Atualizar informações em outros locais se necessário
            this.updateUserDisplay(updatedUser);
            
            this.showFeedback('Perfil atualizado com sucesso!', 'success');
            
            console.log('✅ Perfil salvo com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao salvar perfil:', error);
            this.showFeedback('Erro ao salvar perfil', 'error');
        }
    }

    /**
     * Atualizar display do usuário em outros elementos
     */
    updateUserDisplay(user) {
        // Atualizar nome do usuário se existir elemento userName
        const userNameElements = document.querySelectorAll('#userName, .user-name');
        userNameElements.forEach(element => {
            if (element && user.name) {
                element.textContent = user.name;
            }
        });
    }

    /**
     * Fazer upload do logo da empresa
     */
    uploadLogo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                this.showFeedback('Selecione apenas arquivos de imagem', 'error');
                return;
            }

            // Validar tamanho (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showFeedback('Imagem muito grande. Máximo 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const logoData = e.target.result;
                    
                    // Salvar no localStorage
                    this.storage.set('companyLogo', logoData);
                    
                    // Atualizar preview se existir
                    const logoPreview = document.getElementById('logoPreview');
                    if (logoPreview) {
                        logoPreview.src = logoData;
                        logoPreview.style.display = 'block';
                    }
                    
                    this.showFeedback('Logo carregado com sucesso!', 'success');
                    
                } catch (error) {
                    console.error('❌ Erro ao processar logo:', error);
                    this.showFeedback('Erro ao processar imagem', 'error');
                }
            };

            reader.onerror = () => {
                this.showFeedback('Erro ao ler arquivo', 'error');
            };

            reader.readAsDataURL(file);
        };

        input.click();
    }

    /**
     * Remover logo da empresa
     */
    removeLogo() {
        if (confirm('Deseja remover o logo da empresa?')) {
            try {
                this.storage.remove('companyLogo');
                
                // Limpar preview se existir
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.src = '';
                    logoPreview.style.display = 'none';
                }
                
                this.showFeedback('Logo removido com sucesso!', 'success');
                
            } catch (error) {
                console.error('❌ Erro ao remover logo:', error);
                this.showFeedback('Erro ao remover logo', 'error');
            }
        }
    }

    /**
     * Carregar preview do logo se existir
     */
    loadLogoPreview() {
        try {
            const logoData = this.storage.get('companyLogo');
            if (logoData) {
                const logoPreview = document.getElementById('logoPreview');
                if (logoPreview) {
                    logoPreview.src = logoData;
                    logoPreview.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar preview do logo:', error);
        }
    }

    /**
     * Exportar dados do perfil
     */
    exportProfileData() {
        try {
            const user = this.storage.get('user', {});
            const dataStr = JSON.stringify(user, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `perfil_${user.name || 'usuario'}_${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showFeedback('Dados exportados com sucesso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            this.showFeedback('Erro ao exportar dados', 'error');
        }
    }

    /**
     * Importar dados do perfil
     */
    importProfileData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validar estrutura básica
                    if (typeof importedData !== 'object') {
                        throw new Error('Formato de arquivo inválido');
                    }
                    
                    // Confirmar importação
                    if (confirm('Deseja importar estes dados? Os dados atuais serão substituídos.')) {
                        this.storage.set('user', importedData);
                        this.loadProfileData();
                        this.showFeedback('Dados importados com sucesso!', 'success');
                    }
                    
                } catch (error) {
                    console.error('❌ Erro ao importar dados:', error);
                    this.showFeedback('Erro ao importar dados: ' + error.message, 'error');
                }
            };

            reader.onerror = () => {
                this.showFeedback('Erro ao ler arquivo', 'error');
            };

            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * Expor funções globalmente para compatibilidade
     */
    exposeFunctionsGlobally() {
        window.loadProfileData = () => this.loadProfileData();
        window.saveProfile = () => this.saveProfile();
        window.uploadLogo = () => this.uploadLogo();
        window.removeLogo = () => this.removeLogo();
        window.exportProfileData = () => this.exportProfileData();
        window.importProfileData = () => this.importProfileData();
        
        console.log('🔗 Funções perfil.html expostas globalmente para compatibilidade');
    }

    /**
     * Mostrar feedback usando módulo feedback ou fallback
     */
    showFeedback(message, type) {
        if (this.feedback) {
            this.feedback.show(message, type);
        } else if (window.showFeedback) {
            window.showFeedback(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Inicializar página quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.perfilPage = new PerfilPage();
});

// Exportar para uso em outros módulos se necessário
export { PerfilPage }; 