/**
 * Auth Page Module - Calculadora de Madeira
 * Módulo responsável pela autenticação (login/registro/recuperação de senha)
 * Integrado com a arquitetura modular
 */

// Aguardar inicialização da aplicação principal
document.addEventListener('calculadoraMadeiraReady', (event) => {
    console.log('🔑 Inicializando módulo de autenticação...');
    
    const app = event.detail.app;
    initializeAuthPage(app);
});

/**
 * Inicializar página de autenticação
 */
function initializeAuthPage(app) {
    console.log('📝 Configurando página de autenticação...');
    
    // Verificar se usuário já está logado
    checkExistingLogin();
    
    // Configurar eventos dos formulários
    setupFormEvents(app);
    
    // Aplicar formatações se necessário
    if (app.getModule('formatters')) {
        applyFormattingToAuthForms(app.getModule('formatters'));
    }
    
    console.log('✅ Página de autenticação inicializada');
}

/**
 * Verificar se usuário já está logado
 */
function checkExistingLogin() {
    try {
        if (typeof isUserLoggedIn === 'function' && isUserLoggedIn()) {
            const user = getCurrentUser();
            console.log('👤 Usuário já logado:', user);
            
            if (typeof isPlanActive === 'function' && isPlanActive()) {
                window.location.href = 'calc.html';
            } else {
                window.location.href = 'planos.html';
            }
        }
    } catch (error) {
        console.warn('⚠️ Erro ao verificar login existente:', error);
    }
}

/**
 * Configurar eventos dos formulários
 */
function setupFormEvents(app) {
    // Eventos de navegação entre formulários
    window.toggleForms = () => {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm && registerForm) {
            const isLoginVisible = loginForm.style.display !== 'none';
            
            loginForm.style.display = isLoginVisible ? 'none' : 'block';
            registerForm.style.display = isLoginVisible ? 'block' : 'none';
            
            clearAllMessages();
            
            // Adicionar animação
            const visibleForm = isLoginVisible ? registerForm : loginForm;
            visibleForm.classList.add('auth-form-container', 'fade-in');
        }
    };
    
    // Função de login
    window.login = () => handleLogin(app);
    
    // Função de registro
    window.register = () => handleRegister(app);
    
    // Funções de recuperação de senha
    window.showResetPassword = () => showResetPasswordForm();
    window.showLogin = () => showLoginForm();
    window.requestPasswordReset = () => handlePasswordResetRequest(app);
    window.confirmPasswordReset = () => handlePasswordResetConfirmation(app);
    
    // Eventos de teclado para melhor UX
    setupKeyboardEvents();
    
    console.log('⌨️ Eventos dos formulários configurados');
}

/**
 * Configurar eventos de teclado
 */
function setupKeyboardEvents() {
    // Enter para submeter formulários
    const forms = ['loginForm', 'registerForm', 'resetPasswordForm'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach((input, index) => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        
                        // Se for o último input, submeter formulário
                        if (index === inputs.length - 1) {
                            const submitButton = form.querySelector('.auth-btn');
                            if (submitButton && submitButton.onclick) {
                                submitButton.onclick();
                            }
                        } else {
                            // Focar próximo input
                            inputs[index + 1]?.focus();
                        }
                    }
                });
            });
        }
    });
}

/**
 * Função de login
 */
function handleLogin(app) {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    // Validações básicas
    if (!email) {
        showError('login', 'Por favor, insira seu email');
        document.getElementById('loginEmail')?.focus();
        return;
    }
    
    if (!password) {
        showError('login', 'Por favor, insira sua senha');
        document.getElementById('loginPassword')?.focus();
        return;
    }
    
    // Mostrar loading
    setButtonLoading('loginButton', true, 'Entrar');
    
    try {
        // Usar função de autenticação do auth.js
        const user = loginUser(email, password);
        user.isLoggedIn = true;
        
        const users = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        localStorage.setItem('calc_madeira_auth', JSON.stringify(updatedUsers));
        
        // Armazenar ID do usuário atual
        localStorage.setItem('currentUserId', user.id);
        
        // Feedback de sucesso
        if (app.getModule('feedback')) {
            app.getModule('feedback').success('Login realizado com sucesso!');
        }
        
        // Redirecionar baseado no plano
        setTimeout(() => {
            if (typeof isPlanActive === 'function' && isPlanActive()) {
                window.location.href = 'calc.html';
            } else {
                window.location.href = 'planos.html';
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showError('login', error.message || 'Erro ao fazer login');
        
        if (app.getModule('feedback')) {
            app.getModule('feedback').error('Erro ao fazer login: ' + error.message);
        }
    } finally {
        setButtonLoading('loginButton', false, 'Entrar');
    }
}

/**
 * Função de registro
 */
function handleRegister(app) {
    const name = document.getElementById('registerName')?.value?.trim();
    const email = document.getElementById('registerEmail')?.value?.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    // Validações
    if (!name) {
        showError('register', 'Por favor, insira seu nome');
        document.getElementById('registerName')?.focus();
        return;
    }
    
    if (!email) {
        showError('register', 'Por favor, insira seu email');
        document.getElementById('registerEmail')?.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showError('register', 'Por favor, insira um email válido');
        document.getElementById('registerEmail')?.focus();
        return;
    }
    
    if (!password) {
        showError('register', 'Por favor, insira uma senha');
        document.getElementById('registerPassword')?.focus();
        return;
    }
    
    if (password.length < 6) {
        showError('register', 'A senha deve ter pelo menos 6 caracteres');
        document.getElementById('registerPassword')?.focus();
        return;
    }
    
    if (password !== confirmPassword) {
        showError('register', 'As senhas não coincidem');
        document.getElementById('confirmPassword')?.focus();
        return;
    }
    
    // Mostrar loading
    setButtonLoading('registerButton', true, 'Registrar');
    
    try {
        // Usar função de registro do auth.js
        const user = registerUser(email, password, name);
        user.isLoggedIn = true;
        
        const users = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        localStorage.setItem('calc_madeira_auth', JSON.stringify(updatedUsers));
        
        // Armazenar ID do usuário atual
        localStorage.setItem('currentUserId', user.id);
        
        // Feedback de sucesso
        if (app.getModule('feedback')) {
            app.getModule('feedback').success('Conta criada com sucesso!');
        }
        
        // Redirecionar
        setTimeout(() => {
            window.location.href = 'calc.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erro no registro:', error);
        showError('register', error.message || 'Erro ao criar conta');
        
        if (app.getModule('feedback')) {
            app.getModule('feedback').error('Erro ao criar conta: ' + error.message);
        }
    } finally {
        setButtonLoading('registerButton', false, 'Registrar');
    }
}

/**
 * Mostrar formulário de recuperação de senha
 */
function showResetPasswordForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'block';
    document.getElementById('resetCodeSection').style.display = 'none';
    
    const resetButton = document.getElementById('resetButton');
    resetButton.textContent = 'Enviar Código';
    resetButton.onclick = window.requestPasswordReset;
    
    clearResetForm();
    
    // Focar email
    setTimeout(() => {
        document.getElementById('resetEmail')?.focus();
    }, 100);
}

/**
 * Mostrar formulário de login
 */
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'none';
    
    clearAllMessages();
    
    // Focar email
    setTimeout(() => {
        document.getElementById('loginEmail')?.focus();
    }, 100);
}

/**
 * Solicitar código de recuperação de senha
 */
function handlePasswordResetRequest(app) {
    const email = document.getElementById('resetEmail')?.value?.trim();
    
    // Limpar mensagens anteriores
    clearResetMessages();
    
    // Validações
    if (!email) {
        showError('reset', 'Por favor, insira seu email');
        document.getElementById('resetEmail')?.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        showError('reset', 'Por favor, insira um email válido');
        document.getElementById('resetEmail')?.focus();
        return;
    }
    
    // Mostrar loading
    setButtonLoading('resetButton', true, 'Enviando...');
    
    // Simular delay de rede para melhor UX
    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem('calc_madeira_auth') || '[]');
            const user = users.find(u => u.email === email.toLowerCase());

            if (!user) {
                showError('reset', 'Email não encontrado. Verifique se o email está correto.');
                return;
            }

            // Gerar e salvar código de reset
            const resetCode = generateResetCode();
            saveResetCode(email.toLowerCase(), resetCode);

            // Mostrar código e seção de reset
            const successElement = document.getElementById('resetSuccess');
            successElement.innerHTML = `
                <strong>✅ Código enviado!</strong><br>
                <div class="auth-code-display">${resetCode}</div>
                <small>Em um ambiente real, este código seria enviado por email.</small>
            `;
            successElement.style.display = 'block';
            
            document.getElementById('resetCodeSection').style.display = 'block';
            
            const resetButton = document.getElementById('resetButton');
            resetButton.textContent = 'Redefinir Senha';
            resetButton.onclick = window.confirmPasswordReset;
            
            // Feedback via sistema modular
            if (app.getModule('feedback')) {
                app.getModule('feedback').success('Código de verificação gerado!');
            }
            
            // Focar no campo do código
            setTimeout(() => {
                document.getElementById('resetCode')?.focus();
            }, 200);
            
        } catch (error) {
            console.error('❌ Erro ao solicitar reset:', error);
            showError('reset', 'Erro interno. Tente novamente.');
            
            if (app.getModule('feedback')) {
                app.getModule('feedback').error('Erro ao solicitar recuperação de senha');
            }
        } finally {
            setButtonLoading('resetButton', false, 'Redefinir Senha');
        }
    }, 800);
}

/**
 * Confirmar recuperação de senha com código
 */
function handlePasswordResetConfirmation(app) {
    const email = document.getElementById('resetEmail')?.value?.trim().toLowerCase();
    const code = document.getElementById('resetCode')?.value?.trim();
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmNewPassword')?.value;

    // Limpar mensagens anteriores
    clearResetMessages();
    
    // Validações
    if (!code) {
        showError('reset', 'Por favor, insira o código de verificação');
        document.getElementById('resetCode')?.focus();
        return;
    }
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
        showError('reset', 'O código deve ter 6 dígitos numéricos');
        document.getElementById('resetCode')?.focus();
        return;
    }
    
    if (!newPassword) {
        showError('reset', 'Por favor, insira a nova senha');
        document.getElementById('newPassword')?.focus();
        return;
    }
    
    if (newPassword.length < 6) {
        showError('reset', 'A nova senha deve ter pelo menos 6 caracteres');
        document.getElementById('newPassword')?.focus();
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('reset', 'As senhas não coincidem');
        document.getElementById('confirmNewPassword')?.focus();
        return;
    }

    // Mostrar loading
    setButtonLoading('resetButton', true, 'Alterando...');
    
    // Simular delay de rede
    setTimeout(() => {
        try {
            // Usar função de reset do auth.js
            resetPassword(email, code, newPassword);
            
            // Sucesso
            const successElement = document.getElementById('resetSuccess');
            successElement.innerHTML = `
                <strong>✅ Senha alterada com sucesso!</strong><br>
                <small>Você será redirecionado para o login em alguns segundos...</small>
            `;
            successElement.style.display = 'block';
            
            // Feedback via sistema modular
            if (app.getModule('feedback')) {
                app.getModule('feedback').success('Senha alterada com sucesso!');
            }
            
            // Limpar formulário
            clearResetForm();
            
            // Redirecionar após delay
            setTimeout(() => {
                showLoginForm();
            }, 3000);
            
        } catch (error) {
            console.error('❌ Erro ao redefinir senha:', error);
            showError('reset', error.message);
            
            if (app.getModule('feedback')) {
                app.getModule('feedback').error('Erro ao redefinir senha: ' + error.message);
            }
            
            // Se o código expirou ou excedeu tentativas, voltar ao primeiro passo
            if (error.message.includes('expirado') || error.message.includes('excedido')) {
                setTimeout(() => {
                    document.getElementById('resetCodeSection').style.display = 'none';
                    const resetButton = document.getElementById('resetButton');
                    resetButton.textContent = 'Enviar Código';
                    resetButton.onclick = window.requestPasswordReset;
                    clearResetForm();
                }, 2000);
            }
        } finally {
            setButtonLoading('resetButton', false, 'Redefinir Senha');
        }
    }, 800);
}

/**
 * Aplicar formatações aos formulários de auth
 */
function applyFormattingToAuthForms(formatters) {
    // Aplicar máscaras se necessário
    console.log('🎨 Aplicando formatações aos formulários de autenticação');
}

/**
 * Utility Functions
 */

function showError(form, message) {
    const errorElement = document.getElementById(form + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('auth-error-message');
    }
}

function clearAllMessages() {
    const errorElements = document.querySelectorAll('.auth-message, .error-message, .success-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

function clearResetMessages() {
    document.getElementById('resetError').style.display = 'none';
    document.getElementById('resetSuccess').style.display = 'none';
}

function clearResetForm() {
    const fields = ['resetEmail', 'resetCode', 'newPassword', 'confirmNewPassword'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    clearResetMessages();
}

function setButtonLoading(buttonId, isLoading, originalText) {
    const button = document.getElementById(buttonId) || 
                   document.querySelector(`[onclick*="${buttonId}"]`) ||
                   document.querySelector('.auth-btn');
    
    if (button) {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Processando...';
            button.classList.add('auth-loading');
        } else {
            button.disabled = false;
            button.textContent = originalText;
            button.classList.remove('auth-loading');
        }
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Disponibilizar funções globalmente para compatibilidade
window.AuthPageModule = {
    showError,
    clearAllMessages,
    setButtonLoading,
    validateEmail
};

console.log('📦 Módulo de autenticação carregado'); 