const STORAGE_KEYS = {
  users: 'moneyflow_users',
  currentUser: 'moneyflow_current_user',
  transactions: 'moneyflow_transactions',
  categories: 'moneyflow_categories',
  theme: 'moneyflow_theme',
  profiles: 'moneyflow_profiles',
  goals: 'moneyflow_goals'
};

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function readData(key, fallback) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.warn('Erro ao interpretar LocalStorage:', error);
    return fallback;
  }
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function getCurrentUser() {
  return readData(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  saveData(STORAGE_KEYS.currentUser, user);
}

function getUsers() {
  return readData(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  saveData(STORAGE_KEYS.users, users);
}

function notifyFinancialDataChanged() {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moneyflow:data-changed'));
  }
}

function getTransactions() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  return readData(STORAGE_KEYS.transactions, []).filter((item) => item.userId === currentUser.id);
}

function saveTransactions(items) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const allTransactions = readData(STORAGE_KEYS.transactions, []);
  const filteredTransactions = allTransactions.filter((item) => item.userId !== currentUser.id);
  const normalizedItems = items.map((item) => ({ ...item, userId: currentUser.id }));
  saveData(STORAGE_KEYS.transactions, [...filteredTransactions, ...normalizedItems]);
  notifyFinancialDataChanged();
  return normalizedItems;
}

function getCategories() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  return readData(STORAGE_KEYS.categories, []).filter((item) => item.userId === currentUser.id);
}

function saveCategories(items) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const allCategories = readData(STORAGE_KEYS.categories, []);
  const filteredCategories = allCategories.filter((item) => item.userId !== currentUser.id);
  const normalizedItems = items.map((item) => ({ ...item, userId: currentUser.id }));

  saveData(STORAGE_KEYS.categories, [...filteredCategories, ...normalizedItems]);
  notifyFinancialDataChanged();
  return normalizedItems;
}

function getStoredTheme() {
  return readData(STORAGE_KEYS.theme, 'dark');
}

function setStoredTheme(theme) {
  saveData(STORAGE_KEYS.theme, theme);
}

function getUserProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return null;
  }

  const profile = readData(STORAGE_KEYS.profiles, []).find((item) => item.userId === currentUser.id);
  const accent = profile?.accent;

  return {
    userId: currentUser.id,
    accent: typeof accent === 'string' && /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#38bdf8'
  };
}

function saveUserProfile(profile) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return null;
  }

  const profiles = readData(STORAGE_KEYS.profiles, []).filter((item) => item.userId !== currentUser.id);
  const accent = typeof profile.accent === 'string' && /^#[0-9a-f]{6}$/i.test(profile.accent)
    ? profile.accent
    : '#38bdf8';
  const updatedProfile = { userId: currentUser.id, accent };

  saveData(STORAGE_KEYS.profiles, [...profiles, updatedProfile]);
  return updatedProfile;
}

function getGoals() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  return readData(STORAGE_KEYS.goals, []).filter((goal) => goal.userId === currentUser.id);
}

function saveGoals(goals) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const allGoals = readData(STORAGE_KEYS.goals, []).filter((goal) => goal.userId !== currentUser.id);
  const userGoals = goals.map((goal) => ({ ...goal, userId: currentUser.id }));
  saveData(STORAGE_KEYS.goals, [...allGoals, ...userGoals]);
  return userGoals;
}

const defaultCategories = {
  income: [
    { name: 'Salário', icon: '💼', color: '#16c784' },
    { name: 'Freelance', icon: '💻', color: '#15b8a6' },
    { name: 'Investimentos', icon: '📈', color: '#38bdf8' },
    { name: 'Vendas', icon: '🛍️', color: '#8b5cf6' },
    { name: 'Outros', icon: '💸', color: '#f59e0b' }
  ],
  expense: [
    { name: 'Alimentação', icon: '🍽️', color: '#f97316' },
    { name: 'Transporte', icon: '🚗', color: '#ef4444' },
    { name: 'Moradia', icon: '🏠', color: '#a78bfa' },
    { name: 'Saúde', icon: '⚕️', color: '#22c55e' },
    { name: 'Educação', icon: '📚', color: '#3b82f6' },
    { name: 'Lazer', icon: '🎉', color: '#f59e0b' },
    { name: 'Compras', icon: '🛒', color: '#ec4899' },
    { name: 'Contas', icon: '🧾', color: '#6366f1' },
    { name: 'Outros', icon: '📌', color: '#94a3b8' }
  ]
};

function ensureDefaultCategories() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const categories = getCategories();
  if (categories.length > 0) {
    return categories;
  }

  const newDefaultCategories = [];

  Object.entries(defaultCategories).forEach(([type, items]) => {
    items.forEach((category) => {
      newDefaultCategories.push({
        id: generateId('category'),
        userId: currentUser.id,
        type,
        name: category.name,
        icon: category.icon,
        color: category.color
      });
    });
  });

  saveCategories(newDefaultCategories);
  return newDefaultCategories;
}
