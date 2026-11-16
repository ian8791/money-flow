document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reportTitle')) {
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

  buildLineChart('reportTrendChart', labels.slice(-6), incomeSeries.slice(-6), expenseSeries.slice(-6));
  buildBarChart('reportMonthlyComparison', labels.slice(-6), balanceSeries.slice(-6), ['#38bdf8', '#16c784', '#f59e0b', '#8b5cf6', '#ff5f6d', '#f97316']);

  const categoryTotals = getExpenseCategoryTotals();
  if (categoryTotals.length) {
    buildDonutChart('reportCategoryChart', categoryTotals.map((item) => ({ value: item.value, color: item.color })));

    const categoryChartCard = document.getElementById('reportCategoryChart').closest('.chart-card');
    if (categoryChartCard) {
      const legend = renderSimpleLegend(categoryTotals.map((item) => ({ label: item.name, color: item.color })));
      categoryChartCard.appendChild(legend);
    }
  }

  renderMonthlyReportTable(monthlyData.slice(-6));
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
