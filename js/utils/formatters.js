/**
 * Formatters Utils - Calculadora de Madeira
 * ATENÇÃO: Preservar EXATAMENTE as formatações atuais
 * Baseado no ELEMENTOS_PRESERVAR.md - seção 2 e código atual dos arquivos
 */

export class FormattersUtils {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormatters();
        console.log('✅ Formatadores inicializados');
    }

    setupFormatters() {
        // Formatadores Intl para diferentes tipos - PRESERVAR CONFIGURAÇÕES
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
            number: new Intl.NumberFormat('pt-BR'),
            // Data brasileira
            date: new Intl.DateTimeFormat('pt-BR'),
            // Data com horário
            datetime: new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
    }

    /**
     * Formatação de telefone - PRESERVAR LÓGICA EXATA ATUAL
     * Baseado no formatPhoneNumber() do calc.html
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Remover tudo que não for número
        let cleaned = phone.replace(/\D/g, '');
        
        // Aplicar formatação baseada no tamanho - LÓGICA ATUAL
        if (cleaned.length === 11) {
            // Celular: (XX) XXXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            // Fixo: (XX) XXXX-XXXX
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length >= 8) {
            // Outros formatos
            return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
        }
        
        return cleaned;
    }

    /**
     * Formatação de preço - PRESERVAR LÓGICA EXATA ATUAL
     * Baseado no formatPrice() do calc.html
     */
    formatPrice(value) {
        if (value === '' || value === null || value === undefined) {
            return 'R$ 0,00';
        }

        // Converter para string se for número
        let input = String(value);
        
        // Remover tudo exceto dígitos
        let digitsOnly = input.replace(/\D/g, '');
        
        if (digitsOnly === '') {
            return 'R$ 0,00';
        }
        
        // Converter para número (centavos)
        let cents = parseInt(digitsOnly, 10);
        
        // Converter centavos para reais
        let reais = cents / 100;
        
        // Formatação final - PRESERVAR FORMATO EXATO: R$ 0.000,00
        return this.formatters.currency.format(reais);
    }

    /**
     * Formatação de volume - FUNÇÃO CRÍTICA
     * ATENÇÃO: 3 decimais, vírgula como separador, + "m³"
     */
    formatVolume(volume) {
        if (typeof volume === 'string' && volume.includes('m³')) {
            return volume; // Já formatado
        }
        
        const numericValue = parseFloat(volume) || 0;
        // CRÍTICO: 3 decimais, vírgula como separador, + "m³"
        return this.formatters.volume.format(numericValue).replace('.', ',') + 'm³';
    }

    /**
     * Formatação de volume para PDF - PRESERVAR FUNÇÃO CRÍTICA
     * Baseada na formatVolumeForPDF() do calc.html
     */
    formatVolumeForPDF(volume) {
        if (typeof volume === 'string') {
            return volume;
        }
        // CRÍTICO: 3 decimais, vírgula como separador, + "m³"
        return parseFloat(volume).toFixed(3).replace('.', ',') + 'm³';
    }

    /**
     * Formatação de moeda - FUNÇÃO CRÍTICA
     */
    formatCurrency(amount) {
        return this.formatters.currency.format(parseFloat(amount) || 0);
    }

    /**
     * Formatação de data - PRESERVAR FORMATO BRASILEIRO
     */
    formatDate(date) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return this.formatters.date.format(dateObj);
    }

    /**
     * Formatação de data e hora - PRESERVAR FORMATO BRASILEIRO
     */
    formatDateTime(date) {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return this.formatters.datetime.format(dateObj);
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
     * Parsear volume (converter string para número)
     */
    parseVolume(volumeString) {
        if (typeof volumeString === 'number') return volumeString;
        if (typeof volumeString !== 'string') return 0;
        
        // Remover "m³" e converter vírgula para ponto
        const cleanVolume = volumeString
            .replace('m³', '')
            .replace(',', '.');
            
        const numericValue = parseFloat(cleanVolume);
        return isNaN(numericValue) ? 0 : numericValue;
    }

    /**
     * Formatação de CEP - PADRÃO BRASILEIRO
     */
    formatCEP(cep) {
        if (!cep) return '';
        
        const cleaned = cep.replace(/\D/g, '');
        if (cleaned.length === 8) {
            return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cleaned;
    }

    /**
     * Formatação de CPF - PADRÃO BRASILEIRO
     */
    formatCPF(cpf) {
        if (!cpf) return '';
        
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cleaned;
    }

    /**
     * Formatação de CNPJ - PADRÃO BRASILEIRO
     */
    formatCNPJ(cnpj) {
        if (!cnpj) return '';
        
        const cleaned = cnpj.replace(/\D/g, '');
        if (cleaned.length === 14) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return cleaned;
    }

    /**
     * Formatação de peso (em kg)
     */
    formatWeight(weight) {
        const numericValue = parseFloat(weight) || 0;
        return numericValue.toFixed(2).replace('.', ',') + ' kg';
    }

    /**
     * Formatação de porcentagem
     */
    formatPercentage(value) {
        const numericValue = parseFloat(value) || 0;
        return numericValue.toFixed(1).replace('.', ',') + '%';
    }

    /**
     * Formatação de número de peças/quantidade
     */
    formatQuantity(quantity) {
        return this.formatters.number.format(parseInt(quantity) || 0);
    }

    /**
     * Aplicar máscara de telefone em tempo real - PRESERVAR COMPORTAMENTO ATUAL
     */
    applyPhoneMask(input) {
        if (!input) return;

        input.addEventListener('input', (e) => {
            const value = e.target.value;
            const formatted = this.formatPhoneNumber(value);
            
            // Evitar loop infinito
            if (e.target.value !== formatted) {
                e.target.value = formatted;
            }
        });

        // Formatação inicial se houver valor
        if (input.value) {
            input.value = this.formatPhoneNumber(input.value);
        }
    }

    /**
     * Aplicar máscara de preço em tempo real - PRESERVAR COMPORTAMENTO ATUAL
     */
    applyPriceMask(input) {
        if (!input) return;

        input.addEventListener('input', (e) => {
            const formatted = this.formatPrice(e.target.value);
            
            // Evitar loop infinito
            if (e.target.value !== formatted) {
                e.target.value = formatted;
            }
        });

        // Formatação inicial se houver valor
        if (input.value) {
            input.value = this.formatPrice(input.value);
        }
    }

    /**
     * Aplicar máscara de CEP em tempo real
     */
    applyCEPMask(input) {
        if (!input) return;

        input.addEventListener('input', (e) => {
            const formatted = this.formatCEP(e.target.value);
            
            if (e.target.value !== formatted) {
                e.target.value = formatted;
            }
        });

        if (input.value) {
            input.value = this.formatCEP(input.value);
        }
    }

    /**
     * Remover formatação (obter apenas números)
     */
    removeFormatting(value) {
        if (typeof value !== 'string') return value;
        return value.replace(/\D/g, '');
    }

    /**
     * Validar se telefone está completo
     */
    isValidPhone(phone) {
        const cleaned = this.removeFormatting(phone);
        return cleaned.length >= 10 && cleaned.length <= 11;
    }

    /**
     * Validar se CEP está completo
     */
    isValidCEP(cep) {
        const cleaned = this.removeFormatting(cep);
        return cleaned.length === 8;
    }

    /**
     * Validar se CPF está completo
     */
    isValidCPF(cpf) {
        const cleaned = this.removeFormatting(cpf);
        return cleaned.length === 11;
    }

    /**
     * Validar se CNPJ está completo
     */
    isValidCNPJ(cnpj) {
        const cleaned = this.removeFormatting(cnpj);
        return cleaned.length === 14;
    }

    /**
     * Formatação automática baseada no tipo de campo - FUNÇÃO UTILITÁRIA
     */
    autoFormat(input, type) {
        if (!input) return;

        const formatMap = {
            'phone': () => this.applyPhoneMask(input),
            'price': () => this.applyPriceMask(input),
            'cep': () => this.applyCEPMask(input),
            'cpf': (value) => this.formatCPF(value),
            'cnpj': (value) => this.formatCNPJ(value)
        };

        const formatter = formatMap[type];
        if (formatter) {
            formatter();
        }
    }

    /**
     * Formatação de texto para exibição - CAPITALIZAÇÃO
     */
    formatDisplayText(text) {
        if (!text) return '';
        
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Formatação de medidas (cm para exibição)
     */
    formatMeasurement(value, unit = 'cm') {
        const numericValue = parseFloat(value) || 0;
        return numericValue.toFixed(1).replace('.', ',') + ' ' + unit;
    }

    /**
     * Formatação compacta de números grandes
     */
    formatCompactNumber(number) {
        const numericValue = parseFloat(number) || 0;
        
        if (numericValue >= 1000000) {
            return (numericValue / 1000000).toFixed(1).replace('.', ',') + 'M';
        } else if (numericValue >= 1000) {
            return (numericValue / 1000).toFixed(1).replace('.', ',') + 'K';
        }
        
        return this.formatters.number.format(numericValue);
    }

    /**
     * Escape HTML para prevenir XSS
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Truncar texto com reticências
     */
    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
}

// Instância global para compatibilidade
window.FormattersUtils = FormattersUtils;
window.formatters = new FormattersUtils();

// FUNÇÕES GLOBAIS CRÍTICAS - MANTER COMPATIBILIDADE ATUAL
window.formatPhoneNumber = function(phone) {
    return window.formatters ? window.formatters.formatPhoneNumber(phone) : phone;
};

window.formatPrice = function(value) {
    return window.formatters ? window.formatters.formatPrice(value) : value;
};

window.formatVolume = function(volume) {
    return window.formatters ? window.formatters.formatVolume(volume) : volume;
};

window.formatVolumeForPDF = function(volume) {
    return window.formatters ? window.formatters.formatVolumeForPDF(volume) : volume;
};

window.parsePrice = function(priceString) {
    return window.formatters ? window.formatters.parsePrice(priceString) : 0;
}; 