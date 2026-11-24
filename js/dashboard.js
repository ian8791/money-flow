document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboardSummary')) {
    initDashboardPage();
  }
});

window.addEventListener('moneyflow:data-changed', initDashboardPage);
window.addEventListener('storage', (event) => {
  if ([STORAGE_KEYS.transactions, STORAGE_KEYS.categories].includes(event.key)) {
    initDashboardPage();
  }
});

function initDashboardPage() {
  const summary = getFinancialSummary();
  const currentDate = new Date();

  document.querySelector('[data-current-date]').textContent = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  document.getElementById('totalIncome').textContent = formatCurrency(summary.income);
  document.getElementById('totalExpenses').textContent = formatCurrency(summary.expense);
  document.getElementById('totalBalance').textContent = formatCurrency(summary.balance);
  document.getElementById('totalTransactions').textContent = summary.totalTransactions;

  const monthLabels = summary.monthMap.length ? summary.monthMap.map((item) => item.month.slice(5)) : ['Jan', 'Fev', 'Mar'];
  const incomeSeries = summary.monthMap.length ? summary.monthMap.map((item) => item.income) : [0, 0, 0];
  const expenseSeries = summary.monthMap.length ? summary.monthMap.map((item) => item.expense) : [0, 0, 0];

  const monthDetails = summary.monthMap.slice(-6).map((item) => getMonthlyName(item.month));
  buildLineChart('incomeExpenseChart', monthLabels.slice(-6), incomeSeries.slice(-6), expenseSeries.slice(-6), monthDetails);

  const categoryTotals = getExpenseCategoryTotals().slice(0, 5);
  buildDonutChart('categoryChart', categoryTotals.map((item) => ({
    label: item.name,
    value: item.value,
    color: item.color
  })));

  const legend = renderSimpleLegend(categoryTotals.map((item) => ({
    label: `${item.name} (${item.percentage.toFixed(1)}%)`,
    color: item.color
  })));
  const chartCard = document.getElementById('categoryChart').closest('.panel-card');
  if (chartCard) {
    const existingLegend = chartCard.querySelector('.legend');
    if (existingLegend) existingLegend.remove();
    chartCard.appendChild(legend);
  }

  renderRecentTransactions(summary.recentTransactions);
  renderMonthlySummary(summary.monthMap.slice(-5));
}

function renderRecentTransactions(transactions) {
  const container = document.getElementById('recentTransactionsContainer');
  if (!container) {
    return;
  }

  if (!transactions.length) {
    container.innerHTML = '<div class="empty-state">Nenhuma movimentação cadastrada ainda.</div>';
    return;
  }

  const rows = transactions
    .map((item) => {
      const category = getCategoryById(item.categoryId) || { name: item.category || 'Sem categoria', color: '#94a3b8' };
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="tag" style="background:${category.color}22;color:${category.color};">${category.icon || '•'}</span>
              <div>
                <strong>${item.description}</strong><br>
                <small style="color:var(--muted)">${category.name}</small>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${item.type === 'income' ? 'income' : 'expense'}">${item.type === 'income' ? 'Receita' : 'Despesa'}</span>
          </td>
          <td>${formatCurrency(item.value)}</td>
          <td>${formatDate(item.date)}</td>
        </tr>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderMonthlySummary(months) {
  const container = document.getElementById('monthlySummaryContainer');
  if (!container) {
    return;
  }

  if (!months.length) {
    container.innerHTML = '<div class="empty-state">Sem dados mensais.</div>';
    return;
  }

  const cards = months
    .map((month) => `
      <div class="total-box ${month.balance < 0 ? 'expense' : ''}" style="margin-bottom: 12px;">
        <div>
          <small>${getMonthlyName(month.month)}</small>
        </div>
        <strong>${formatCurrency(month.balance)}</strong>
      </div>
    `)
    .join('');

  container.innerHTML = cards;
}

window.addEventListener('resize', () => {
  if (document.getElementById('dashboardSummary')) {
    initDashboardPage();
  }
});
