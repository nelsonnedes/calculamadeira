/**
 * Storage Module - Calculadora de Madeira
 * ATENÇÃO: Preservar EXATAMENTE as chaves de localStorage atuais
 * Baseado no ELEMENTOS_PRESERVAR.md - seção 6
 */

export class StorageModule {
    constructor() {
        // CHAVES CRÍTICAS - NÃO ALTERAR
        this.STORAGE_KEYS = {
            AUTH: 'calc_madeira_auth',           // Dados de autenticação
            PLAN: 'calc_madeira_plan',           // Dados do plano
            WOOD_LIST: 'woodList',               // Lista de itens da calculadora
            CLIENTS: 'clients',                  // Lista de clientes
            SPECIES: 'species',                  // Lista de espécies
            PAYMENT_TERMS: 'paymentTerms',       // Condições de pagamento
            USER_DATA: 'userData',               // Dados do usuário
            COMPANY_LOGO: 'companyLogo',         // Logo da empresa
            CLIENTS_WITH_PHONE: 'clientsWithPhone', // Clientes com telefone
            RESET_CODES: 'calc_madeira_reset_codes', // Códigos de reset
            CURRENT_USER_ID: 'currentUserId',    // ID do usuário atual
            QUOTES: 'quotes_',                   // Prefixo para orçamentos por usuário
            USER_PREFERENCES: 'user_preferences' // Preferências do usuário
        };

        this.initializeDefaultData();
    }

    /**
     * Inicializar dados padrão se não existirem - PRESERVAR ESTRUTURAS ATUAIS
     */
    initializeDefaultData() {
        try {
            // Inicializar lista de clientes se não existir
            if (!this.get(this.STORAGE_KEYS.CLIENTS)) {
                this.set(this.STORAGE_KEYS.CLIENTS, []);
            }

            // Inicializar lista de espécies se não existir
            if (!this.get(this.STORAGE_KEYS.SPECIES)) {
                this.set(this.STORAGE_KEYS.SPECIES, []);
            }

            // Inicializar condições de pagamento PADRÃO - PRESERVAR LISTA ATUAL
            if (!this.get(this.STORAGE_KEYS.PAYMENT_TERMS)) {
                this.set(this.STORAGE_KEYS.PAYMENT_TERMS, [
                    '50% entrada, 50% na entrega',
                    'À vista',
                    '30% entrada, 70% na entrega',
                    'Pagamento na entrega',
                    '1+2 (33% entrada, 33% em 30 dias, 34% em 60 dias)',
                    '1+3 (25% entrada, 25% em 30 dias, 25% em 60 dias, 25% em 90 dias)'
                ]);
            }

            // Inicializar clientes com telefone se não existir
            if (!this.get(this.STORAGE_KEYS.CLIENTS_WITH_PHONE)) {
                this.set(this.STORAGE_KEYS.CLIENTS_WITH_PHONE, []);
            }

            console.log('✅ Dados padrão do storage inicializados');
        } catch (error) {
            console.error('❌ Erro ao inicializar dados padrão:', error);
        }
    }

    /**
     * Salvar item no localStorage
     */
    set(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            console.log(`💾 Storage: Salvou ${key}`, value);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar ${key}:`, error);
            return false;
        }
    }

    /**
     * Obter item do localStorage
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error(`❌ Erro ao ler ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Remover item do localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            console.log(`🗑️ Storage: Removeu ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao remover ${key}:`, error);
            return false;
        }
    }

    /**
     * Verificar se chave existe
     */
    exists(key) {
        return localStorage.getItem(key) !== null;
    }

    /**
     * FUNÇÕES ESPECÍFICAS CRÍTICAS - PRESERVAR EXATAMENTE
     */

    /**
     * Salvar lista de madeira - FUNÇÃO CRÍTICA ATUAL
     */
    saveWoodList(items) {
        return this.set(this.STORAGE_KEYS.WOOD_LIST, items);
    }

    /**
     * Carregar lista de madeira - FUNÇÃO CRÍTICA ATUAL
     */
    loadWoodList() {
        return this.get(this.STORAGE_KEYS.WOOD_LIST, []);
    }

    /**
     * Salvar cliente - PRESERVAR LÓGICA ATUAL
     */
    saveClient(clientName) {
        if (!clientName?.trim()) return false;

        const clients = this.get(this.STORAGE_KEYS.CLIENTS, []);
        if (!clients.includes(clientName.trim())) {
            clients.push(clientName.trim());
            return this.set(this.STORAGE_KEYS.CLIENTS, clients);
        }
        return true;
    }

    /**
     * Salvar cliente com telefone - PRESERVAR LÓGICA ATUAL
     */
    saveClientWithPhone(clientName, clientPhone) {
        if (!clientName?.trim()) return false;

        const clientsWithPhone = this.get(this.STORAGE_KEYS.CLIENTS_WITH_PHONE, []);
        
        // Verificar se cliente já existe
        const existingIndex = clientsWithPhone.findIndex(
            client => client.name === clientName.trim()
        );

        const clientData = {
            name: clientName.trim(),
            phone: clientPhone?.trim() || ''
        };

        if (existingIndex >= 0) {
            // Atualizar cliente existente
            clientsWithPhone[existingIndex] = clientData;
        } else {
            // Adicionar novo cliente
            clientsWithPhone.push(clientData);
        }

        return this.set(this.STORAGE_KEYS.CLIENTS_WITH_PHONE, clientsWithPhone);
    }

    /**
     * Obter clientes com telefone
     */
    getClientsWithPhone() {
        return this.get(this.STORAGE_KEYS.CLIENTS_WITH_PHONE, []);
    }

    /**
     * Salvar espécie - PRESERVAR LÓGICA ATUAL
     */
    saveSpecies(speciesName) {
        if (!speciesName?.trim()) return false;

        const species = this.get(this.STORAGE_KEYS.SPECIES, []);
        if (!species.includes(speciesName.trim())) {
            species.push(speciesName.trim());
            return this.set(this.STORAGE_KEYS.SPECIES, species);
        }
        return true;
    }

    /**
     * Obter espécies
     */
    getSpecies() {
        return this.get(this.STORAGE_KEYS.SPECIES, []);
    }

    /**
     * Obter condições de pagamento
     */
    getPaymentTerms() {
        return this.get(this.STORAGE_KEYS.PAYMENT_TERMS, []);
    }

    /**
     * Salvar condição de pagamento personalizada
     */
    savePaymentTerm(term) {
        if (!term?.trim()) return false;

        const terms = this.getPaymentTerms();
        if (!terms.includes(term.trim())) {
            terms.push(term.trim());
            return this.set(this.STORAGE_KEYS.PAYMENT_TERMS, terms);
        }
        return true;
    }

    /**
     * ORÇAMENTOS - FUNÇÕES CRÍTICAS
     */

    /**
     * Salvar orçamento - PRESERVAR ESTRUTURA ATUAL
     */
    saveQuote(userId, quote) {
        const quotesKey = this.STORAGE_KEYS.QUOTES + userId;
        const quotes = this.get(quotesKey, []);
        
        // Adicionar timestamp se não existir
        if (!quote.createdAt) {
            quote.createdAt = new Date().toISOString();
        }
        
        // Adicionar ID único se não existir
        if (!quote.id) {
            quote.id = 'quote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        quotes.push(quote);
        return this.set(quotesKey, quotes);
    }

    /**
     * Carregar orçamentos do usuário
     */
    loadQuotes(userId) {
        const quotesKey = this.STORAGE_KEYS.QUOTES + userId;
        return this.get(quotesKey, []);
    }

    /**
     * Atualizar orçamento existente
     */
    updateQuote(userId, quoteId, updatedQuote) {
        const quotesKey = this.STORAGE_KEYS.QUOTES + userId;
        const quotes = this.get(quotesKey, []);
        
        const index = quotes.findIndex(q => q.id === quoteId);
        if (index >= 0) {
            quotes[index] = { ...quotes[index], ...updatedQuote };
            return this.set(quotesKey, quotes);
        }
        return false;
    }

    /**
     * Deletar orçamento
     */
    deleteQuote(userId, quoteId) {
        const quotesKey = this.STORAGE_KEYS.QUOTES + userId;
        const quotes = this.get(quotesKey, []);
        
        const filteredQuotes = quotes.filter(q => q.id !== quoteId);
        return this.set(quotesKey, filteredQuotes);
    }

    /**
     * LOGO DA EMPRESA - FUNÇÕES CRÍTICAS
     */

    /**
     * Salvar logo da empresa
     */
    saveCompanyLogo(logoDataUrl) {
        return this.set(this.STORAGE_KEYS.COMPANY_LOGO, logoDataUrl);
    }

    /**
     * Obter logo da empresa
     */
    getCompanyLogo() {
        return this.get(this.STORAGE_KEYS.COMPANY_LOGO, '');
    }

    /**
     * DADOS DO USUÁRIO - FUNÇÕES CRÍTICAS
     */

    /**
     * Salvar dados do usuário
     */
    saveUserData(userData) {
        return this.set(this.STORAGE_KEYS.USER_DATA, userData);
    }

    /**
     * Obter dados do usuário
     */
    getUserData() {
        return this.get(this.STORAGE_KEYS.USER_DATA, {});
    }

    /**
     * ID do usuário atual
     */
    getCurrentUserId() {
        return this.get(this.STORAGE_KEYS.CURRENT_USER_ID, null);
    }

    /**
     * Definir usuário atual
     */
    setCurrentUserId(userId) {
        return this.set(this.STORAGE_KEYS.CURRENT_USER_ID, userId);
    }

    /**
     * UTILITÁRIOS
     */

    /**
     * Limpar todos os dados
     */
    clearAll() {
        try {
            Object.values(this.STORAGE_KEYS).forEach(key => {
                if (key.endsWith('_')) {
                    // Para chaves com prefixo, limpar todas as variações
                    Object.keys(localStorage).forEach(storageKey => {
                        if (storageKey.startsWith(key)) {
                            localStorage.removeItem(storageKey);
                        }
                    });
                } else {
                    localStorage.removeItem(key);
                }
            });
            console.log('🧹 Todos os dados do storage foram limpos');
            return true;
        } catch (error) {
            console.error('❌ Erro ao limpar storage:', error);
            return false;
        }
    }

    /**
     * Obter estatísticas do storage
     */
    getStorageStats() {
        const stats = {
            totalKeys: 0,
            totalSize: 0,
            keyDetails: {}
        };

        try {
            Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
                if (key.endsWith('_')) {
                    // Para chaves com prefixo
                    Object.keys(localStorage).forEach(storageKey => {
                        if (storageKey.startsWith(key)) {
                            const size = localStorage.getItem(storageKey)?.length || 0;
                            stats.totalKeys++;
                            stats.totalSize += size;
                            stats.keyDetails[storageKey] = { size: size + ' chars' };
                        }
                    });
                } else {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const size = item.length;
                        stats.totalKeys++;
                        stats.totalSize += size;
                        stats.keyDetails[key] = { size: size + ' chars' };
                    }
                }
            });

            stats.totalSizeFormatted = (stats.totalSize / 1024).toFixed(2) + ' KB';
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return stats;
        }
    }

    /**
     * Exportar dados para backup
     */
    exportData() {
        const data = {};
        try {
            Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
                if (key.endsWith('_')) {
                    // Para chaves com prefixo
                    const prefixData = {};
                    Object.keys(localStorage).forEach(storageKey => {
                        if (storageKey.startsWith(key)) {
                            prefixData[storageKey] = this.get(storageKey);
                        }
                    });
                    data[name] = prefixData;
                } else {
                    data[name] = this.get(key);
                }
            });
            return data;
        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            return null;
        }
    }

    /**
     * Importar dados de backup
     */
    importData(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                const key = this.STORAGE_KEYS[name];
                if (key) {
                    if (typeof value === 'object' && value !== null && key.endsWith('_')) {
                        // Para chaves com prefixo
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            this.set(subKey, subValue);
                        });
                    } else {
                        this.set(key, value);
                    }
                }
            });
            console.log('✅ Dados importados com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            return false;
        }
    }
}

// Instância global para compatibilidade
window.StorageModule = StorageModule;
window.storage = new StorageModule(); 