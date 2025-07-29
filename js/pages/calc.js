/**
 * Página Calc - Calculadora de Madeira
 * Seguindo o padrão modular do REFACTORING_PLAN.md
 * Substitui JavaScript inline em calc.html (~2500 linhas)
 * ATENÇÃO: Preservar EXATAMENTE toda funcionalidade atual
 */

import { CalculatorModule } from '../modules/calculator.js';
import { StorageModule } from '../modules/storage.js';
import { PDFGeneratorModule } from '../modules/pdf-generator.js';

class CalcPage {
    constructor() {
        this.calculator = new CalculatorModule();
        this.storage = new StorageModule();
        this.pdfGenerator = new PDFGeneratorModule();
        this.feedback = null;
        this.menu = null;
        this.autocomplete = null;
        this.formatters = null;
        
        // Estado da página
        this.isEditMode = false;
        this.editingItemIndex = -1;
        this.editingQuoteId = null;
        
        console.log('🏗️ Página Calc inicializada');
        this.init();
    }

    async init() {
        try {
            // Aguardar app global estar pronto
            await this.waitForApp();
            
            // Obter módulos do app global
            this.feedback = window.app?.getModule('feedback');
            this.menu = window.app?.getModule('menu');
            this.autocomplete = window.app?.getModule('autocomplete');
            this.formatters = window.app?.getModule('formatters');
            
            // Configurar dependências
            if (this.feedback) {
                this.pdfGenerator.setDependencies(this.storage, this.feedback);
            }
            
            // Expor funções globalmente para compatibilidade
            this.exposeFunctionsGlobally();
            
            console.log('✅ Página Calc carregada com módulos');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar página Calc:', error);
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
     * Configuração de formatação de telefone (do código original)
     */
    setupPhoneFormatting() {
        try {
            console.log("Configurando formatação de telefone...");
            const contactInput = document.getElementById('clientContact');
            if (!contactInput) {
                console.warn("Campo clientContact não encontrado");
                return;
            }
            
            contactInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                let formattedValue = '';
                
                if (value.length > 0) {
                    formattedValue += '(' + value.substring(0, Math.min(2, value.length));
                }
                
                if (value.length > 2) {
                    formattedValue += ') ';
                    
                    // Verificar se é celular (tem 9 na frente)
                    if (value.length > 2 && value.charAt(2) === '9') {
                        formattedValue += value.charAt(2) + ' ';
                        
                        if (value.length > 3) {
                            formattedValue += value.substring(3, Math.min(7, value.length));
                        }
                        
                        if (value.length > 7) {
                            formattedValue += '-' + value.substring(7, Math.min(11, value.length));
                        }
                    } else {
                        // Telefone fixo
                        formattedValue += value.substring(2, Math.min(6, value.length));
                        
                        if (value.length > 6) {
                            formattedValue += '-' + value.substring(6, Math.min(10, value.length));
                        }
                    }
                }
                
                e.target.value = formattedValue;
            });
            console.log("✅ Formatação de telefone configurada");
        } catch (error) {
            console.error("❌ Erro ao configurar formatação de telefone:", error);
        }
    }

    /**
     * Configurar entrada de moeda (preservar funcionalidade original)
     */
    initializeCurrencyInput() {
        const priceInput = document.getElementById('price');
        if (!priceInput) {
            console.warn("Campo de preço não encontrado");
            return;
        }

        priceInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d,]/g, '');
            
            if (value) {
                let numericValue = parseFloat(value.replace(',', '.'));
                if (!isNaN(numericValue)) {
                    e.target.value = 'R$ ' + numericValue.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            } else {
                e.target.value = 'R$ 0,00';
            }
            
            this.calculate();
        });

        priceInput.addEventListener('focus', (e) => {
            if (e.target.value === 'R$ 0,00') {
                e.target.value = '';
            }
        });

        priceInput.addEventListener('blur', (e) => {
            if (e.target.value === '' || e.target.value === 'R$ ') {
                e.target.value = 'R$ 0,00';
            }
        });
    }

    /**
     * Carregar informações do usuário (preservar funcionalidade original)
     */
    loadUserInfo() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userNameElement = document.getElementById('userName');
            
            if (userNameElement && user.name) {
                userNameElement.textContent = user.name;
            }
        } catch (error) {
            console.error('Erro ao carregar informações do usuário:', error);
        }
    }

    /**
     * Configurar eventos da página (preservar todos os eventos originais)
     */
    setupEvents() {
        // Eventos de cálculo em tempo real
        const calculationInputs = ['thickness', 'width', 'length', 'quantity', 'packageQuantity'];
        calculationInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.calculate());
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.focusNextField(inputId);
                    }
                });
            }
        });

        // Configurar navegação com Enter
        this.setupEnterNavigation();
    }

    /**
     * Configurar navegação com Enter entre campos
     */
    setupEnterNavigation() {
        const fieldOrder = [
            'clientName', 'clientContact', 'paymentTerms', 'species',
            'thickness', 'width', 'length', 'quantity', 'packageQuantity', 'price'
        ];

        fieldOrder.forEach((fieldId, index) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const nextIndex = (index + 1) % fieldOrder.length;
                        const nextField = document.getElementById(fieldOrder[nextIndex]);
                        if (nextField) {
                            nextField.focus();
                        }
                    }
                });
            }
        });
    }

    /**
     * Focar no próximo campo
     */
    focusNextField(currentFieldId) {
        const fieldOrder = ['thickness', 'width', 'length', 'quantity', 'packageQuantity', 'price'];
        const currentIndex = fieldOrder.indexOf(currentFieldId);
        
        if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
            const nextField = document.getElementById(fieldOrder[currentIndex + 1]);
            if (nextField) {
                nextField.focus();
            }
        }
    }

    /**
     * Função de cálculo principal (usar módulo calculator)
     */
    calculate() {
        try {
            const result = this.calculator.calculate();
            
            if (result) {
                this.updateResultsDisplay(result);
            } else {
                this.clearResults();
            }
        } catch (error) {
            console.log('Dados insuficientes para cálculo:', error.message);
            this.clearResults();
        }
    }

    /**
     * Atualizar display dos resultados
     */
    updateResultsDisplay(result) {
        // Atualizar campos de resultado
        const volumeElement = document.getElementById('volume');
        const totalVolumeElement = document.getElementById('totalVolume');
        const costElement = document.getElementById('cost');

        if (volumeElement) {
            volumeElement.textContent = result.formattedVolume;
        }
        if (totalVolumeElement) {
            totalVolumeElement.textContent = result.formattedTotalVolume;
        }
        if (costElement) {
            costElement.textContent = result.formattedCost;
        }
    }

    /**
     * Limpar resultados
     */
    clearResults() {
        const volumeElement = document.getElementById('volume');
        const totalVolumeElement = document.getElementById('totalVolume');
        const costElement = document.getElementById('cost');

        if (volumeElement) volumeElement.textContent = '0,000m³';
        if (totalVolumeElement) totalVolumeElement.textContent = '0,000m³';
        if (costElement) costElement.textContent = 'R$ 0,00';
    }

    /**
     * Inicializar autocomplete (usar módulo autocomplete)
     */
    initializeAutocomplete() {
        if (this.autocomplete) {
            this.autocomplete.setupClientAutocomplete();
            this.autocomplete.setupSpeciesAutocomplete();
        } else {
            console.warn('Módulo de autocomplete não disponível');
        }
    }

    /**
     * Carregar lista de itens
     */
    loadList() {
        try {
            const woodList = this.storage.get('woodList', []);
            this.renderItemsList(woodList);
            this.calculateTotal();
        } catch (error) {
            console.error('Erro ao carregar lista:', error);
        }
    }

    /**
     * Renderizar lista de itens
     */
    renderItemsList(items) {
        const itemsList = document.getElementById('itemsList');
        if (!itemsList) return;

        if (items.length === 0) {
            itemsList.innerHTML = '<p>Nenhum item adicionado</p>';
            return;
        }

        itemsList.innerHTML = items.map((item, index) => `
            <div class="item" data-index="${index}">
                <div>${item.size || 'N/A'}</div>
                <div>${item.quantity || '0'}</div>
                <div>${item.volume || '0,000m³'}</div>
                <div>${item.price || 'R$ 0,00'}</div>
                <div>
                    <button class="edit-btn" onclick="calcPage.editItem(${index})" title="Editar item">✏️</button>
                    <button class="delete-btn" onclick="calcPage.deleteItem(${index})" title="Excluir item">×</button>
                </div>
                ${item.species ? `<div class="species-tag">${item.species}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Calcular total dos itens
     */
    calculateTotal() {
        try {
            const woodList = this.storage.get('woodList', []);
            let totalVolume = 0;
            let totalCost = 0;

            woodList.forEach(item => {
                if (item.volume) {
                    const volume = parseFloat(item.volume.toString().replace(/[^\d,]/g, '').replace(',', '.'));
                    if (!isNaN(volume)) totalVolume += volume;
                }
                if (item.price) {
                    const cost = parseFloat(item.price.toString().replace(/[^\d,]/g, '').replace(',', '.'));
                    if (!isNaN(cost)) totalCost += cost;
                }
            });

            // Atualizar display dos totais
            const totalVolumeElement = document.getElementById('totalVolumeList');
            const totalCostElement = document.getElementById('totalCostList');

            if (totalVolumeElement) {
                totalVolumeElement.textContent = totalVolume.toFixed(3).replace('.', ',') + 'm³';
            }
            if (totalCostElement) {
                totalCostElement.textContent = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(totalCost);
            }
        } catch (error) {
            console.error('Erro ao calcular total:', error);
        }
    }

    /**
     * Adicionar item à lista
     */
    addItemToList() {
        try {
            const result = this.calculator.calculate();
            if (!result) {
                this.showFeedback('Preencha todos os campos antes de adicionar', 'error');
                return;
            }

            const formData = this.getFormData();
            const item = {
                ...formData,
                ...result,
                id: `item_${Date.now()}`,
                createdAt: new Date().toISOString()
            };

            const woodList = this.storage.get('woodList', []);
            
            if (this.isEditMode) {
                woodList[this.editingItemIndex] = item;
                this.exitEditMode();
                this.showFeedback('Item atualizado com sucesso!', 'success');
            } else {
                woodList.push(item);
                this.showFeedback('Item adicionado com sucesso!', 'success');
            }

            this.storage.set('woodList', woodList);
            this.loadList();
            this.clearForm();
            
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            this.showFeedback('Erro ao adicionar item', 'error');
        }
    }

    /**
     * Obter dados do formulário
     */
    getFormData() {
        return {
            clientName: document.getElementById('clientName')?.value || '',
            clientContact: document.getElementById('clientContact')?.value || '',
            paymentTerms: document.getElementById('paymentTerms')?.value || '',
            species: document.getElementById('species')?.value || '',
            thickness: parseFloat(document.getElementById('thickness')?.value) || 0,
            width: parseFloat(document.getElementById('width')?.value) || 0,
            length: parseFloat(document.getElementById('length')?.value) || 0,
            quantity: parseInt(document.getElementById('quantity')?.value) || 0,
            packageQuantity: parseInt(document.getElementById('packageQuantity')?.value) || 1,
            price: document.getElementById('price')?.value || 'R$ 0,00'
        };
    }

    /**
     * Limpar formulário
     */
    clearForm() {
        const fields = ['thickness', 'width', 'length'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });

        const quantityField = document.getElementById('quantity');
        if (quantityField) quantityField.value = '1';

        const priceField = document.getElementById('price');
        if (priceField) priceField.value = 'R$ 0,00';

        this.clearResults();
        
        // Focar no primeiro campo
        const thicknessField = document.getElementById('thickness');
        if (thicknessField) thicknessField.focus();
    }

    /**
     * Editar item
     */
    editItem(index) {
        const woodList = this.storage.get('woodList', []);
        const item = woodList[index];
        if (!item) return;

        // Preencher formulário
        const fieldMappings = {
            'clientName': item.clientName,
            'clientContact': item.clientContact,
            'paymentTerms': item.paymentTerms,
            'species': item.species,
            'thickness': item.thickness,
            'width': item.width,
            'length': item.length,
            'quantity': item.quantity,
            'packageQuantity': item.packageQuantity,
            'price': item.price
        };

        Object.entries(fieldMappings).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value !== undefined) {
                field.value = value;
            }
        });

        // Entrar em modo de edição
        this.isEditMode = true;
        this.editingItemIndex = index;
        
        this.calculate();
        this.showFeedback('Item carregado para edição', 'info');
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Excluir item
     */
    deleteItem(index) {
        if (confirm('Remover este item da lista?')) {
            const woodList = this.storage.get('woodList', []);
            woodList.splice(index, 1);
            this.storage.set('woodList', woodList);
            this.loadList();
            this.showFeedback('Item removido da lista', 'success');
        }
    }

    /**
     * Sair do modo de edição
     */
    exitEditMode() {
        this.isEditMode = false;
        this.editingItemIndex = -1;
    }

    /**
     * Atualizar botão de adicionar
     */
    updateAddButton() {
        const addButton = document.getElementById('addButton');
        if (addButton) {
            addButton.textContent = this.isEditMode ? 'Atualizar Item' : 'Adicionar à Lista';
            
            // Remover eventos anteriores e adicionar novo
            const newButton = addButton.cloneNode(true);
            addButton.parentNode.replaceChild(newButton, addButton);
            
            newButton.addEventListener('click', () => this.addItemToList());
        }
    }

    /**
     * Gerar relatório (usar módulo PDF)
     */
    generateReport() {
        try {
            const woodList = this.storage.get('woodList', []);
            if (woodList.length === 0) {
                this.showFeedback('Adicione itens à lista antes de gerar o relatório', 'error');
                return;
            }

            // Usar módulo PDF Generator (adaptar para calc.html)
            this.pdfGenerator.generateReportFromList(woodList, this.getFormData());
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            this.showFeedback('Erro ao gerar relatório', 'error');
        }
    }

    /**
     * Expor funções globalmente para compatibilidade com código inline existente
     */
    exposeFunctionsGlobally() {
        // Expor funções principais
        window.addItemToList = () => this.addItemToList();
        window.calculate = () => this.calculate();
        window.generateReport = () => this.generateReport();
        window.editItem = (index) => this.editItem(index);
        window.deleteItem = (index) => this.deleteItem(index);
        window.clearForm = () => this.clearForm();
        window.loadList = () => this.loadList();
        window.updateAddButton = () => this.updateAddButton();
        
        console.log('🔗 Funções calc.html expostas globalmente para compatibilidade');
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
    window.calcPage = new CalcPage();
});

// Exportar para uso em outros módulos se necessário
export { CalcPage }; 