# 🛡️ ELEMENTOS CRÍTICOS - PRESERVAÇÃO OBRIGATÓRIA
*Documentação detalhada dos elementos que NÃO PODEM SER ALTERADOS na refatoração*

---

## ⚠️ **ATENÇÃO MÁXIMA - ELEMENTOS INTOCÁVEIS**

### 🧮 **1. LÓGICA DE CÁLCULOS (PRESERVAR 100%)**

#### **Fórmula Exata da Calculadora:**
```javascript
// ESTA LÓGICA DEVE SER PRESERVADA EXATAMENTE ASSIM:
const thickness = parseFloat(document.getElementById('thickness').value) || 0;
const width = parseFloat(document.getElementById('width').value) || 0;
const length = parseFloat(document.getElementById('length').value) || 0;
const quantity = parseInt(document.getElementById('quantity').value) || 0;
const packageQuantity = parseInt(document.getElementById('packageQuantity').value) || 1;

// Volume unitário em m³ (conversão de cm³ para m³)
const volumeUnit = (thickness * width * length) / 1000000;

// Volume total considerando pacotes
const totalQuantity = quantity * packageQuantity;
const volumeTotal = volumeUnit * totalQuantity;

// Custo total
const pricePerCubicMeter = parseFloat(price.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;
const cost = volumeTotal * pricePerCubicMeter;
```

#### **Formatações de Números (PRESERVAR EXATAMENTE):**
```javascript
// Formatação de volume (3 casas decimais, vírgula como separador)
const volumeFormatted = volume.toFixed(3).replace('.', ',') + 'm³';

// Formatação de moeda brasileira
const currencyFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
}).format(amount);

// Formatação de quantidade (sem decimais)
const quantityFormatted = parseInt(quantity).toString();
```

---

### 🎨 **2. CORES E VISUAL (MANTER IDENTIDADE)**

#### **Paleta de Cores Oficial:**
```css
:root {
    /* CORES PRINCIPAIS - NÃO ALTERAR */
    --primary-color: #8B0000;        /* Vermelho escuro - cor da marca */
    --primary-dark: #660000;         /* Variação mais escura */
    --primary-light: rgba(139, 0, 0, 0.1); /* Transparência */
    
    /* CORES SECUNDÁRIAS */
    --secondary-color: #4CAF50;      /* Verde para sucessos */
    --secondary-dark: #45a049;       /* Verde escuro para hover */
    
    /* CORES NEUTRAS */
    --background-color: #f5f5f5;     /* Fundo geral */
    --white: #ffffff;                /* Branco puro */
    --text-color: #333333;           /* Texto principal */
    --text-light: #666666;           /* Texto secundário */
    --border-color: #dddddd;         /* Bordas */
    
    /* CORES DE FEEDBACK */
    --success-color: #4CAF50;        /* Verde sucesso */
    --error-color: #f44336;          /* Vermelho erro */
    --warning-color: #ff9800;        /* Laranja aviso */
    --info-color: #2196f3;           /* Azul informação */
}
```

#### **Header Padrão (MANTER EXATO):**
```css
.header {
    background-color: #8B0000;       /* COR OFICIAL */
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

---

### 📝 **3. ESTRUTURA DOS FORMULÁRIOS (POSIÇÕES FIXAS)**

#### **Ordem EXATA dos Campos de Cliente:**
```html
<!-- ESTA ORDEM DEVE SER MANTIDA -->
<div class="client-info">
    1. <input id="clientName" placeholder="Nome do cliente">
    2. <input id="clientContact" placeholder="(00) 0 0000-0000">
    3. <input id="paymentTerms" placeholder="Ex: 50% entrada, 50% na entrega">
    4. <input id="species" placeholder="Tipo de madeira">
</div>
```

#### **Ordem EXATA dos Campos da Calculadora:**
```html
<!-- ESTA SEQUÊNCIA É FUNDAMENTAL PARA O USUÁRIO -->
<div class="calculator-form">
    1. <input id="thickness" placeholder="cm"> <!-- Espessura -->
    2. <input id="width" placeholder="cm">     <!-- Largura -->
    3. <input id="length" placeholder="cm">    <!-- Comprimento -->
    4. <input id="quantity" placeholder="0">   <!-- Quantidade -->
    5. <input id="packageQuantity" value="1">  <!-- Qtd por Pacote -->
    6. <input id="price" placeholder="R$ 0,00"> <!-- Preço por m³ -->
</div>
```

#### **Labels e Placeholders (MANTER TEXTOS EXATOS):**
```javascript
const labels = {
    clientName: "Cliente:",
    clientContact: "Contato:",
    paymentTerms: "Condições:",
    species: "Espécie:",
    thickness: "Espessura",
    width: "Largura", 
    length: "Comprimento",
    quantity: "Quantidade",
    packageQuantity: "Quantidade Pacote",
    price: "Preço por m³:"
};
```

---

### 📊 **4. DISPLAY DE RESULTADOS (LAYOUT EXATO)**

#### **Grid de Resultados (PRESERVAR ESTRUTURA):**
```html
<!-- ESTA ESTRUTURA VISUAL É FAMILIAR AO USUÁRIO -->
<div class="results-grid">
    <div class="result-item">
        <h3>VOLUME</h3>                    <!-- Título MAIÚSCULO -->
        <p id="volume">0,000m³</p>         <!-- Formato específico -->
    </div>
    <div class="result-item">
        <h3>VOLUME TOTAL</h3>              <!-- Título MAIÚSCULO -->
        <p id="totalVolume">0,000m³</p>    <!-- Formato específico -->
    </div>
    <div class="result-item">
        <h3>CUSTO</h3>                     <!-- Título MAIÚSCULO -->
        <p id="cost">R$ 0,00</p>           <!-- Formato brasileiro -->
    </div>
</div>
```

---

### 📄 **5. RELATÓRIOS PDF (FUNÇÕES CRÍTICAS)**

#### **Funções de PDF (NÃO ALTERAR LÓGICA):**
```javascript
// FUNÇÃO PRINCIPAL DE PDF - PRESERVAR 100%
function generatePDFWithUnitPrice(id) {
    // Lógica complexa de geração de PDF
    // Formatação de tabelas
    // Cabeçalho com logo da empresa
    // Rodapé com data
    // Cálculos precisos
}

// FUNÇÃO PDF SIMPLES - PRESERVAR 100%
function generateSimplePDF(id) {
    // Versão simplificada do PDF
    // Mesma formatação visual
    // Compatibilidade com impressoras
}

// FORMATAÇÃO ESPECÍFICA DO VOLUME PARA PDF
function formatVolumeForPDF(volume) {
    if (typeof volume === 'string') {
        return volume;
    }
    return volume.toFixed(3).replace('.', ',') + 'm³';
}
```

#### **Template do PDF (MANTER LAYOUT):**
```html
<div style="font-family: 'Roboto', Arial, sans-serif; margin: 0; padding: 15px;">
    <!-- CABEÇALHO COM LOGO -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 150px;">
            <img src="${companyLogo}" style="max-width: 100%; height: auto;">
        </div>
        <div style="text-align: right;">
            <h2 style="color: #8B0000;">ORÇAMENTO</h2>
            <p>Nº: ${quoteNumber}</p>
            <p>Data: ${formattedDate}</p>
        </div>
    </div>
    
    <!-- TABELA DE ITENS -->
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #8B0000; color: white;">
                <th>Tamanho</th>
                <th>Peças</th>
                <th>Volume</th>
                <th>Preço</th>
            </tr>
        </thead>
        <!-- Itens aqui -->
    </table>
</div>
```

---

### 💾 **6. ARMAZENAMENTO E DADOS (localStorage)**

#### **Chaves de Armazenamento (NÃO ALTERAR):**
```javascript
const STORAGE_KEYS = {
    AUTH: 'calc_madeira_auth',           // Dados de autenticação
    PLAN: 'calc_madeira_plan',           // Dados do plano
    WOOD_LIST: 'woodList',               // Lista de itens da calculadora
    CLIENTS: 'clients',                  // Lista de clientes
    SPECIES: 'species',                  // Lista de espécies
    PAYMENT_TERMS: 'paymentTerms',       // Condições de pagamento
    USER_DATA: 'userData',               // Dados do usuário
    COMPANY_LOGO: 'companyLogo'          // Logo da empresa
};
```

#### **Estrutura dos Dados (PRESERVAR FORMATO):**
```javascript
// Formato do item na lista
const itemFormat = {
    size: "5 X 10 X 300",              // Formato: "espessura X largura X comprimento"
    quantity: "10",                     // String com quantidade
    volume: "0,150m³",                  // String formatada com vírgula
    price: "R$ 45,00",                  // String formatada moeda brasileira
    species: "Pinus",                   // Espécie da madeira
    packageQuantity: 1,                 // Número de pacotes
    totalQuantity: 10                   // Quantidade total (qty × packages)
};
```

---

### 🔧 **7. FUNCIONALIDADES PWA (MANTER INTEGRALMENTE)**

#### **Service Worker (NÃO ALTERAR):**
```javascript
// Cache name e versioning
const CACHE_NAME = 'calculadora-madeira-v2.1.1';

// URLs para cache (manter lista)
const urlsToCache = [
    '/', '/index.html', '/calc.html', '/orcamentos.html',
    '/perfil.html', '/configuracoes.html', '/styles.css',
    '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'
];
```

#### **Manifest.json (PRESERVAR CONFIGURAÇÕES):**
```json
{
    "name": "Calculadora de Madeira",
    "short_name": "Calc Madeira",
    "theme_color": "#4CAF50",           // NÃO ALTERAR
    "background_color": "#ffffff",      // NÃO ALTERAR
    "display": "standalone",
    "start_url": "/index.html"
}
```

---

### 🎯 **8. AUTENTICAÇÃO E NAVEGAÇÃO (FLUXO EXATO)**

#### **Fluxo de Login (MANTER LÓGICA):**
```javascript
// Sequência de verificação atual
if (isUserLoggedIn()) {
    const user = getCurrentUser();
    if (isPlanActive()) {
        window.location.href = 'orcamentos.html';  // Destino para usuário ativo
    } else {
        window.location.href = 'planos.html';      // Destino para plano expirado
    }
}
```

#### **Estrutura do Menu (MANTER ORDEM):**
```html
<!-- ORDEM DOS ITENS DO MENU - NÃO ALTERAR -->
<div class="menu-items">
    1. Meu Perfil
    2. Orçamentos  
    3. Condições de Pagamentos
    4. Configurações
    5. Notificações
    6. Ajuda
    7. Sair
</div>
```

---

### 📱 **9. RESPONSIVIDADE MOBILE (MANTER BREAKPOINTS)**

#### **Breakpoints Atuais (NÃO ALTERAR):**
```css
/* Tablet */
@media (max-width: 768px) {
    /* Ajustes para tablet */
}

/* Mobile */
@media (max-width: 480px) {
    /* Ajustes específicos para mobile */
    input[type="number"] {
        font-size: 16px; /* Evita zoom no iOS - MANTER */
    }
}

/* Mobile pequeno */
@media (max-width: 600px) {
    .delete-btn {
        width: 44px;     /* Área de toque mínima - MANTER */
        height: 44px;
    }
}
```

---

### 🚫 **10. VALIDAÇÕES E CONTROLES (LÓGICA EXATA)**

#### **Validação de Inputs (PRESERVAR RIGOR):**
```javascript
function validateInputs() {
    const width = document.getElementById('width').value;
    const thickness = document.getElementById('thickness').value;
    const length = document.getElementById('length').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;

    // ESTAS VALIDAÇÕES SÃO CRÍTICAS
    if (!width || parseFloat(width) <= 0) {
        showFeedback('Por favor, insira uma largura válida', 'error');
        return false;
    }
    // ... outras validações EXATAS
}
```

---

## ✅ **CHECKLIST DE PRESERVAÇÃO**

Durante a refatoração, VERIFICAR SEMPRE:

- [ ] ✅ Fórmula de cálculo mantida: `(e × l × c) / 1.000.000`
- [ ] ✅ Formatação de volume: `0,000m³` (vírgula, 3 decimais)
- [ ] ✅ Formatação de moeda: `R$ 0.000,00` (padrão brasileiro)
- [ ] ✅ Cores mantidas: `#8B0000` (principal), `#4CAF50` (secundária)
- [ ] ✅ Ordem dos campos preservada (Cliente → Calculadora)
- [ ] ✅ Posicionamento dos botões mantido
- [ ] ✅ Funções PDF funcionando 100%
- [ ] ✅ Autocomplete funcionando
- [ ] ✅ PWA operacional (offline, cache, manifest)
- [ ] ✅ Responsividade mobile preservada
- [ ] ✅ Validações mantidas
- [ ] ✅ Armazenamento localStorage funcionando
- [ ] ✅ Fluxo de autenticação intacto

---

## 🔄 **PROTOCOLO DE TESTE**

Após cada mudança, TESTAR OBRIGATORIAMENTE:

1. **Cálculos**: Inserir valores conhecidos e verificar resultados
2. **Formatação**: Verificar se números aparecem formatados corretamente
3. **PDFs**: Gerar relatório e verificar layout
4. **Responsividade**: Testar em mobile
5. **PWA**: Verificar funcionamento offline
6. **Armazenamento**: Verificar se dados são salvos/carregados

---

**⚠️ LEMBRETE: Qualquer alteração que quebre estes elementos DEVE ser revertida imediatamente!**

*Este documento é a BÍBLIA da refatoração - consultar sempre antes de fazer qualquer mudança.* 