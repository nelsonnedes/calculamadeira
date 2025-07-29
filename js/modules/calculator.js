/**
 * Calculator Module - Calculadora de Madeira
 * ATENÇÃO: Preservar EXATAMENTE a lógica de cálculo atual
 * Baseado no calc.html (linhas ~1200-1800) e ELEMENTOS_PRESERVAR.md
 */

export class CalculatorModule {
    constructor() {
        this.initializeFormatters();
        this.cache = new Map();
    }

    /**
     * Inicializar formatadores - PRESERVAR FORMATAÇÃO EXATA ATUAL
     */
    initializeFormatters() {
        this.formatters = {
            // Volume: 3 casas decimais, vírgula como separador - CRÍTICO
            volume: new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            }),
            // Moeda brasileira - PRESERVAR FORMATO EXATO
            currency: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }),
            // Números inteiros para quantidade
            number: new Intl.NumberFormat('pt-BR')
        };
    }

    /**
     * Função de cálculo principal - PRESERVAR LÓGICA EXATA ATUAL
     * Baseada na função calculate() do calc.html linha ~1250
     */
    calculate() {
        try {
            // Obter valores EXATAMENTE como no código atual
            const thickness = parseFloat(document.getElementById('thickness').value) || 0;
            const width = parseFloat(document.getElementById('width').value) || 0;
            const length = parseFloat(document.getElementById('length').value) || 0;
            const quantity = parseInt(document.getElementById('quantity').value) || 0;
            const packageQuantity = parseInt(document.getElementById('packageQuantity').value) || 1;
            
            // Obter preço e converter - PRESERVAR LÓGICA EXATA
            const priceInput = document.getElementById('price').value;
            const price = parseFloat(priceInput.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

            console.log("Valores para cálculo:", { thickness, width, length, quantity, packageQuantity, price });

            // FÓRMULA CRÍTICA - NÃO ALTERAR
            // Volume unitário em m³ (conversão de cm³ para m³)
            const volumeUnit = (thickness * width * length) / 1000000;
            
            // Volume total considerando quantidade e pacotes - LÓGICA EXATA ATUAL
            const totalQuantity = quantity * packageQuantity;
            const volumeTotal = volumeUnit * totalQuantity;
            
            // Custo total - PRESERVAR CÁLCULO EXATO
            const cost = volumeTotal * price;

            console.log("Resultados calculados:", { volumeUnit, volumeTotal, cost });

            // Atualizar interface - PRESERVAR IDs E FORMATAÇÃO EXATOS ATUAIS
            this.updateDisplay(volumeUnit, volumeTotal, cost);

            return {
                volumeUnit,
                volumeTotal,
                cost,
                totalQuantity,
                price
            };
        } catch (error) {
            console.error("Erro ao calcular:", error);
            return null;
        }
    }

    /**
     * Atualizar display dos resultados - PRESERVAR FORMATAÇÃO EXATA
     * Baseado no código atual do calc.html
     */
    updateDisplay(volumeUnit, volumeTotal, cost) {
        try {
            // PRESERVAR IDs EXATOS ATUAIS
            const volumeElement = document.getElementById('volume');
            const totalVolumeElement = document.getElementById('totalVolume');
            const costElement = document.getElementById('cost');

            if (volumeElement) {
                // FORMATAÇÃO CRÍTICA: vírgula como separador decimal + "m³"
                volumeElement.textContent = this.formatters.volume.format(volumeUnit).replace('.', ',') + 'm³';
            }

            if (totalVolumeElement) {
                // FORMATAÇÃO CRÍTICA: vírgula como separador decimal + "m³"
                totalVolumeElement.textContent = this.formatters.volume.format(volumeTotal).replace('.', ',') + 'm³';
            }

            if (costElement) {
                // FORMATAÇÃO CRÍTICA: moeda brasileira
                costElement.textContent = this.formatters.currency.format(cost);
            }
        } catch (error) {
            console.error("Erro ao atualizar display:", error);
        }
    }

    /**
     * Validação de inputs - PRESERVAR LÓGICA EXATA ATUAL
     * Baseada na função validateInputs() do calc.html linha ~1400
     */
    validateInputs() {
        console.log("Iniciando validação de inputs");
        
        try {
            const width = document.getElementById('width').value;
            const thickness = document.getElementById('thickness').value;
            const length = document.getElementById('length').value;
            const quantity = document.getElementById('quantity').value;
            const price = document.getElementById('price').value;

            console.log("Valores para validação:", { width, thickness, length, quantity, price });

            // VALIDAÇÕES CRÍTICAS - PRESERVAR MENSAGENS EXATAS ATUAIS
            if (!width || parseFloat(width) <= 0) {
                console.log("Largura inválida");
                this.showFeedback('Por favor, insira uma largura válida', 'error');
                return false;
            }

            if (!thickness || parseFloat(thickness) <= 0) {
                console.log("Espessura inválida");
                this.showFeedback('Por favor, insira uma espessura válida', 'error');
                return false;
            }

            if (!length || parseFloat(length) <= 0) {
                console.log("Comprimento inválido");
                this.showFeedback('Por favor, insira um comprimento válido', 'error');
                return false;
            }

            if (!quantity || parseInt(quantity) <= 0) {
                console.log("Quantidade inválida");
                this.showFeedback('Por favor, insira uma quantidade válida', 'error');
                return false;
            }

            if (!price || price === 'R$ 0,00' || price === 'R$ ,00') {
                console.log("Preço inválido");
                this.showFeedback('Por favor, insira um preço válido', 'error');
                return false;
            }

            console.log("Validação bem-sucedida");
            return true;
        } catch (error) {
            console.error("Erro durante a validação:", error);
            this.showFeedback('Erro ao validar os dados', 'error');
            return false;
        }
    }

    /**
     * Função utilitária para feedback - COMPATIBILIDADE
     */
    showFeedback(message, type = 'success') {
        // Usar sistema global de feedback se disponível
        if (typeof window.showFeedback === 'function') {
            window.showFeedback(message, type);
        } else {
            // Fallback para console
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Sanitizar entrada - PRESERVAR LÓGICA ATUAL
     */
    sanitizeInput(input) {
        return input.replace(/[^0-9,.]/g, '');
    }

    /**
     * Validar dados - PRESERVAR LÓGICA ATUAL
     */
    validateData(data) {
        return {
            ...data,
            volume: Math.max(0, parseFloat(data.volume) || 0),
            cost: Math.max(0, parseFloat(data.cost) || 0)
        };
    }

    /**
     * Formatação específica de volume para PDF - PRESERVAR FUNÇÃO CRÍTICA
     * Baseada na função formatVolumeForPDF() do calc.html
     */
    formatVolumeForPDF(volume) {
        if (typeof volume === 'string') {
            return volume;
        }
        // CRÍTICO: 3 decimais, vírgula como separador, + "m³"
        return volume.toFixed(3).replace('.', ',') + 'm³';
    }

    /**
     * Parsear preço - PRESERVAR LÓGICA EXATA ATUAL
     */
    parsePrice(priceString) {
        if (typeof priceString === 'number') return priceString;
        if (typeof priceString !== 'string') return 0;
        
        // LÓGICA EXATA ATUAL: remover símbolos e converter vírgula para ponto
        const cleanPrice = priceString
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '') // Remove separadores de milhares
            .replace(',', '.'); // Converte vírgula decimal para ponto
            
        const numericValue = parseFloat(cleanPrice);
        return isNaN(numericValue) ? 0 : numericValue;
    }

    /**
     * Formatar volume - FUNÇÃO CRÍTICA
     */
    formatVolume(volume) {
        return this.formatters.volume.format(volume).replace('.', ',') + 'm³';
    }

    /**
     * Formatar moeda - FUNÇÃO CRÍTICA
     */
    formatCurrency(amount) {
        return this.formatters.currency.format(amount);
    }

    /**
     * Limpar cache
     */
    clearCache() {
        this.cache.clear();
        console.log('📊 Cache de cálculos limpo');
    }

    /**
     * Estatísticas do cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            memoryUsage: JSON.stringify([...this.cache.entries()]).length + ' bytes'
        };
    }

    /**
     * Update quantity label - PRESERVAR FUNÇÃO ATUAL
     */
    updateQuantityLabel() {
        try {
            const packageQuantity = parseInt(document.getElementById('packageQuantity').value) || 1;
            const quantityUnit = document.getElementById('quantityUnit');
            
            if (quantityUnit) {
                if (packageQuantity > 1) {
                    quantityUnit.textContent = `Peças (${packageQuantity} por pacote)`;
                } else {
                    quantityUnit.textContent = 'Peças';
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar label de quantidade:", error);
        }
    }
}

// Função global para compatibilidade com código existente
window.CalculatorModule = CalculatorModule;

// Instância global para uso direto (compatibilidade)
window.calculator = new CalculatorModule(); 