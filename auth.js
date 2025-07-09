// Gerenciamento de autenticação e planos
const AUTH_KEY = 'calc_madeira_auth';
const PLAN_KEY = 'calc_madeira_plan';
const RESET_CODES_KEY = 'calc_madeira_reset_codes';

// Estrutura de planos
const PLANS = {
    FREE: {
        id: 'free',
        name: 'Plano Gratuito',
        price: 0,
        duration: 30, // dias
        features: ['Cálculos básicos', 'Relatórios simples', 'Suporte por email']
    },
    MONTHLY: {
        id: 'monthly',
        name: 'Plano Mensal',
        price: 10,
        duration: 30, // dias
        features: ['Cálculos avançados', 'Relatórios detalhados', 'Suporte prioritário', 'Backup automático']
    },
    YEARLY: {
        id: 'yearly',
        name: 'Plano Anual',
        price: 120,
        duration: 365, // dias
        features: ['Cálculos avançados', 'Relatórios detalhados', 'Suporte prioritário', 'Backup automático', 'Desconto de 50%']
    }
};

// Funções de autenticação
function registerUser(email, password, name) {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    
    if (users.some(user => user.email === email)) {
        throw new Error('Email já cadastrado');
    }

    const user = {
        id: Date.now().toString(),
        email,
        password: btoa(password), // Criptografia básica
        name,
        createdAt: new Date().toISOString(),
        plan: {
            type: 'free',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        }
    };

    users.push(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    return user;
}

function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === btoa(password));

    if (!user) {
        throw new Error('Email ou senha inválidos');
    }

    // Verificar se o plano expirou
    const now = new Date();
    const planEndDate = new Date(user.plan.endDate);
    
    if (now > planEndDate && user.plan.type === 'free') {
        user.plan = {
            type: 'expired',
            startDate: null,
            endDate: null
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(users));
        throw new Error('Seu período de teste expirou. Por favor, escolha um plano.');
    }

    return user;
}

function getCurrentUser() {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    return users.find(u => u.isLoggedIn);
}

function logoutUser() {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const updatedUsers = users.map(user => ({ ...user, isLoggedIn: false }));
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUsers));
    
    // Limpar dados específicos do usuário
    localStorage.removeItem('woodList');
    localStorage.removeItem('calc_madeira_reset_codes');
    
    // Redirecionar para a página de login
    window.location.href = 'index.html';
}

function updateUserPlan(userId, planType) {
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
    }

    const plan = PLANS[planType.toUpperCase()];
    if (!plan) {
        throw new Error('Plano inválido');
    }

    users[userIndex].plan = {
        type: plan.id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    return users[userIndex];
}

// Funções de verificação
function isUserLoggedIn() {
    return !!getCurrentUser();
}

function isPlanActive() {
    const user = getCurrentUser();
    if (!user) return false;

    const now = new Date();
    const planEndDate = new Date(user.plan.endDate);
    return now <= planEndDate;
}

function getPlanDetails() {
    const user = getCurrentUser();
    if (!user) return null;

    return {
        ...PLANS[user.plan.type.toUpperCase()],
        startDate: user.plan.startDate,
        endDate: user.plan.endDate
    };
}

// Função para validar força da senha
function validatePasswordStrength(password) {
    const errors = [];
    
    if (!password || password.length < 6) {
        errors.push('A senha deve ter pelo menos 6 caracteres');
    }
    
    if (password.length > 50) {
        errors.push('A senha deve ter no máximo 50 caracteres');
    }
    
    if (!/[a-zA-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('A senha deve conter pelo menos um número');
    }
    
    // Verificar caracteres comuns perigosos
    if (/[<>'"&]/.test(password)) {
        errors.push('A senha contém caracteres não permitidos');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Função para sanitizar email
function sanitizeEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
}

// Funções de recuperação de senha
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function saveResetCode(email, code) {
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    resetCodes[email] = {
        code,
        timestamp: Date.now(),
        attempts: 0
    };
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
}

function verifyResetCode(email, code) {
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    const resetInfo = resetCodes[email];
    
    if (!resetInfo) {
        throw new Error('Código de verificação expirado ou inválido');
    }

    // Verificar se o código expirou (30 minutos)
    if (Date.now() - resetInfo.timestamp > 30 * 60 * 1000) {
        delete resetCodes[email];
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error('Código de verificação expirado');
    }

    // Verificar tentativas máximas (3 tentativas)
    if (resetInfo.attempts >= 3) {
        delete resetCodes[email];
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error('Número máximo de tentativas excedido');
    }

    // Verificar código
    if (resetInfo.code !== code) {
        resetInfo.attempts++;
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error('Código de verificação incorreto');
    }

    // Código correto - limpar dados de reset
    delete resetCodes[email];
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
    return true;
}

function resetPassword(email, code, newPassword) {
    // Sanitizar e validar entrada
    email = sanitizeEmail(email);
    
    if (!email) {
        throw new Error('Email é obrigatório');
    }
    
    if (!code || !code.trim()) {
        throw new Error('Código de verificação é obrigatório');
    }
    
    // Validar força da senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]); // Mostrar primeiro erro
    }

    // Verificar código de reset
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    const resetInfo = resetCodes[email];
    
    if (!resetInfo) {
        throw new Error('Código de verificação expirado ou inválido');
    }

    // Verificar se o código expirou (30 minutos)
    if (Date.now() - resetInfo.timestamp > 30 * 60 * 1000) {
        delete resetCodes[email];
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error('Código de verificação expirado. Solicite um novo código.');
    }

    // Verificar tentativas máximas (3 tentativas)
    if (resetInfo.attempts >= 3) {
        delete resetCodes[email];
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error('Número máximo de tentativas excedido. Solicite um novo código.');
    }

    // Verificar código
    if (resetInfo.code !== code) {
        resetInfo.attempts++;
        resetCodes[email] = resetInfo;
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
        throw new Error(`Código de verificação incorreto. Tentativas restantes: ${3 - resetInfo.attempts}`);
    }

    // Buscar usuário
    const users = JSON.parse(localStorage.getItem(AUTH_KEY) || '[]');
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        throw new Error('Usuário não encontrado');
    }

    // Atualizar senha
    users[userIndex].password = btoa(newPassword);
    users[userIndex].passwordUpdatedAt = new Date().toISOString();
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
    
    // Limpar código de reset após sucesso
    delete resetCodes[email];
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
    
    return true;
} 