/**
 * PDF Generator Module - Calculadora de Madeira
 * ATENÇÃO: Geração de PDFs para orçamentos
 * Preservar EXATAMENTE as funcionalidades atuais
 * Baseado no ELEMENTOS_PRESERVAR.md - seção 5
 */

export class PDFGeneratorModule {
    constructor() {
        this.storageModule = null;
        this.feedbackModule = null;
        console.log('✅ Módulo PDF Generator inicializado');
    }

    /**
     * Injetar dependências dos outros módulos
     */
    setDependencies(storage, feedback) {
        this.storageModule = storage;
        this.feedbackModule = feedback;
    }

    /**
     * Gerar PDF do orçamento com preço unitário
     * PRESERVAR LÓGICA EXATA das funções PDF atuais
     */
    generatePDFWithUnitPrice(id) {
        try {
            console.log("=== INICIANDO generatePDFWithUnitPrice ===");
            console.log("ID do orçamento:", id);
            
            // Buscar dados do usuário e da empresa (usando módulo storage)
            const user = this.storageModule ? 
                this.storageModule.get('user', {}) : 
                JSON.parse(localStorage.getItem('user') || '{}');
                
            const companyName = user.company || 'Nome da Empresa';
            const companyPhone = user.phone || 'Telefone não informado';
            const companyAddress = user.address || 'Endereço não informado';
            const companyEmail = user.email || 'Email não informado';
            const companyCNPJ = user.cnpj || 'CNPJ não informado';
            const companyLogo = this.storageModule ? 
                this.storageModule.get('companyLogo', '') :
                localStorage.getItem('companyLogo') || '';
            
            // Buscar orçamento usando módulo storage
            const quote = this.getQuoteById(id);
            if (!quote) {
                console.error("Orçamento não encontrado");
                this.showFeedback('Orçamento não encontrado', 'error');
                return;
            }
            
            console.log("Orçamento encontrado:", quote);
            
            // Gerar dados do orçamento
            const quoteNumber = quote.number || 'ORÇ-' + quote.id.substring(0, 6);
            const formattedDate = new Date(quote.date).toLocaleDateString('pt-BR');
            
            // Abrir janela (exatamente como calc.html)
            console.log('Abrindo janela do relatório...');
            const reportWindow = window.open('', '_blank');
            
            if (!reportWindow) {
                console.error('Falha ao abrir janela - popup pode estar bloqueado');
                this.showFeedback('Não foi possível abrir o relatório. Verifique se o popup não está bloqueado.', 'error');
                return;
            }
            
            // Gerar conteúdo HTML
            const reportContent = this.generatePDFContentWithPrices(
                quote, quoteNumber, formattedDate, 
                companyName, companyPhone, companyAddress, companyEmail, companyCNPJ, companyLogo
            );

            console.log('Escrevendo conteúdo na janela...');
            console.log('Tamanho do conteúdo:', reportContent.length);
            
            try {
                reportWindow.document.write(reportContent);
                reportWindow.document.close();
                console.log('PDF com preços gerado com sucesso!');
                this.showFeedback('PDF com preços gerado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao escrever conteúdo:', error);
                this.showFeedback('Erro ao gerar o PDF: ' + error.message, 'error');
                reportWindow.close();
            }
            
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            this.showFeedback('Erro ao gerar PDF: ' + error.message, 'error');
        }
    }

    /**
     * Gerar PDF do orçamento sem preço unitário
     */
    generateSimplePDF(id) {
        try {
            console.log("=== INICIANDO generateSimplePDF ===");
            console.log("ID do orçamento:", id);
            
            // Buscar dados do usuário e da empresa
            const user = this.storageModule ? 
                this.storageModule.get('user', {}) : 
                JSON.parse(localStorage.getItem('user') || '{}');
                
            const companyName = user.company || 'Nome da Empresa';
            const companyPhone = user.phone || 'Telefone não informado';
            const companyAddress = user.address || 'Endereço não informado';
            const companyEmail = user.email || 'Email não informado';
            const companyCNPJ = user.cnpj || 'CNPJ não informado';
            const companyLogo = this.storageModule ? 
                this.storageModule.get('companyLogo', '') :
                localStorage.getItem('companyLogo') || '';
            
            // Buscar orçamento
            const quote = this.getQuoteById(id);
            if (!quote) {
                console.error("Orçamento não encontrado");
                this.showFeedback('Orçamento não encontrado', 'error');
                return;
            }
            
            console.log("Orçamento encontrado:", quote);
            
            // Gerar dados do orçamento
            const quoteNumber = quote.number || 'ORÇ-' + quote.id.substring(0, 6);
            const formattedDate = new Date(quote.date).toLocaleDateString('pt-BR');
            
            // Abrir janela
            console.log('Abrindo janela do relatório...');
            const reportWindow = window.open('', '_blank');
            
            if (!reportWindow) {
                console.error('Falha ao abrir janela - popup pode estar bloqueado');
                this.showFeedback('Não foi possível abrir o relatório. Verifique se o popup não está bloqueado.', 'error');
                return;
            }
            
            // Gerar conteúdo HTML
            const reportContent = this.generatePDFContentSimple(
                quote, quoteNumber, formattedDate, 
                companyName, companyPhone, companyAddress, companyEmail, companyCNPJ, companyLogo
            );

            console.log('Escrevendo conteúdo na janela...');
            console.log('Tamanho do conteúdo:', reportContent.length);
            
            try {
                reportWindow.document.write(reportContent);
                reportWindow.document.close();
                console.log('PDF simples gerado com sucesso!');
                this.showFeedback('PDF simples gerado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao escrever conteúdo:', error);
                this.showFeedback('Erro ao gerar o PDF: ' + error.message, 'error');
                reportWindow.close();
            }
            
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            this.showFeedback('Erro ao gerar PDF: ' + error.message, 'error');
        }
    }

    /**
     * Buscar orçamento por ID usando módulo storage
     */
    getQuoteById(id) {
        if (this.storageModule) {
            // Usar módulo storage se disponível
            const userId = this.storageModule.getCurrentUserId();
            const quotes = this.storageModule.get(`quotes_${userId}`, []);
            return quotes.find(q => q.id === id);
        } else {
            // Fallback para localStorage direto
            let userId = localStorage.getItem('currentUserId');
            if (!userId) {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                userId = currentUser.email;
            }
            const quotes = JSON.parse(localStorage.getItem(`quotes_${userId}`) || '[]');
            return quotes.find(q => q.id === id);
        }
    }

    /**
     * Mostrar feedback usando módulo feedback ou fallback
     */
    showFeedback(message, type) {
        if (this.feedbackModule) {
            this.feedbackModule.show(message, type);
        } else if (window.showFeedback) {
            window.showFeedback(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Gerar conteúdo HTML do PDF com preços
     * PRESERVAR TEMPLATE EXATO ATUAL
     */
    generatePDFContentWithPrices(quote, quoteNumber, formattedDate, companyName, companyPhone, companyAddress, companyEmail, companyCNPJ, companyLogo) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orçamento - ${quote.clientName || 'Cliente'}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                    
                    :root {
                        --primary-color: #8B0000;
                        --secondary-color: #f5f5f5;
                        --text-color: #333;
                        --border-color: #ddd;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Roboto', Arial, sans-serif;
                        margin: 0;
                        padding: 15px;
                        color: var(--text-color);
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    
                    .compact-header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 1px solid var(--primary-color);
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                    }
                    
                    .logo-container {
                        width: 120px;
                    }
                    
                    .logo {
                        max-width: 100%;
                        max-height: 60px;
                    }
                    
                    .company-info {
                        flex: 1;
                        padding-left: 15px;
                    }
                    
                    .company-info h1 {
                        font-size: 18px;
                        color: var(--primary-color);
                        margin-bottom: 4px;
                    }
                    
                    .company-info p {
                        margin: 0;
                        font-size: 10px;
                        line-height: 1.3;
                    }
                    
                    .document-details {
                        text-align: right;
                        font-size: 10px;
                    }
                    
                    .document-details h2 {
                        font-size: 14px;
                        color: var(--primary-color);
                        margin-bottom: 4px;
                    }
                    
                    .client-section {
                        background-color: var(--secondary-color);
                        padding: 8px;
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        font-size: 11px;
                    }
                    
                    .client-info, .quote-info {
                        flex: 1;
                    }
                    
                    .subtitle {
                        font-weight: 700;
                        color: var(--primary-color);
                        font-size: 11px;
                        margin-bottom: 4px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }
                    
                    th {
                        background-color: var(--primary-color);
                        color: white;
                        font-weight: 500;
                        text-align: left;
                        padding: 5px 3px;
                    }
                    
                    td {
                        padding: 4px 3px;
                        border-bottom: 1px solid #eee;
                        vertical-align: top;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    .narrow {
                        width: 35px;
                        text-align: center;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .totals {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 10px;
                        font-weight: 700;
                    }
                    
                    .totals div {
                        margin-left: 20px;
                    }
                    
                    .footer {
                        margin-top: 20px;
                        font-size: 10px;
                        color: #666;
                        text-align: center;
                    }
                    
                    .print-buttons {
                        text-align: center;
                        margin-top: 20px;
                    }
                    
                    button {
                        padding: 8px 15px;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    @media print {
                        .print-buttons {
                            display: none;
                        }
                        
                        body {
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        @page {
                            margin: 0.5cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="compact-header">
                        <div class="logo-container">
                            ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="logo">` : ''}
                        </div>
                        <div class="company-info">
                            <h1>${companyName}</h1>
                            <p>${companyAddress}</p>
                            <p>Tel: ${companyPhone} | Email: ${companyEmail}</p>
                            <p>CNPJ: ${companyCNPJ}</p>
                        </div>
                        <div class="document-details">
                            <h2>ORÇAMENTO</h2>
                            <p><strong>Nº:</strong> ${quoteNumber}</p>
                            <p><strong>Data:</strong> ${formattedDate}</p>
                            <p><strong>Validade:</strong> 15 dias</p>
                        </div>
                    </div>
                    
                    <div class="client-section">
                        <div class="client-info">
                            <div class="subtitle">CLIENTE</div>
                            <p><strong>Nome:</strong> ${quote.clientName || 'Consumidor Final'}</p>
                            ${quote.clientContact ? `<p><strong>Contato:</strong> ${quote.clientContact}</p>` : ''}
                        </div>
                        <div class="quote-info">
                            <div class="subtitle">CONDIÇÕES</div>
                            <p><strong>Pagamento:</strong> ${quote.paymentTerms || '50% entrada, 50% na entrega'}</p>
                            <p><strong>Entrega:</strong> 5-7 dias após confirmação</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th class="narrow">Nº</th>
                                <th>Dimensões</th>
                                <th>Qtd</th>
                                <th>Volume</th>
                                <th>Espécie</th>
                                <th class="text-right">Unit.</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quote.items && quote.items.length > 0 ? quote.items.map((item, index) => {
                                // Processar dados do item de forma segura
                                const sizeText = String(item.size || '');
                                const quantity = String(item.quantity || '0');
                                const volume = String(item.volume || '0,000m³');
                                const species = String(item.species || 'Não informado');
                                
                                // Calcular preço unitário
                                let unitPrice = 0;
                                let totalPrice = 0;
                                
                                if (typeof item.price === 'string') {
                                    totalPrice = parseFloat(item.price.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.'));
                                } else if (typeof item.finalPrice === 'string') {
                                    totalPrice = parseFloat(item.finalPrice.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.'));
                                } else if (typeof item.finalPrice === 'number') {
                                    totalPrice = item.finalPrice;
                                } else if (typeof item.price === 'number') {
                                    totalPrice = item.price;
                                }
                                
                                const volumeValue = parseFloat(volume.replace(/[^0-9,.]/g, '').replace(',', '.'));
                                if (volumeValue > 0) {
                                    unitPrice = totalPrice / volumeValue;
                                }
                                
                                const unitPriceFormatted = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(unitPrice);
                                
                                const totalPriceFormatted = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(totalPrice);
                                
                                return `
                                <tr>
                                    <td class="narrow">${index + 1}</td>
                                    <td>${sizeText}</td>
                                    <td>${quantity}</td>
                                    <td>${volume}</td>
                                    <td>${species}</td>
                                    <td class="text-right">${unitPriceFormatted}/m³</td>
                                    <td class="text-right">${totalPriceFormatted}</td>
                                </tr>
                                `;
                            }).join('') : '<tr><td colspan="7">Nenhum item encontrado</td></tr>'}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div>Volume Total: ${quote.totalVolume ? String(quote.totalVolume).replace(/(\d+\.?\d*)/, match => parseFloat(match).toLocaleString('pt-BR', {minimumFractionDigits: 3, maximumFractionDigits: 3}) + ' m³') : '0,000 m³'}</div>
                        <div>Valor Total: ${quote.totalPrice ? (typeof quote.totalPrice === 'number' ? quote.totalPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : String(quote.totalPrice)) : 'R$ 0,00'}</div>
                    </div>
                    
                    <div class="footer">
                        <p>Agradecemos sua preferência! Para mais informações: ${companyPhone}</p>
                        <p>Este documento não possui valor fiscal - Gerado em ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="print-buttons">
                        <button onclick="window.print()">Imprimir Orçamento</button>
                        <button onclick="window.close()" style="margin-left: 10px; background-color: #333;">Fechar</button>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Gerar conteúdo HTML do PDF simples (sem preços unitários)
     */
    generatePDFContentSimple(quote, quoteNumber, formattedDate, companyName, companyPhone, companyAddress, companyEmail, companyCNPJ, companyLogo) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orçamento - ${quote.clientName || 'Cliente'}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
                    
                    :root {
                        --primary-color: #8B0000;
                        --secondary-color: #f5f5f5;
                        --text-color: #333;
                        --border-color: #ddd;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Roboto', Arial, sans-serif;
                        margin: 0;
                        padding: 15px;
                        color: var(--text-color);
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    
                    .compact-header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 1px solid var(--primary-color);
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                    }
                    
                    .logo-container {
                        width: 120px;
                    }
                    
                    .logo {
                        max-width: 100%;
                        max-height: 60px;
                    }
                    
                    .company-info {
                        flex: 1;
                        padding-left: 15px;
                    }
                    
                    .company-info h1 {
                        font-size: 18px;
                        color: var(--primary-color);
                        margin-bottom: 4px;
                    }
                    
                    .company-info p {
                        margin: 0;
                        font-size: 10px;
                        line-height: 1.3;
                    }
                    
                    .document-details {
                        text-align: right;
                        font-size: 10px;
                    }
                    
                    .document-details h2 {
                        font-size: 14px;
                        color: var(--primary-color);
                        margin-bottom: 4px;
                    }
                    
                    .client-section {
                        background-color: var(--secondary-color);
                        padding: 8px;
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        font-size: 11px;
                    }
                    
                    .client-info, .quote-info {
                        flex: 1;
                    }
                    
                    .subtitle {
                        font-weight: 700;
                        color: var(--primary-color);
                        font-size: 11px;
                        margin-bottom: 4px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10px;
                    }
                    
                    th {
                        background-color: var(--primary-color);
                        color: white;
                        font-weight: 500;
                        text-align: left;
                        padding: 5px 3px;
                    }
                    
                    td {
                        padding: 4px 3px;
                        border-bottom: 1px solid #eee;
                        vertical-align: top;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    .narrow {
                        width: 35px;
                        text-align: center;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .totals {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 10px;
                        font-weight: 700;
                    }
                    
                    .totals div {
                        margin-left: 20px;
                    }
                    
                    .footer {
                        margin-top: 20px;
                        font-size: 10px;
                        color: #666;
                        text-align: center;
                    }
                    
                    .print-buttons {
                        text-align: center;
                        margin-top: 20px;
                    }
                    
                    button {
                        padding: 8px 15px;
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    
                    @media print {
                        .print-buttons {
                            display: none;
                        }
                        
                        body {
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        @page {
                            margin: 0.5cm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="compact-header">
                        <div class="logo-container">
                            ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="logo">` : ''}
                        </div>
                        <div class="company-info">
                            <h1>${companyName}</h1>
                            <p>${companyAddress}</p>
                            <p>Tel: ${companyPhone} | Email: ${companyEmail}</p>
                            <p>CNPJ: ${companyCNPJ}</p>
                        </div>
                        <div class="document-details">
                            <h2>ORÇAMENTO</h2>
                            <p><strong>Nº:</strong> ${quoteNumber}</p>
                            <p><strong>Data:</strong> ${formattedDate}</p>
                            <p><strong>Validade:</strong> 15 dias</p>
                        </div>
                    </div>
                    
                    <div class="client-section">
                        <div class="client-info">
                            <div class="subtitle">CLIENTE</div>
                            <p><strong>Nome:</strong> ${quote.clientName || 'Consumidor Final'}</p>
                            ${quote.clientContact ? `<p><strong>Contato:</strong> ${quote.clientContact}</p>` : ''}
                        </div>
                        <div class="quote-info">
                            <div class="subtitle">CONDIÇÕES</div>
                            <p><strong>Pagamento:</strong> ${quote.paymentTerms || '50% entrada, 50% na entrega'}</p>
                            <p><strong>Entrega:</strong> 5-7 dias após confirmação</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th class="narrow">Nº</th>
                                <th>Dimensões</th>
                                <th>Qtd</th>
                                <th>Volume</th>
                                <th>Espécie</th>
                                <th class="text-right">Preço</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quote.items && quote.items.length > 0 ? quote.items.map((item, index) => {
                                // Processar dados do item de forma segura
                                const sizeText = String(item.size || '');
                                const packageQuantity = parseInt(item.packageQuantity || 1);
                                const quantity = String(item.quantity || '0');
                                const volume = String(item.volume || '0,000m³');
                                const species = String(item.species || 'Não informado');
                                const priceText = String(item.price || 'R$ 0,00');
                                
                                let quantityDisplay = quantity;
                                if (packageQuantity > 1) {
                                    quantityDisplay = quantity + '×' + packageQuantity;
                                }
                                
                                return `
                                <tr>
                                    <td class="narrow">${index + 1}</td>
                                    <td>${sizeText}</td>
                                    <td>${quantityDisplay}</td>
                                    <td>${volume}</td>
                                    <td>${species}</td>
                                    <td class="text-right">${priceText}</td>
                                </tr>
                                `;
                            }).join('') : '<tr><td colspan="6">Nenhum item encontrado</td></tr>'}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div>Volume Total: ${quote.totalVolume ? String(quote.totalVolume).replace(/(\d+\.?\d*)/, match => parseFloat(match).toLocaleString('pt-BR', {minimumFractionDigits: 3, maximumFractionDigits: 3}) + ' m³') : '0,000 m³'}</div>
                        <div>Valor Total: ${quote.totalPrice ? (typeof quote.totalPrice === 'number' ? quote.totalPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : String(quote.totalPrice)) : 'R$ 0,00'}</div>
                    </div>
                    
                    <div class="footer">
                        <p>Agradecemos sua preferência! Para mais informações: ${companyPhone}</p>
                        <p>Este documento não possui valor fiscal - Gerado em ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="print-buttons">
                        <button onclick="window.print()">Imprimir Orçamento</button>
                        <button onclick="window.close()" style="margin-left: 10px; background-color: #333;">Fechar</button>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
} 