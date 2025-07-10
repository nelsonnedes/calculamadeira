# 🪵 Calculadora de Madeira

Uma aplicação web completa para cálculo de orçamentos de madeira serrada, desenvolvida para madeireiras e profissionais do setor.

## 📋 Funcionalidades

- **Calculadora de Madeira**: Cálculo preciso de volumes e preços de madeira serrada
- **Gestão de Orçamentos**: Criação, edição e exclusão de orçamentos
- **Geração de PDFs**: Relatórios profissionais com e sem preços unitários
- **Sistema de Usuários**: Autenticação e perfis personalizados
- **Interface Responsiva**: Funciona em desktop e dispositivos móveis
- **PWA**: Instalável como aplicativo no celular

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Armazenamento**: LocalStorage
- **Design**: CSS Grid, Flexbox
- **Ícones**: Font Awesome
- **PWA**: Service Worker, Web App Manifest

## 📱 Capturas de Tela

### Calculadora Principal
![Calculadora](screenshots/calculadora.png)

### Lista de Orçamentos
![Orçamentos](screenshots/orcamentos.png)

### PDF Gerado
![PDF](screenshots/pdf.png)

## 🔧 Instalação e Uso

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/calculadora-madeira.git
cd calculadora-madeira
```

### 2. Inicie um servidor local
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx http-server

# Usando Live Server (VS Code)
# Instale a extensão Live Server e clique com botão direito no index.html
```

### 3. Acesse a aplicação
Abra seu navegador e acesse: `http://localhost:8000`

## 📖 Como Usar

### Primeiro Acesso
1. Acesse a aplicação
2. Faça login ou crie uma conta
3. Configure seu perfil e dados da empresa

### Criando um Orçamento
1. Vá para a **Calculadora**
2. Adicione as dimensões da madeira
3. Selecione a espécie e quantidade
4. Configure os preços
5. Adicione dados do cliente
6. Salve o orçamento

### Gerando PDFs
1. Vá para **Orçamentos**
2. Escolha o orçamento desejado
3. Clique em **PDF C/Preço** (com preços unitários) ou **PDF S/Preço** (sem preços unitários)

## 🏗️ Estrutura do Projeto

```
calculadora-madeira/
├── index.html              # Página inicial/login
├── calc.html               # Calculadora principal
├── orcamentos.html         # Lista de orçamentos
├── perfil.html             # Perfil do usuário
├── configuracoes.html      # Configurações
├── styles.css              # Estilos principais
├── manifest.json           # Manifest PWA
├── service-worker.js       # Service Worker
├── icons/                  # Ícones da aplicação
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── favicon.ico
├── screenshots/            # Capturas de tela
└── README.md              # Este arquivo
```

## 🔒 Funcionalidades de Segurança

- Dados armazenados localmente no navegador
- Isolamento por usuário
- Validação de entrada de dados
- Backup automático de orçamentos

## 🌟 Funcionalidades Avançadas

### Cálculos Suportados
- **Madeira Serrada**: Tábuas, vigas, caibros
- **Unidades**: Metros cúbicos (m³), pés quadrados, peças
- **Preços**: Por m³, por peça, com desconto
- **Embalagens**: Cálculo automático de quantidades

### Relatórios PDF
- **Completo**: Com preços unitários detalhados
- **Simples**: Sem preços unitários
- **Profissional**: Logo da empresa, dados completos
- **Impressão**: Otimizado para impressão

## 🔄 Atualizações Recentes

### v2.0.0 (Atual)
- ✅ Sistema de autenticação melhorado
- ✅ Interface redesenhada
- ✅ Geração de PDF otimizada
- ✅ Suporte a PWA
- ✅ Responsividade aprimorada

### v1.5.0
- ✅ Adicionado sistema de usuários
- ✅ Melhorias na calculadora
- ✅ Correções de bugs

## 🐛 Problemas Conhecidos

- Pop-ups podem ser bloqueados em alguns navegadores (configurar permissões)
- Dados são perdidos se o localStorage for limpo
- Suporte limitado a navegadores muito antigos

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu.email@exemplo.com

## 🙏 Agradecimentos

- Font Awesome pelos ícones
- Comunidade JavaScript pelas inspirações
- Profissionais do setor madeireiro pelos feedbacks

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões:

1. Abra uma [issue](https://github.com/seu-usuario/calculadora-madeira/issues)
2. Entre em contato por email
3. Consulte a [documentação](https://github.com/seu-usuario/calculadora-madeira/wiki)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐ 