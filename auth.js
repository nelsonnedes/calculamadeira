// Gerenciamento de autenticação e planos
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const PLAN_KEY = 'plan';

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
function registerUser(name, email, password) {
    // Carregar usuários existentes
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // Verificar se o e-mail já está cadastrado
    if (users.some(user => user.email === email)) {
        return false;
    }

    // Criar novo usuário
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password, // Em produção, usar hash da senha
        plan: 'free',
        createdAt: new Date().toISOString(),
        lastLogin: null
    };

    // Adicionar usuário à lista
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return true;
}

function loginUser(email, password) {
    // Carregar usuários
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // Buscar usuário
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return false;
    }

    // Atualizar último login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Salvar usuário atual
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return true;
}

function logoutUser() {
    // Carregar usuário atual
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Carregar todos os usuários
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // Atualizar último login do usuário
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].lastLogin = currentUser.lastLogin;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Remover usuário atual
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

function updateUserPlan(planType, duration) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    // Carregar todos os usuários
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // Encontrar e atualizar usuário
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) return false;

    // Calcular data de término
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + duration);

    // Atualizar plano
    users[userIndex].plan = planType;
    users[userIndex].planEndDate = endDate.toISOString();

    // Salvar alterações
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    localStorage.setItem(PLAN_KEY, JSON.stringify({
        type: planType,
        startDate: now.toISOString(),
        endDate: endDate.toISOString()
    }));

    return true;
}

// Funções de verificação
function isLoggedIn() {
    return !!getCurrentUser();
}

function isPlanActive() {
    const plan = JSON.parse(localStorage.getItem(PLAN_KEY));
    if (!plan) return false;

    const now = new Date();
    const endDate = new Date(plan.endDate);
    return now < endDate;
}

function getPlanInfo() {
    const plan = JSON.parse(localStorage.getItem(PLAN_KEY));
    if (!plan) return null;

    const now = new Date();
    const endDate = new Date(plan.endDate);
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    return {
        type: plan.type,
        daysLeft: daysLeft,
        isActive: daysLeft > 0
    };
}

function hasPremiumAccess() {
    const planInfo = getPlanInfo();
    return planInfo && planInfo.isActive && planInfo.type !== 'free';
}

// Exportar funções para uso em outros arquivos
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isPlanActive = isPlanActive;
window.updateUserPlan = updateUserPlan;
window.getPlanInfo = getPlanInfo;
window.hasPremiumAccess = hasPremiumAccess; 