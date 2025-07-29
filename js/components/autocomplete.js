/**
 * Autocomplete Component - Calculadora de Madeira
 * ATENÇÃO: Preservar EXATAMENTE a funcionalidade de autocomplete atual
 * Baseado no calc.html (linhas ~1900-2200) e lógica de DOMContentLoaded
 */

export class AutocompleteComponent {
    constructor() {
        this.activeAutocomplete = null;
        this.instances = new Map();
        this.init();
    }

    init() {
        console.log('✅ Sistema de autocomplete inicializado');
    }

    /**
     * Configurar autocomplete para clientes - MELHORADO PARA MOBILE
     */
    setupClientAutocomplete() {
        const clientInput = document.getElementById('clientName');
        const clientAutocomplete = document.getElementById('clientAutocomplete');
        const clientContactInput = document.getElementById('clientContact');
        
        if (!clientInput || !clientAutocomplete) {
            console.warn('⚠️ Elementos de autocomplete de cliente não encontrados');
            return;
        }

        // Remover eventos existentes para evitar duplicação
        const newClientInput = clientInput.cloneNode(true);
        clientInput.parentNode.replaceChild(newClientInput, clientInput);

        // Carregar clientes existentes
        const clientsWithPhone = JSON.parse(localStorage.getItem('clientsWithPhone')) || [];

        // MELHORADO: Evento de foco para mostrar sugestões mais facilmente no mobile
        newClientInput.addEventListener('focus', () => {
            const term = newClientInput.value.trim().toLowerCase();
            if (term.length >= 1) { // Reduzido de 2 para 1 caractere
                this.showClientSuggestions(newClientInput, clientAutocomplete, clientContactInput, clientsWithPhone, term);
            }
        });

        // Evento de input - PRESERVAR FILTRO ATUAL MAS MELHORADO
        newClientInput.addEventListener('input', () => {
            const term = newClientInput.value.trim().toLowerCase();
            
            console.log("Pesquisando clientes com termo:", term);
            
            // MELHORADO: Mostrar sugestões com menos caracteres no mobile
            if (term.length >= 1) { 
                this.showClientSuggestions(newClientInput, clientAutocomplete, clientContactInput, clientsWithPhone, term);
            } else {
                clientAutocomplete.innerHTML = '';
                clientAutocomplete.style.display = 'none';
            }
        });

        // Salvar cliente quando perder foco - PRESERVAR LÓGICA ATUAL
        newClientInput.addEventListener('blur', () => {
            // Delay para permitir clique nas sugestões
            setTimeout(() => {
                const clientName = newClientInput.value.trim();
                const clientContact = clientContactInput?.value?.trim() || '';
                
                if (clientName && clientContact) {
                    this.saveClientWithPhone(clientName, clientContact);
                }
                
                clientAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de cliente configurado com melhorias mobile');
    }

    /**
     * NOVA FUNÇÃO: Mostrar sugestões de clientes (melhorada para mobile)
     */
    showClientSuggestions(input, autocompleteContainer, contactInput, clients, term) {
        // Limpar sugestões anteriores
        autocompleteContainer.innerHTML = '';
        
        // Filtrar clientes que correspondem ao termo - LÓGICA ATUAL
        const matchingClients = clients.filter(client => 
            client.name && client.name.toLowerCase().includes(term)
        );
        
        console.log("Clientes correspondentes:", matchingClients);
        
        // Mostrar até 5 sugestões - LIMITE ATUAL
        matchingClients.slice(0, 5).forEach(client => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <div class="client-name">${client.name}</div>
                ${client.phone ? `<div class="client-phone">${client.phone}</div>` : ''}
            `;
            
            // MELHORADO: Adicionar eventos tanto para click quanto touch
            ['click', 'touchend'].forEach(eventType => {
                item.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    input.value = client.name;
                    if (client.phone && contactInput) {
                        contactInput.value = client.phone;
                    }
                    autocompleteContainer.innerHTML = '';
                    autocompleteContainer.style.display = 'none';
                });
            });
            
            autocompleteContainer.appendChild(item);
        });
        
        // Mostrar/ocultar container - COMPORTAMENTO ATUAL
        if (matchingClients.length > 0) {
            autocompleteContainer.style.display = 'block';
        } else {
            autocompleteContainer.style.display = 'none';
        }
    }

    /**
     * Configurar autocomplete para condições de pagamento - MELHORADO PARA MOBILE
     */
    setupPaymentTermsAutocomplete() {
        const paymentTermsInput = document.getElementById('paymentTerms');
        const paymentTermsAutocomplete = document.getElementById('paymentTermsAutocomplete');
        
        if (!paymentTermsInput || !paymentTermsAutocomplete) {
            console.warn('⚠️ Elementos de autocomplete de condições não encontrados');
            return;
        }

        // Remover eventos existentes
        const newPaymentTermsInput = paymentTermsInput.cloneNode(true);
        paymentTermsInput.parentNode.replaceChild(newPaymentTermsInput, paymentTermsInput);
        
        // Carregar condições existentes
        const paymentConditions = JSON.parse(localStorage.getItem('paymentTerms')) || [];
        
        // MELHORADO: Evento de foco - MOSTRAR TODAS AS CONDIÇÕES
        newPaymentTermsInput.addEventListener('focus', () => {
            this.showPaymentTermsSuggestions(newPaymentTermsInput, paymentTermsAutocomplete, paymentConditions);
        });
        
        // MELHORADO: Evento de input - FILTRAR CONDIÇÕES
        newPaymentTermsInput.addEventListener('input', () => {
            const term = newPaymentTermsInput.value.trim().toLowerCase();
            
            if (term.length === 0) {
                // Mostrar todas se campo vazio
                this.showPaymentTermsSuggestions(newPaymentTermsInput, paymentTermsAutocomplete, paymentConditions);
            } else {
                // Filtrar por termo
                const filteredConditions = paymentConditions.filter(condition => 
                    condition.toLowerCase().includes(term)
                );
                this.showPaymentTermsSuggestions(newPaymentTermsInput, paymentTermsAutocomplete, filteredConditions);
            }
        });
        
        // Salvar condição quando perder foco - PRESERVAR LÓGICA ATUAL
        newPaymentTermsInput.addEventListener('blur', () => {
            setTimeout(() => {
                const condition = newPaymentTermsInput.value.trim();
                if (condition && !paymentConditions.includes(condition)) {
                    paymentConditions.push(condition);
                    localStorage.setItem('paymentTerms', JSON.stringify(paymentConditions));
                }
                paymentTermsAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de condições configurado com melhorias mobile');
    }

    /**
     * NOVA FUNÇÃO: Mostrar sugestões de condições de pagamento (melhorada para mobile)
     */
    showPaymentTermsSuggestions(input, autocompleteContainer, conditions) {
        // Limpar sugestões anteriores
        autocompleteContainer.innerHTML = '';
        
        // Mostrar condições (limitado a 8 para mobile)
        conditions.slice(0, 8).forEach(condition => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = condition;
            
            // MELHORADO: Adicionar eventos tanto para click quanto touch
            ['click', 'touchend'].forEach(eventType => {
                item.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    input.value = condition;
                    autocompleteContainer.innerHTML = '';
                    autocompleteContainer.style.display = 'none';
                });
            });
            
            autocompleteContainer.appendChild(item);
        });
        
        if (conditions.length > 0) {
            autocompleteContainer.style.display = 'block';
        } else {
            autocompleteContainer.style.display = 'none';
        }
    }

    /**
     * Configurar autocomplete para espécies - MELHORADO PARA MOBILE
     */
    setupSpeciesAutocomplete() {
        const speciesInput = document.getElementById('species');
        const speciesAutocomplete = document.getElementById('speciesAutocomplete');
        
        if (!speciesInput || !speciesAutocomplete) {
            console.warn('⚠️ Elementos de autocomplete de espécies não encontrados');
            return;
        }

        // Remover eventos existentes
        const newSpeciesInput = speciesInput.cloneNode(true);
        speciesInput.parentNode.replaceChild(newSpeciesInput, speciesInput);

        // Carregar espécies existentes
        const species = JSON.parse(localStorage.getItem('species')) || [];

        // MELHORADO: Evento de foco para mostrar sugestões
        newSpeciesInput.addEventListener('focus', () => {
            const term = newSpeciesInput.value.trim().toLowerCase();
            if (term.length >= 1) {
                this.showSpeciesSuggestions(newSpeciesInput, speciesAutocomplete, species, term);
            }
        });

        // MELHORADO: Evento de input - FILTRAR ESPÉCIES
        newSpeciesInput.addEventListener('input', () => {
            const term = newSpeciesInput.value.trim().toLowerCase();
            
            if (term.length >= 1) {
                this.showSpeciesSuggestions(newSpeciesInput, speciesAutocomplete, species, term);
            } else {
                speciesAutocomplete.innerHTML = '';
                speciesAutocomplete.style.display = 'none';
            }
        });
        
        // Salvar espécie quando perder foco - PRESERVAR LÓGICA ATUAL
        newSpeciesInput.addEventListener('blur', () => {
            setTimeout(() => {
                const specie = newSpeciesInput.value.trim();
                if (specie && !species.includes(specie)) {
                    species.push(specie);
                    localStorage.setItem('species', JSON.stringify(species));
                }
                speciesAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de espécies configurado com melhorias mobile');
    }

    /**
     * NOVA FUNÇÃO: Mostrar sugestões de espécies (melhorada para mobile)
     */
    showSpeciesSuggestions(input, autocompleteContainer, species, term) {
        // Limpar sugestões anteriores
        autocompleteContainer.innerHTML = '';
        
        // Filtrar espécies - LÓGICA ATUAL
        const matchingSpecies = species.filter(specie => 
            specie.toLowerCase().includes(term)
        );
        
        // Mostrar até 6 sugestões para mobile
        matchingSpecies.slice(0, 6).forEach(specie => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = specie;
            
            // MELHORADO: Adicionar eventos tanto para click quanto touch
            ['click', 'touchend'].forEach(eventType => {
                item.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    input.value = specie;
                    autocompleteContainer.innerHTML = '';
                    autocompleteContainer.style.display = 'none';
                });
            });
            
            autocompleteContainer.appendChild(item);
        });
        
        // Mostrar/ocultar container - COMPORTAMENTO ATUAL
        if (matchingSpecies.length > 0) {
            autocompleteContainer.style.display = 'block';
        } else {
            autocompleteContainer.style.display = 'none';
        }
    }

    /**
     * Configurar eventos globais de autocomplete - PRESERVAR COMPORTAMENTO ATUAL
     */
    setupGlobalEvents() {
        // Esconder autocompletar quando clicar fora - LÓGICA ATUAL
        document.addEventListener('click', (e) => {
            const clientInput = document.getElementById('clientName');
            const clientAutocomplete = document.getElementById('clientAutocomplete');
            const speciesInput = document.getElementById('species');
            const speciesAutocomplete = document.getElementById('speciesAutocomplete');
            const paymentTermsInput = document.getElementById('paymentTerms');
            const paymentTermsAutocomplete = document.getElementById('paymentTermsAutocomplete');

            // Cliente
            if (clientInput && clientAutocomplete && 
                !clientInput.contains(e.target) && !clientAutocomplete.contains(e.target)) {
                clientAutocomplete.style.display = 'none';
            }

            // Espécie
            if (speciesInput && speciesAutocomplete && 
                !speciesInput.contains(e.target) && !speciesAutocomplete.contains(e.target)) {
                speciesAutocomplete.style.display = 'none';
            }

            // Condições de pagamento
            if (paymentTermsInput && paymentTermsAutocomplete && 
                !paymentTermsInput.contains(e.target) && !paymentTermsAutocomplete.contains(e.target)) {
                paymentTermsAutocomplete.style.display = 'none';
            }
        });

        console.log('✅ Eventos globais de autocomplete configurados');
    }

    /**
     * Função para salvar cliente com telefone - PRESERVAR LÓGICA EXATA ATUAL
     */
    saveClientWithPhoneToLocalStorage(clientName, clientPhone) {
        if (!clientName?.trim()) return false;

        const clientsWithPhone = JSON.parse(localStorage.getItem('clientsWithPhone')) || [];
        
        // Verificar se cliente já existe - LÓGICA ATUAL
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

        localStorage.setItem('clientsWithPhone', JSON.stringify(clientsWithPhone));
        console.log('💾 Cliente com telefone salvo:', clientData);
        return true;
    }

    /**
     * Função para salvar cliente simples - PRESERVAR LÓGICA ATUAL
     */
    saveClientToLocalStorage(clientName) {
        if (!clientName?.trim()) return false;

        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        if (!clients.includes(clientName.trim())) {
            clients.push(clientName.trim());
            localStorage.setItem('clients', JSON.stringify(clients));
            console.log('💾 Cliente salvo:', clientName.trim());
        }
        return true;
    }

    /**
     * Função para salvar espécie - PRESERVAR LÓGICA ATUAL
     */
    saveSpeciesToLocalStorage(speciesName) {
        if (!speciesName?.trim()) return false;

        const speciesList = JSON.parse(localStorage.getItem('species')) || [];
        if (!speciesList.includes(speciesName.trim())) {
            speciesList.push(speciesName.trim());
            localStorage.setItem('species', JSON.stringify(speciesList));
            console.log('💾 Espécie salva:', speciesName.trim());
        }
        return true;
    }

    /**
     * NOVA FUNÇÃO: Inicializar dados padrão se não existirem
     */
    initializeDefaultData() {
        // Espécies padrão de madeira brasileira
        const defaultSpecies = [
            'Pinus', 'Eucalipto', 'Peroba', 'Cedrinho', 'Angelim',
            'Ipê', 'Mogno', 'Jatobá', 'Imbuia', 'Araucária',
            'Cedro', 'Pau-Brasil', 'Cumaru', 'Maçaranduba', 'Sucupira'
        ];
        
        // Condições de pagamento padrão
        const defaultPaymentTerms = [
            '50% entrada, 50% na entrega',
            'À vista',
            '30 dias',
            '60 dias',
            '30/60 dias',
            '10x sem juros',
            'Entrada + 2x',
            'Entrada + 3x',
            'Parcelado em 6x',
            'Contra entrega'
        ];
        
        // Inicializar espécies se não existir
        const existingSpecies = JSON.parse(localStorage.getItem('species') || '[]');
        if (existingSpecies.length === 0) {
            localStorage.setItem('species', JSON.stringify(defaultSpecies));
            console.log('✅ Espécies padrão inicializadas');
        }
        
        // Inicializar condições de pagamento se não existir
        const existingPaymentTerms = JSON.parse(localStorage.getItem('paymentTerms') || '[]');
        if (existingPaymentTerms.length === 0) {
            localStorage.setItem('paymentTerms', JSON.stringify(defaultPaymentTerms));
            console.log('✅ Condições de pagamento padrão inicializadas');
        }
        
        console.log('✅ Dados padrão verificados/inicializados');
    }

    /**
     * Inicializar todos os autocompletar - PRESERVAR LÓGICA ATUAL + MELHORIAS
     */
    initializeAll() {
        console.log('🔧 Inicializando sistema de autocompletar...');
        
        // Inicializar dados padrão primeiro
        this.initializeDefaultData();
        
        // Configurar autocompletar
        this.setupClientAutocomplete();
        this.setupPaymentTermsAutocomplete();
        this.setupSpeciesAutocomplete();
        this.setupGlobalEvents();
        
        console.log('✅ Sistema de autocompletar inicializado com dados padrão');
    }

    /**
     * Limpar todas as sugestões abertas
     */
    clearAllSuggestions() {
        const autocompleteContainers = [
            'clientAutocomplete',
            'speciesAutocomplete', 
            'paymentTermsAutocomplete'
        ];

        autocompleteContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
                container.style.display = 'none';
            }
        });
    }

    /**
     * Obter dados do autocomplete para backup/export
     */
    getAutocompleteData() {
        return {
            clients: JSON.parse(localStorage.getItem('clients') || '[]'),
            clientsWithPhone: JSON.parse(localStorage.getItem('clientsWithPhone') || '[]'),
            species: JSON.parse(localStorage.getItem('species') || '[]'),
            paymentTerms: JSON.parse(localStorage.getItem('paymentTerms') || '[]')
        };
    }

    /**
     * Importar dados do autocomplete
     */
    importAutocompleteData(data) {
        try {
            if (data.clients) {
                localStorage.setItem('clients', JSON.stringify(data.clients));
            }
            if (data.clientsWithPhone) {
                localStorage.setItem('clientsWithPhone', JSON.stringify(data.clientsWithPhone));
            }
            if (data.species) {
                localStorage.setItem('species', JSON.stringify(data.species));
            }
            if (data.paymentTerms) {
                localStorage.setItem('paymentTerms', JSON.stringify(data.paymentTerms));
            }
            console.log('✅ Dados de autocomplete importados');
            return true;
        } catch (error) {
            console.error('❌ Erro ao importar dados de autocomplete:', error);
            return false;
        }
    }
}

// Instância global para compatibilidade
window.AutocompleteComponent = AutocompleteComponent;
window.autocompleteSystem = new AutocompleteComponent();

// Função global para inicializar - COMPATIBILIDADE ATUAL
window.initializeAutocomplete = function() {
    if (window.autocompleteSystem) {
        window.autocompleteSystem.initializeAll();
    }
};

// Auto-inicializar quando DOM estiver pronto - COMPORTAMENTO ATUAL
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeAutocomplete();
    });
} else {
    window.initializeAutocomplete();
} 