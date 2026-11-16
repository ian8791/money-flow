document.addEventListener('DOMContentLoaded', () => {
  const theme = getStoredTheme();
  applyTheme(theme);
  initCommonUi();

  const currentUser = getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const publicPages = ['login.html', 'cadastro.html'];

  if (!currentUser && currentPage === 'index.html') {
    window.location.href = 'pages/login.html';
    return;
  }

  if (!currentUser && !publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
    return;
  }

  if (currentUser && publicPages.includes(currentPage)) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (currentUser) {
    ensureDefaultCategories();
  }
});

function initCommonUi() {
  const themeToggleButton = document.querySelector('[data-theme-toggle]');
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  }

  const logoutButton = document.querySelector('[data-action="logout"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      showToast('Sessão encerrada com sucesso.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 600);
    });
  }

  const user = getCurrentUser();
  if (user) {
    const userNameElement = document.querySelector('[data-user-name]');
    const userInitialsElement = document.querySelector('[data-user-initials]');

    if (userNameElement) {
      userNameElement.textContent = user.name || 'Usuário';
    }

    if (userInitialsElement) {
      const initials = user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
      userInitialsElement.textContent = initials || 'U';
    }
  }

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.includes(page)) {
      link.classList.add('active');
    }
  });
}

function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', nextTheme);
  setStoredTheme(nextTheme);

  const themeToggleButton = document.querySelector('[data-theme-toggle]');
  if (themeToggleButton) {
    const icon = nextTheme === 'dark' ? '☀️' : '🌙';
    themeToggleButton.textContent = icon;
  }
}

function formatCurrency(value) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue);
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Data indisponível';
  }

  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function confirmDelete(message) {
  return window.confirm(message);
}

function getMonthlyName(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function getCategoryById(categoryId) {
  const categories = getCategories();
  return categories.find((category) => category.id === categoryId) || null;
}

function getFinancialSummary() {
  const transactions = getTransactions();

  const totals = transactions.reduce(
    (accumulator, transaction) => {
      const value = Number(transaction.value || 0);

      if (transaction.type === 'income') {
        accumulator.income += value;
      } else {
        accumulator.expense += value;
      }

      return accumulator;
    },
    { income: 0, expense: 0 }
  );

  const summary = {
    ...totals,
    balance: totals.income - totals.expense,
    totalTransactions: transactions.length,
    recentTransactions: [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    monthMap: buildMonthlySummary(transactions)
  };

  return summary;
}

function buildMonthlySummary(transactions) {
  const monthsMap = {};

  transactions.forEach((transaction) => {
    const key = new Date(transaction.date).toISOString().slice(0, 7);
    if (!monthsMap[key]) {
      monthsMap[key] = { income: 0, expense: 0 };
    }

    if (transaction.type === 'income') {
      monthsMap[key].income += Number(transaction.value || 0);
    } else {
      monthsMap[key].expense += Number(transaction.value || 0);
    }
  });

  return Object.entries(monthsMap)
    .map(([month, values]) => ({
      month,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function renderSimpleLegend(items) {
  const legend = document.createElement('div');
  legend.className = 'legend';

  items.forEach((item) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    legendItem.innerHTML = `<span class="legend-dot" style="background:${item.color};"></span>${item.label}`;
    legend.appendChild(legendItem);
  });

  return legend;
}

function buildBarChart(canvasId, labels, values, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 500;
  const height = canvas.clientHeight || 260;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 24, right: 20, bottom: 32, left: 32 };
  const maxValue = Math.max(...values, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / labels.length * 0.6;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;

  for (let step = 0; step <= 4; step += 1) {
    const y = padding.top + (chartHeight / 4) * step;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  labels.forEach((label, index) => {
    const barHeight = (values[index] / maxValue) * chartHeight;
    const x = padding.left + index * (chartWidth / labels.length) + 18;
    const y = padding.top + chartHeight - barHeight;

    ctx.fillStyle = colors[index] || '#38bdf8';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--muted').trim();
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + barWidth / 2, height - 12);
  });
}

function buildLineChart(canvasId, labels, incomeValues, expenseValues) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 240;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 24, right: 20, bottom: 26, left: 26 };
  const maxValue = Math.max(...incomeValues, ...expenseValues, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const toPoint = (value, index) => {
    const x = padding.left + (index * chartWidth) / Math.max(labels.length - 1, 1);
    const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
    return { x, y };
  };

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.beginPath();
  for (let y = 0; y <= 4; y += 1) {
    const currentY = padding.top + (chartHeight / 4) * y;
    ctx.moveTo(padding.left, currentY);
    ctx.lineTo(width - padding.right, currentY);
  }
  ctx.stroke();

  const drawSeries = (series, color) => {
    ctx.beginPath();
    series.forEach((value, index) => {
      const point = toPoint(value, index);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  drawSeries(incomeValues, '#16c784');
  drawSeries(expenseValues, '#ff5f6d');

  labels.forEach((label, index) => {
    const x = padding.left + (index * chartWidth) / Math.max(labels.length - 1, 1);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--muted').trim();
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, height - 8);
  });
}

function buildDonutChart(canvasId, segments) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 260;
  const radius = 78;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  segments.forEach((segment) => {
    const slice = (segment.value / total) * Math.PI * 2;
    const endAngle = startAngle + slice;

    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.arc(size / 2, size / 2, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segment.color;
    ctx.fill();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 42, 0, Math.PI * 2);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--panel').trim();
  ctx.fill();

  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text').trim();
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total', size / 2, size / 2 - 5);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--muted').trim();
  ctx.fillText(formatCurrency(total), size / 2, size / 2 + 18);
}
