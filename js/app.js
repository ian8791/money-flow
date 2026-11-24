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
  applyProfileAccent();
  initFeatureNavigation();

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
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href && href.includes(page)) {
      link.classList.add('active');
    }
  });
}

function initFeatureNavigation() {
  const nav = document.querySelector('.sidebar-nav');
  if (!nav) {
    return;
  }

  const links = [
    ['dashboard.html', '📊', 'Dashboard'],
    ['movimentacoes.html', '🧾', 'Movimentações'],
    ['categorias.html', '🏷️', 'Categorias'],
    ['relatorios.html', '📈', 'Relatórios'],
    ['perfil.html', '👤', 'Perfil'],
    ['metas.html', '🎯', 'Metas'],
    ['dicas.html', '💡', 'Dicas de economia'],
    ['conversor.html', '💱', 'Conversor']
  ];

  links.forEach(([href, icon, label]) => {
    if (nav.querySelector(`a[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('a');
    link.href = href;
    link.className = 'nav-link';
    link.innerHTML = `<span class="icon">${icon}</span>${label}`;
    nav.appendChild(link);
  });
}

function applyProfileAccent() {
  const profile = getUserProfile();
  const accent = profile?.accent || '#38bdf8';
  const red = parseInt(accent.slice(1, 3), 16);
  const green = parseInt(accent.slice(3, 5), 16);
  const blue = parseInt(accent.slice(5, 7), 16);

  document.body.style.setProperty('--profile-accent', accent);
  document.body.style.setProperty('--profile-accent-soft', `rgba(${red}, ${green}, ${blue}, 0.16)`);
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

function getExpenseCategoryTotals(period = '') {
  const categories = getCategories().filter((category) => category.type === 'expense');
  const transactions = getTransactions().filter((transaction) =>
    transaction.type === 'expense' && (!period || transaction.date.startsWith(period))
  );
  const totals = new Map(categories.map((category) => [category.id, {
    id: category.id,
    name: category.name,
    color: category.color || '#94a3b8',
    value: 0,
    transactions: 0
  }]));

  transactions.forEach((transaction) => {
    const category = totals.get(transaction.categoryId);
    if (category) {
      category.value += Number(transaction.value || 0);
      category.transactions += 1;
    }
  });

  const result = [...totals.values()].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const total = result.reduce((sum, item) => sum + item.value, 0);

  return result.map((item) => ({
    ...item,
    percentage: total ? (item.value / total) * 100 : 0
  }));
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
    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.background = item.color;

    const label = document.createElement('span');
    label.textContent = item.label;
    legendItem.append(dot, label);
    legend.appendChild(legendItem);
  });

  return legend;
}

function bindChartDetails(canvas, logicalWidth, logicalHeight, resolveDetails) {
  if (!canvas) {
    return;
  }

  const wrapper = canvas.parentElement;
  let tooltip = wrapper.querySelector('.chart-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    wrapper.appendChild(tooltip);
  }
  canvas.tabIndex = 0;
  let pinned = false;

  const updateTooltip = (event) => {
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: (event.clientX - rect.left) * logicalWidth / rect.width,
      y: (event.clientY - rect.top) * logicalHeight / rect.height
    };
    const details = resolveDetails(point);

    if (!details) {
      tooltip.classList.remove('is-visible');
      return;
    }

    tooltip.textContent = details.join('\n');
    tooltip.classList.add('is-visible');
  };

  canvas.onpointermove = (event) => {
    if (!pinned) {
      updateTooltip(event);
    }
  };
  canvas.onclick = (event) => {
    pinned = !pinned;
    if (pinned) {
      updateTooltip(event);
    } else {
      tooltip.classList.remove('is-visible');
    }
  };
  canvas.onpointerleave = () => {
    if (!pinned) {
      tooltip.classList.remove('is-visible');
    }
  };
  canvas.onkeydown = (event) => {
    if (event.key === 'Escape') {
      pinned = false;
      tooltip.classList.remove('is-visible');
    }
  };
}

function buildBarChart(canvasId, labels, values, colors) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !labels.length) {
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

  const totalMagnitude = values.reduce((sum, value) => sum + Math.abs(value), 0);
  bindChartDetails(canvas, width, height, ({ x, y }) => {
    if (x < padding.left || x > width - padding.right || y < padding.top || y > height - padding.bottom) {
      return null;
    }

    const index = Math.floor((x - padding.left) / (chartWidth / labels.length));
    if (index < 0 || index >= labels.length) {
      return null;
    }

    const share = totalMagnitude ? Math.abs(values[index]) / totalMagnitude * 100 : 0;
    return [labels[index], `Saldo: ${formatCurrency(values[index])}`, `${share.toFixed(1)}% do saldo absoluto exibido`];
  });
}

function buildLineChart(canvasId, labels, incomeValues, expenseValues, detailLabels = labels) {
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

  bindChartDetails(canvas, width, height, ({ x, y }) => {
    if (x < padding.left || x > width - padding.right || y < padding.top || y > height - padding.bottom || !labels.length) {
      return null;
    }

    const index = Math.round((x - padding.left) / chartWidth * Math.max(labels.length - 1, 0));
    const monthlyTotal = Number(incomeValues[index] || 0) + Number(expenseValues[index] || 0);
    const incomeShare = monthlyTotal ? Number(incomeValues[index] || 0) / monthlyTotal * 100 : 0;
    return [
      detailLabels[index] || labels[index],
      `Receitas: ${formatCurrency(incomeValues[index])}`,
      `Despesas: ${formatCurrency(expenseValues[index])}`,
      `${incomeShare.toFixed(1)}% das movimentações do mês são receitas`
    ];
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

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const denominator = total || 1;
  let startAngle = -Math.PI / 2;

  segments.forEach((segment) => {
    const slice = (segment.value / denominator) * Math.PI * 2;
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

  bindChartDetails(canvas, size, size, ({ x, y }) => {
    const deltaX = x - size / 2;
    const deltaY = y - size / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < 42 || distance > radius || !segments.length) {
      return null;
    }

    let angle = Math.atan2(deltaY, deltaX) + Math.PI / 2;
    if (angle < 0) {
      angle += Math.PI * 2;
    }

    let currentAngle = 0;
    const segment = segments.find((item) => {
      const slice = (item.value / total) * Math.PI * 2;
      const matches = angle >= currentAngle && angle <= currentAngle + slice;
      currentAngle += slice;
      return matches;
    });

    if (!segment) {
      return null;
    }

    const percentage = segment.value / denominator * 100;
    return [segment.label || 'Categoria', formatCurrency(segment.value), `${percentage.toFixed(1)}% das despesas exibidas`];
  });
}
