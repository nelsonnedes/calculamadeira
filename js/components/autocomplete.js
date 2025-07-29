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
     * Configurar autocomplete para cliente - PRESERVAR LÓGICA EXATA ATUAL
     * Baseado no DOMContentLoaded do calc.html linha ~1950
     */
    setupClientAutocomplete() {
        const clientInput = document.getElementById('clientName');
        const clientAutocomplete = document.getElementById('clientAutocomplete');
        const clientContactInput = document.getElementById('clientContact');

        if (!clientInput || !clientAutocomplete) {
            console.warn('⚠️ Elementos de autocomplete do cliente não encontrados');
            return;
        }

        // Inicializar lista de clientes com telefone se não existir - PRESERVAR ESTRUTURA
        let clientsWithPhone = JSON.parse(localStorage.getItem('clientsWithPhone')) || [];

        // Remover eventos existentes para evitar duplicação
        const newClientInput = clientInput.cloneNode(true);
        clientInput.parentNode.replaceChild(newClientInput, clientInput);

        // Evento de foco - PRESERVAR COMPORTAMENTO ATUAL
        newClientInput.addEventListener('focus', () => {
            if (!newClientInput.value.trim()) {
                // Limpar sugestões anteriores
                clientAutocomplete.innerHTML = '';
                
                // Mostrar até 10 sugestões - LIMITE ATUAL
                clientsWithPhone.slice(0, 10).forEach(client => {
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerHTML = `
                        <div class="client-name">${client.name}</div>
                        ${client.phone ? `<div class="client-phone">${client.phone}</div>` : ''}
                    `;
                    item.addEventListener('click', () => {
                        newClientInput.value = client.name;
                        if (client.phone && clientContactInput) {
                            clientContactInput.value = client.phone;
                        }
                        clientAutocomplete.innerHTML = '';
                        clientAutocomplete.style.display = 'none';
                    });
                    clientAutocomplete.appendChild(item);
                });
                
                // Mostrar container - COMPORTAMENTO ATUAL
                if (clientsWithPhone.length > 0) {
                    clientAutocomplete.style.display = 'block';
                }
            }
        });

        // Evento de input - PRESERVAR FILTRO ATUAL
        newClientInput.addEventListener('input', () => {
            const term = newClientInput.value.trim().toLowerCase();
            
            console.log("Pesquisando clientes com termo:", term);
            
            // Limpar sugestões anteriores
            clientAutocomplete.innerHTML = '';
            
            // Filtrar clientes que correspondem ao termo - LÓGICA ATUAL
            const matchingClients = clientsWithPhone.filter(client => 
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
                item.addEventListener('click', () => {
                    newClientInput.value = client.name;
                    if (client.phone && clientContactInput) {
                        clientContactInput.value = client.phone;
                    }
                    clientAutocomplete.innerHTML = '';
                    clientAutocomplete.style.display = 'none';
                });
                clientAutocomplete.appendChild(item);
            });
            
            // Mostrar/ocultar container - COMPORTAMENTO ATUAL
            if (matchingClients.length > 0) {
                clientAutocomplete.style.display = 'block';
            } else {
                clientAutocomplete.style.display = 'none';
            }
        });

        // Salvar cliente quando perder foco - PRESERVAR LÓGICA ATUAL
        newClientInput.addEventListener('blur', () => {
            setTimeout(() => {
                const clientName = newClientInput.value.trim();
                const clientPhone = clientContactInput ? clientContactInput.value.trim() : '';
                
                if (clientName) {
                    this.saveClientWithPhoneToLocalStorage(clientName, clientPhone);
                }
                
                clientAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de cliente configurado');
    }

    /**
     * Configurar autocomplete para condições de pagamento - PRESERVAR LÓGICA ATUAL
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
        
        // Evento de foco - MOSTRAR TODAS AS CONDIÇÕES
        newPaymentTermsInput.addEventListener('focus', () => {
            let paymentConditions = JSON.parse(localStorage.getItem('paymentTerms')) || [];
            
            // Limpar sugestões anteriores
            paymentTermsAutocomplete.innerHTML = '';
            
            // Mostrar todas as condições - COMPORTAMENTO ATUAL
            paymentConditions.forEach(condition => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = condition;
                item.addEventListener('click', () => {
                    newPaymentTermsInput.value = condition;
                    paymentTermsAutocomplete.innerHTML = '';
                    paymentTermsAutocomplete.style.display = 'none';
                });
                paymentTermsAutocomplete.appendChild(item);
            });
            
            if (paymentConditions.length > 0) {
                paymentTermsAutocomplete.style.display = 'block';
            }
        });
        
        // Evento de input - FILTRAR CONDIÇÕES
        newPaymentTermsInput.addEventListener('input', () => {
            const term = newPaymentTermsInput.value.trim().toLowerCase();
            let paymentConditions = JSON.parse(localStorage.getItem('paymentTerms')) || [];
            
            // Limpar sugestões anteriores
            paymentTermsAutocomplete.innerHTML = '';
            
            // Filtrar condições - LÓGICA ATUAL
            const matchingConditions = paymentConditions.filter(condition => 
                condition.toLowerCase().includes(term)
            );
            
            matchingConditions.forEach(condition => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = condition;
                item.addEventListener('click', () => {
                    newPaymentTermsInput.value = condition;
                    paymentTermsAutocomplete.innerHTML = '';
                    paymentTermsAutocomplete.style.display = 'none';
                });
                paymentTermsAutocomplete.appendChild(item);
            });
            
            if (matchingConditions.length > 0) {
                paymentTermsAutocomplete.style.display = 'block';
            } else {
                paymentTermsAutocomplete.style.display = 'none';
            }
        });
        
        // Esconder ao perder foco - COMPORTAMENTO ATUAL
        newPaymentTermsInput.addEventListener('blur', () => {
            setTimeout(() => {
                paymentTermsAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de condições de pagamento configurado');
    }

    /**
     * Configurar autocomplete para espécies - PRESERVAR LÓGICA ATUAL
     */
    setupSpeciesAutocomplete() {
        const speciesInput = document.getElementById('species');
        const speciesAutocomplete = document.getElementById('speciesAutocomplete');
        
        if (!speciesInput || !speciesAutocomplete) {
            console.warn('⚠️ Elementos de autocomplete de espécies não encontrados');
            return;
        }

        // Evento de input - FILTRAR ESPÉCIES
        speciesInput.addEventListener('input', () => {
            const term = speciesInput.value.trim().toLowerCase();
            const species = JSON.parse(localStorage.getItem('species')) || [];
            
            // Limpar sugestões anteriores
            speciesAutocomplete.innerHTML = '';
            
            if (!term) return;
            
            // Filtrar espécies - LÓGICA ATUAL
            const matchingSpecies = species.filter(specie => 
                specie.toLowerCase().includes(term)
            );
            
            // Mostrar até 5 sugestões - LIMITE ATUAL
            matchingSpecies.slice(0, 5).forEach(specie => {
                const item = document.createElement('div');
                item.textContent = specie;
                item.addEventListener('click', () => {
                    speciesInput.value = specie;
                    speciesAutocomplete.innerHTML = '';
                    speciesAutocomplete.style.display = 'none';
                });
                speciesAutocomplete.appendChild(item);
            });
            
            // Mostrar/ocultar container - COMPORTAMENTO ATUAL
            if (matchingSpecies.length > 0) {
                speciesAutocomplete.style.display = 'block';
            } else {
                speciesAutocomplete.style.display = 'none';
            }
        });
        
        // Salvar espécie quando perder foco - PRESERVAR LÓGICA ATUAL
        speciesInput.addEventListener('blur', () => {
            const speciesName = speciesInput.value.trim();
            if (speciesName) {
                this.saveSpeciesToLocalStorage(speciesName);
            }
            // Ocultar sugestões - COMPORTAMENTO ATUAL
            setTimeout(() => {
                speciesAutocomplete.style.display = 'none';
            }, 200);
        });

        console.log('✅ Autocomplete de espécies configurado');
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
     * Inicializar todos os autocompletar - FUNÇÃO PRINCIPAL
     */
    initializeAll() {
        try {
            // Aguardar elementos estarem no DOM
            setTimeout(() => {
                this.setupClientAutocomplete();
                this.setupPaymentTermsAutocomplete();
                this.setupSpeciesAutocomplete();
                this.setupGlobalEvents();
                
                console.log('✅ Todos os autocompletar inicializados com sucesso');
            }, 100);
        } catch (error) {
            console.error('❌ Erro ao inicializar autocompletar:', error);
        }
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