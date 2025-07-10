# Contribuindo para a Calculadora de Madeira

Obrigado por considerar contribuir para este projeto! 🎉

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Desenvolvimento](#desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)

## 📜 Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você deve seguir este código.

## 🤝 Como Contribuir

Existem várias maneiras de contribuir:

### 🐛 Reportando Bugs
- Use o template de issue para bugs
- Inclua passos para reproduzir o problema
- Adicione screenshots se aplicável
- Mencione seu navegador e versão

### 💡 Sugerindo Melhorias
- Use o template de issue para features
- Explique o problema que a feature resolve
- Descreva a solução proposta
- Considere alternativas

### 🔧 Contribuindo com Código
- Faça fork do projeto
- Crie uma branch para sua feature
- Implemente as mudanças
- Adicione testes se necessário
- Faça commit das mudanças
- Abra um Pull Request

## 🐛 Reportando Bugs

Antes de reportar um bug:

1. **Verifique se já existe** uma issue similar
2. **Teste na versão mais recente** do projeto
3. **Colete informações** sobre o ambiente

### Template para Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [ex: Windows 10]
- Navegador: [ex: Chrome 91]
- Versão: [ex: 2.0.0]
```

## 💡 Sugerindo Melhorias

### Template para Feature Request

```markdown
**Sua feature request está relacionada a um problema?**
Uma descrição clara do problema.

**Descreva a solução que você gostaria**
Uma descrição clara da solução.

**Descreva alternativas consideradas**
Outras soluções ou features consideradas.

**Contexto adicional**
Qualquer outro contexto sobre a feature.
```

## 🔧 Desenvolvimento

### Pré-requisitos

- Navegador web moderno
- Editor de código (VS Code recomendado)
- Servidor local (Python, Node.js, ou Live Server)

### Configuração do Ambiente

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/calculadora-madeira.git
   cd calculadora-madeira
   ```

2. **Inicie um servidor local**
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # Live Server (VS Code)
   # Clique com botão direito no index.html
   ```

3. **Acesse a aplicação**
   ```
   http://localhost:8000
   ```

### Estrutura do Projeto

```
calculadora-madeira/
├── index.html              # Página de login
├── calc.html               # Calculadora principal
├── orcamentos.html         # Lista de orçamentos
├── perfil.html             # Perfil do usuário
├── configuracoes.html      # Configurações
├── styles.css              # Estilos principais
├── manifest.json           # Manifest PWA
├── service-worker.js       # Service Worker
└── icons/                  # Ícones da aplicação
```

## 📝 Padrões de Código

### HTML
- Use HTML5 semântico
- Adicione atributos `aria-*` para acessibilidade
- Valide o HTML com o W3C Validator

### CSS
- Use metodologia BEM para nomes de classes
- Organize por componentes
- Use variáveis CSS para cores e espaçamentos
- Mantenha responsividade

### JavaScript
- Use ES6+ features
- Mantenha funções pequenas e focadas
- Adicione comentários para lógica complexa
- Use nomes descritivos para variáveis

### Exemplo de Código

```javascript
// ✅ Bom
function calculateWoodVolume(length, width, height) {
    // Converte centímetros para metros
    const lengthInMeters = length / 100;
    const widthInMeters = width / 100;
    const heightInMeters = height / 100;
    
    return lengthInMeters * widthInMeters * heightInMeters;
}

// ❌ Evite
function calc(l, w, h) {
    return (l/100) * (w/100) * (h/100);
}
```

## 🔄 Processo de Pull Request

1. **Faça fork do projeto**
2. **Crie uma branch**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

3. **Faça suas mudanças**
4. **Teste suas mudanças**
5. **Commit suas mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

6. **Push para sua branch**
   ```bash
   git push origin feature/nova-funcionalidade
   ```

7. **Abra um Pull Request**

### Padrões de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas de manutenção

### Checklist do Pull Request

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (se aplicável)
- [ ] Documentação atualizada
- [ ] Mudanças testadas em diferentes navegadores
- [ ] Responsividade verificada
- [ ] Acessibilidade considerada

## 🧪 Testes

### Testes Manuais

- Teste em diferentes navegadores
- Teste em diferentes tamanhos de tela
- Teste funcionalidades offline (PWA)
- Teste acessibilidade com leitor de tela

### Checklist de Testes

- [ ] Calculadora funciona corretamente
- [ ] Orçamentos são salvos e carregados
- [ ] PDFs são gerados corretamente
- [ ] Interface é responsiva
- [ ] PWA funciona offline
- [ ] Navegação entre páginas funciona

## 📞 Precisa de Ajuda?

- Abra uma [issue](https://github.com/seu-usuario/calculadora-madeira/issues)
- Entre em contato por email
- Consulte a [documentação](README.md)

## 🎉 Reconhecimento

Todos os contribuidores serão reconhecidos no README.md e releases.

Obrigado por contribuir! 🚀 