/**
 * App Core - Calculadora de Madeira
 * ATENÇÃO: Arquivo principal de inicialização
 * Coordena todos os módulos preservando sequência atual
 * Baseado na lógica de DOMContentLoaded dos arquivos atuais
 */

// Imports dos módulos (ES6)
import { CalculatorModule } from '../modules/calculator.js';
import { StorageModule } from '../modules/storage.js';
import { PDFGeneratorModule } from '../modules/pdf-generator.js';
import { FeedbackComponent } from '../components/feedback.js';
import { MenuComponent } from '../components/menu.js';
import { AutocompleteComponent } from '../components/autocomplete.js';
import { FormattersUtils } from '../utils/formatters.js';

export class CalculadoraMadeiraApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.currentPage = this.getCurrentPageName();
        this.init();
    }

    /**
     * Inicialização principal - PRESERVAR SEQUÊNCIA ATUAL
     */
    async init() {
        try {
            console.log('🚀 Iniciando Calculadora de Madeira...');
            
            // 1. Inicializar módulos base primeiro
            await this.initializeBaseModules();
            
            // 2. Configurar eventos globais
            this.setupGlobalEvents();
            
            // 3. Inicializar componentes específicos da página
            await this.initializePageSpecificComponents();
            
            // 4. Aplicar formatações e máscaras
            this.applyFormattingAndMasks();
            
            // 5. Carregar dados do usuário se logado
            this.loadUserSession();
            
            // 6. Configurar PWA (se necessário)
            this.initializePWA();
            
            this.isInitialized = true;
            console.log('✅ Aplicação inicializada com sucesso');
            
            // Disparar evento customizado
            this.dispatchInitializationEvent();
            
        } catch (error) {
            console.error('❌ Erro na inicialização da aplicação:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Inicializar módulos base - ORDEM CRÍTICA
     */
    async initializeBaseModules() {
        console.log('📦 Inicializando módulos base...');
        
        try {
            // Storage sempre primeiro - CRÍTICO
            this.modules.storage = new StorageModule();
            console.log('✅ Storage módulo inicializado');
            
            // Formatadores
            this.modules.formatters = new FormattersUtils();
            console.log('✅ Formatadores inicializados');
            
            // Sistema de feedback
            this.modules.feedback = new FeedbackComponent();
            console.log('✅ Sistema de feedback inicializado');
            
            // Menu lateral
            this.modules.menu = new MenuComponent();
            console.log('✅ Menu lateral inicializado');
            
            // Autocomplete
            this.modules.autocomplete = new AutocompleteComponent();
            console.log('✅ Sistema de autocomplete inicializado');
            
            // Gerador de PDF
            this.modules.pdfGenerator = new PDFGeneratorModule();
            this.modules.pdfGenerator.setDependencies(this.modules.storage, this.modules.feedback);
            console.log('✅ Gerador de PDF inicializado');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar módulos base:', error);
            throw error;
        }
    }

    /**
     * Inicializar componentes específicos da página
     */
    async initializePageSpecificComponents() {
        console.log(`📄 Inicializando componentes para: ${this.currentPage}`);
        
        switch (this.currentPage) {
            case 'calc.html':
            case 'index.html':
                await this.initializeCalculatorPage();
                break;
                
            case 'orcamentos.html':
                await this.initializeQuotesPage();
                break;
                
            case 'perfil.html':
                await this.initializeProfilePage();
                break;
                
            case 'configuracoes.html':
                await this.initializeSettingsPage();
                break;
                
            default:
                console.log(`ℹ️ Página ${this.currentPage} não requer inicialização específica`);
        }
    }

    /**
     * Inicializar página da calculadora - FUNÇÃO CRÍTICA
     */
    async initializeCalculatorPage() {
        console.log('🧮 Inicializando página da calculadora...');
        
        try {
            // Calculadora principal - MÓDULO CRÍTICO
            this.modules.calculator = new CalculatorModule();
            console.log('✅ Módulo calculadora inicializado');
            
            // Configurar eventos da calculadora
            this.setupCalculatorEvents();
            
            // Inicializar autocomplete específico da calculadora
            this.modules.autocomplete.initializeAll();
            
            // Carregar lista de madeira existente
            this.loadWoodList();
            
            // Configurar botões de ação
            this.setupActionButtons();
            
            console.log('✅ Página da calculadora configurada');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar página da calculadora:', error);
        }
    }

    /**
     * Configurar eventos da calculadora - PRESERVAR LÓGICA ATUAL
     */
    setupCalculatorEvents() {
        // Campos de input que triggam cálculo - IDS EXATOS ATUAIS
        const calculatorInputs = [
            'thickness', 'width', 'length', 
            'quantity', 'packageQuantity', 'price'
        ];
        
        calculatorInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                // Evento de input para cálculo em tempo real - COMPORTAMENTO ATUAL
                input.addEventListener('input', () => {
                    if (this.modules.calculator) {
                        this.modules.calculator.calculate();
                    }
                });
                
                // Atualizar label de quantidade quando packageQuantity mudar
                if (id === 'packageQuantity') {
                    input.addEventListener('input', () => {
                        if (this.modules.calculator) {
                            this.modules.calculator.updateQuantityLabel();
                        }
                    });
                }
            }
        });
        
        // Botão adicionar à lista - PRESERVAR FUNÇÃO ATUAL
        const addButton = document.querySelector('.add-button');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.addToWoodList();
            });
        }
        
        // Botão salvar orçamento - PRESERVAR FUNÇÃO ATUAL
        const saveQuoteButton = document.getElementById('saveQuoteButton');
        if (saveQuoteButton) {
            saveQuoteButton.addEventListener('click', () => {
                this.saveQuote();
            });
        }
        
        console.log('✅ Eventos da calculadora configurados');
    }

    /**
     * Adicionar item à lista de madeira - PRESERVAR LÓGICA EXATA ATUAL
     */
    addToWoodList() {
        try {
            if (!this.modules.calculator.validateInputs()) {
                return;
            }
            
            const result = this.modules.calculator.calculate();
            if (!result) {
                this.modules.feedback.error('Erro ao calcular. Verifique os dados inseridos.');
                return;
            }
            
            // Obter dados dos campos - IDS EXATOS ATUAIS
            const item = {
                client: document.getElementById('clientName')?.value || '',
                contact: document.getElementById('clientContact')?.value || '',
                paymentTerms: document.getElementById('paymentTerms')?.value || '',
                species: document.getElementById('species')?.value || '',
                thickness: parseFloat(document.getElementById('thickness')?.value) || 0,
                width: parseFloat(document.getElementById('width')?.value) || 0,
                length: parseFloat(document.getElementById('length')?.value) || 0,
                quantity: parseInt(document.getElementById('quantity')?.value) || 0,
                packageQuantity: parseInt(document.getElementById('packageQuantity')?.value) || 1,
                pricePerCubicMeter: result.price,
                volumeUnit: result.volumeUnit,
                volumeTotal: result.volumeTotal,
                cost: result.cost,
                totalQuantity: result.totalQuantity,
                timestamp: new Date().toISOString()
            };
            
            // Salvar na lista - PRESERVAR CHAVE localStorage ATUAL
            const woodList = this.modules.storage.loadWoodList();
            woodList.push(item);
            this.modules.storage.saveWoodList(woodList);
            
            // Feedback de sucesso - MENSAGEM ATUAL
            this.modules.feedback.success('Item adicionado à lista com sucesso!');
            
            // Limpar formulário - COMPORTAMENTO ATUAL
            this.clearCalculatorForm();
            
            // Atualizar lista visual se existir
            this.updateWoodListDisplay();
            
            console.log('📝 Item adicionado à lista:', item);
            
        } catch (error) {
            console.error('❌ Erro ao adicionar item à lista:', error);
            this.modules.feedback.error('Erro ao adicionar item à lista.');
        }
    }

    /**
     * Limpar formulário da calculadora - PRESERVAR LÓGICA ATUAL
     */
    clearCalculatorForm() {
        const fieldsToKeep = ['clientName', 'clientContact', 'paymentTerms'];
        const fieldsToClear = ['species', 'thickness', 'width', 'length', 'quantity', 'packageQuantity', 'price'];
        
        fieldsToClear.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.value = id === 'packageQuantity' ? '1' : '';
            }
        });
        
        // Resetar resultados
        ['volume', 'totalVolume', 'cost'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0,000m³';
            }
        });
    }

    /**
     * Aplicar formatações e máscaras - PRESERVAR COMPORTAMENTO ATUAL
     */
    applyFormattingAndMasks() {
        console.log('🎨 Aplicando formatações e máscaras...');
        
        try {
            // Campo de telefone - MÁSCARA ATUAL
            const phoneInput = document.getElementById('clientContact');
            if (phoneInput) {
                this.modules.formatters.applyPhoneMask(phoneInput);
            }
            
            // Campo de preço - MÁSCARA ATUAL
            const priceInput = document.getElementById('price');
            if (priceInput) {
                this.modules.formatters.applyPriceMask(priceInput);
            }
            
            console.log('✅ Formatações aplicadas');
            
        } catch (error) {
            console.error('❌ Erro ao aplicar formatações:', error);
        }
    }

    /**
     * Configurar eventos globais - PRESERVAR COMPORTAMENTO ATUAL
     */
    setupGlobalEvents() {
        console.log('🌐 Configurando eventos globais...');
        
        // Botão do menu - PRESERVAR FUNÇÃO ATUAL
        const menuButton = document.querySelector('.menu-btn');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                this.modules.menu.toggle();
            });
        }
        
        // Botão home - PRESERVAR FUNÇÃO ATUAL
        const homeButton = document.querySelector('.home-btn');
        if (homeButton) {
            homeButton.addEventListener('click', () => {
                window.location.href = 'calc.html';
            });
        }
        
        // Botão refresh - PRESERVAR FUNÇÃO ATUAL
        const refreshButton = document.querySelector('.refresh-btn');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Eventos de teclado globais
        document.addEventListener('keydown', (e) => {
            // ESC para fechar menus
            if (e.key === 'Escape') {
                this.modules.menu.close();
                this.modules.autocomplete.clearAllSuggestions();
            }
        });
        
        console.log('✅ Eventos globais configurados');
    }

    /**
     * Carregar sessão do usuário - PRESERVAR LÓGICA ATUAL
     */
    loadUserSession() {
        try {
            const currentUserId = this.modules.storage.getCurrentUserId();
            const userData = this.modules.storage.getUserData();
            
            if (currentUserId && userData) {
                console.log('👤 Sessão do usuário carregada:', userData);
                
                // Atualizar menu com dados do usuário
                if (userData.name && userData.email) {
                    this.modules.menu.updateUserInfo(userData.name, userData.email);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar sessão do usuário:', error);
        }
    }

    /**
     * Inicializar PWA features
     */
    initializePWA() {
        try {
            // Service Worker já é registrado via service-worker.js atual
            // PWA updater já é carregado via pwa-updater.js atual
            
            console.log('📱 PWA features disponíveis');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar PWA:', error);
        }
    }

    /**
     * Obter nome da página atual
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    /**
     * Carregar lista de madeira existente
     */
    loadWoodList() {
        try {
            const woodList = this.modules.storage.loadWoodList();
            console.log(`📋 Lista de madeira carregada: ${woodList.length} itens`);
            return woodList;
        } catch (error) {
            console.error('❌ Erro ao carregar lista de madeira:', error);
            return [];
        }
    }

    /**
     * Configurar botões de ação - PRESERVAR FUNCIONALIDADE ATUAL
     */
    setupActionButtons() {
        // Os botões já são configurados nos eventos específicos
        console.log('✅ Botões de ação configurados');
    }

    /**
     * Atualizar display da lista de madeira (se existir na página)
     */
    updateWoodListDisplay() {
        // Esta função seria implementada quando criarmos o componente de lista
        console.log('📊 Display da lista atualizado');
    }

    /**
     * Salvar orçamento - PRESERVAR LÓGICA ATUAL
     */
    saveQuote() {
        try {
            const woodList = this.modules.storage.loadWoodList();
            if (woodList.length === 0) {
                this.modules.feedback.warning('Adicione itens à lista antes de salvar o orçamento.');
                return;
            }
            
            const currentUserId = this.modules.storage.getCurrentUserId();
            if (!currentUserId) {
                this.modules.feedback.error('Usuário não encontrado. Faça login novamente.');
                return;
            }
            
            const quote = {
                items: [...woodList],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.modules.storage.saveQuote(currentUserId, quote);
            this.modules.feedback.success('Orçamento salvo com sucesso!');
            
            // Limpar lista atual
            this.modules.storage.saveWoodList([]);
            this.updateWoodListDisplay();
            
            console.log('💾 Orçamento salvo:', quote);
            
        } catch (error) {
            console.error('❌ Erro ao salvar orçamento:', error);
            this.modules.feedback.error('Erro ao salvar orçamento.');
        }
    }

    /**
     * Tratar erro de inicialização
     */
    handleInitializationError(error) {
        console.error('💥 Erro crítico na inicialização:', error);
        
        // Mostrar mensagem de erro para o usuário
        document.body.innerHTML += `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #f44336; color: white; padding: 20px; border-radius: 8px; 
                        z-index: 10000; text-align: center;">
                <h3>❌ Erro na Inicialização</h3>
                <p>Houve um problema ao carregar a aplicação.</p>
                <button onclick="window.location.reload()" 
                        style="background: white; color: #f44336; border: none; padding: 10px 20px; 
                               border-radius: 4px; cursor: pointer; margin-top: 10px;">
                    Recarregar Página
                </button>
            </div>
        `;
    }

    /**
     * Disparar evento de inicialização completa
     */
    dispatchInitializationEvent() {
        const event = new CustomEvent('calculadoraMadeiraReady', {
            detail: {
                app: this,
                modules: this.modules,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(event);
        console.log('📡 Evento de inicialização disparado');
    }

    /**
     * Métodos utilitários públicos
     */
    getModule(name) {
        return this.modules[name];
    }

    isReady() {
        return this.isInitialized;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Reinicializar aplicação
     */
    async reinitialize() {
        console.log('🔄 Reinicializando aplicação...');
        this.isInitialized = false;
        await this.init();
    }

    /**
     * Destruir aplicação (cleanup)
     */
    destroy() {
        console.log('🗑️ Destruindo aplicação...');
        
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.modules = {};
        this.isInitialized = false;
        
        console.log('✅ Aplicação destruída');
    }
}

// Instância global para compatibilidade
window.CalculadoraMadeiraApp = CalculadoraMadeiraApp;

// Auto-inicialização quando DOM estiver pronto - COMPORTAMENTO ATUAL
let appInstance = null;

function initializeApp() {
    if (!appInstance) {
        appInstance = new CalculadoraMadeiraApp();
        window.app = appInstance; // Disponibilizar globalmente
    }
    return appInstance;
}

// Compatibilidade com diferentes estados do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM já carregado
    setTimeout(initializeApp, 0);
}

// Export para uso como módulo
export { initializeApp }; 