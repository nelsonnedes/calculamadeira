/**
 * Página Orçamentos - Calculadora de Madeira
 * Seguindo o padrão modular do REFACTORING_PLAN.md
 * Substitui JavaScript inline em orcamentos.html
 */

import { PDFGeneratorModule } from '../modules/pdf-generator.js';

class OrcamentosPage {
    constructor() {
        this.pdfGenerator = new PDFGeneratorModule();
        this.storage = null;
        this.feedback = null;
        this.isInitialized = false;
        
        console.log('🏗️ Página Orçamentos inicializada');
        this.init();
    }

    async init() {
        try {
            // Aguardar app global estar pronto
            await this.waitForApp();
            
            // Obter módulos do app global
            this.storage = window.app?.getModule('storage');
            this.feedback = window.app?.getModule('feedback');
            
            // Configurar dependências do gerador PDF
            if (this.storage && this.feedback) {
                this.pdfGenerator.setDependencies(this.storage, this.feedback);
            }
            
            // Configurar eventos da página
            this.setupEvents();
            
            // Disponibilizar funções globalmente para compatibilidade
            this.exposeFunctionsGlobally();
            
            this.isInitialized = true;
            console.log('✅ Página Orçamentos carregada com módulos');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar página Orçamentos:', error);
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
     * Configurar eventos da página
     */
    setupEvents() {
        // Configurar eventos que não dependem de elementos dinâmicos
        document.addEventListener('click', (event) => {
            // Delegar eventos para botões PDF gerados dinamicamente
            if (event.target.closest('[onclick*="generatePDFWithUnitPrice"]')) {
                event.preventDefault();
                const button = event.target.closest('button');
                const match = button.getAttribute('onclick')?.match(/generatePDFWithUnitPrice\('([^']+)'\)/);
                if (match) {
                    this.generatePDFWithUnitPrice(match[1]);
                }
            }
            
            if (event.target.closest('[onclick*="generateSimplePDF"]')) {
                event.preventDefault();
                const button = event.target.closest('button');
                const match = button.getAttribute('onclick')?.match(/generateSimplePDF\('([^']+)'\)/);
                if (match) {
                    this.generateSimplePDF(match[1]);
                }
            }
        });
    }

    /**
     * Gerar PDF com preços unitários
     */
    generatePDFWithUnitPrice(id) {
        this.pdfGenerator.generatePDFWithUnitPrice(id);
    }

    /**
     * Gerar PDF simples
     */
    generateSimplePDF(id) {
        this.pdfGenerator.generateSimplePDF(id);
    }

    /**
     * Expor funções globalmente para compatibilidade com código inline existente
     * TEMPORÁRIO: Para transição gradual
     */
    exposeFunctionsGlobally() {
        // Expor funções PDF globalmente para compatibilidade
        window.generatePDFWithUnitPrice = (id) => this.generatePDFWithUnitPrice(id);
        window.generateSimplePDF = (id) => this.generateSimplePDF(id);
        
        console.log('🔗 Funções PDF expostas globalmente para compatibilidade');
    }

    /**
     * Métodos auxiliares para compatibilidade
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
    window.orcamentosPage = new OrcamentosPage();
});

// Exportar para uso em outros módulos se necessário
export { OrcamentosPage }; 