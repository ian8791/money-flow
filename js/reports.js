document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reportTitle')) {
    document.getElementById('reportCategoryPeriod').addEventListener('change', renderExpenseCategoryReport);
    initReportsPage();
  }
});

window.addEventListener('moneyflow:data-changed', initReportsPage);
window.addEventListener('storage', (event) => {
  if ([STORAGE_KEYS.transactions, STORAGE_KEYS.categories].includes(event.key)) {
    initReportsPage();
  }
});

function initReportsPage() {
  const monthlyData = buildMonthlySummary(getTransactions());
  const labels = monthlyData.length ? monthlyData.map((item) => item.month.slice(5)) : ['Jan', 'Fev', 'Mar'];
  const incomeSeries = monthlyData.length ? monthlyData.map((item) => item.income) : [0, 0, 0];
  const expenseSeries = monthlyData.length ? monthlyData.map((item) => item.expense) : [0, 0, 0];
  const balanceSeries = monthlyData.length ? monthlyData.map((item) => item.balance) : [0, 0, 0];

  const summary = getFinancialSummary();
  document.getElementById('reportIncomeValue').textContent = formatCurrency(summary.income);
  document.getElementById('reportExpenseValue').textContent = formatCurrency(summary.expense);
  document.getElementById('reportBalanceValue').textContent = formatCurrency(summary.balance);

  const monthDetails = monthlyData.slice(-6).map((item) => getMonthlyName(item.month));
  buildLineChart('reportTrendChart', labels.slice(-6), incomeSeries.slice(-6), expenseSeries.slice(-6), monthDetails);
  buildBarChart('reportMonthlyComparison', labels.slice(-6), balanceSeries.slice(-6), ['#38bdf8', '#16c784', '#f59e0b', '#8b5cf6', '#ff5f6d', '#f97316']);
  renderExpenseCategoryReport();
  renderMonthlyReportTable(monthlyData.slice(-6));
}

function renderExpenseCategoryReport() {
  const period = document.getElementById('reportCategoryPeriod')?.value || '';
  const categoryTotals = getExpenseCategoryTotals(period);
  const chartCanvas = document.getElementById('reportCategoryChart');
  const chartCard = chartCanvas?.closest('.chart-card');

  buildDonutChart('reportCategoryChart', categoryTotals.map((item) => ({
    label: item.name,
    value: item.value,
    color: item.color
  })));

  if (chartCard) {
    chartCard.querySelector('.legend')?.remove();
    if (categoryTotals.length) {
      chartCard.appendChild(renderSimpleLegend(categoryTotals.map((item) => ({
        label: `${item.name} (${item.percentage.toFixed(1)}%)`,
        color: item.color
      }))));
    }
  }

  const tableBody = document.getElementById('reportCategoryTableBody');
  if (!tableBody) {
    return;
  }

  if (!categoryTotals.length) {
    tableBody.innerHTML = '<tr><td colspan="3"><div class="empty-state">Sem despesas para o período selecionado.</div></td></tr>';
    return;
  }

  tableBody.replaceChildren();
  categoryTotals.forEach((category) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const swatch = document.createElement('span');
    swatch.className = 'category-swatch';
    swatch.style.cssText = 'display:inline-block;vertical-align:middle;margin-right:8px;';
    swatch.style.background = category.color;
    const name = document.createElement('span');
    name.textContent = category.name;
    nameCell.append(swatch, name);

    const valueCell = document.createElement('td');
    valueCell.textContent = formatCurrency(category.value);
    const percentageCell = document.createElement('td');
    percentageCell.textContent = `${category.percentage.toFixed(1)}%`;
    row.append(nameCell, valueCell, percentageCell);
    tableBody.appendChild(row);
  });
}

function renderMonthlyReportTable(monthlyData) {
  const tableBody = document.getElementById('reportTableBody');
  if (!tableBody) {
    return;
  }

  if (!monthlyData.length) {
    tableBody.innerHTML = '<tr><td colspan="4"><div class="empty-state">Sem dados para relatório.</div></td></tr>';
    return;
  }

  tableBody.innerHTML = monthlyData
    .map((month) => `
      <tr>
        <td>${getMonthlyName(month.month)}</td>
        <td>${formatCurrency(month.income)}</td>
        <td>${formatCurrency(month.expense)}</td>
        <td class="${month.balance >= 0 ? 'value-positive' : 'value-negative'}">${formatCurrency(month.balance)}</td>
      </tr>
    `)
    .join('');
}
