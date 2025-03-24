// Gerenciamento de autenticação e planos
const AUTH_KEY = 'calc_madeira_auth';
const PLAN_KEY = 'calc_madeira_plan';

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