document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('transactionForm')) {
    initTransactionsPage();
  }
});

function initTransactionsPage() {
  const form = document.getElementById('transactionForm');
  const typeSelect = document.getElementById('transactionType');
  const categoryField = document.getElementById('transactionCategory');
  const tableBody = document.getElementById('transactionTableBody');
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const periodFilter = document.getElementById('periodFilter');
  const sortSelect = document.getElementById('sortSelect');
  const resetFiltersButton = document.getElementById('resetFilters');
  const cancelEditButton = document.getElementById('cancelEditTransaction');

  populateCategoryOptions(typeSelect.value, categoryField);
  populateCategoryFilter(categoryFilter);

  typeSelect.addEventListener('change', () => {
    populateCategoryOptions(typeSelect.value, categoryField);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveTransactionFromForm();
  });

  tableBody.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }

    const transactionId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    if (action === 'edit-transaction') {
      fillTransactionForm(transactionId);
    }

    if (action === 'delete-transaction') {
      const shouldDelete = confirmDelete('Deseja realmente excluir esta movimentação?');
      if (!shouldDelete) {
        return;
      }

      const nextTransactions = getTransactions().filter((item) => item.id !== transactionId);
      saveTransactions(nextTransactions);
      showToast('Movimentação excluída com sucesso.', 'success');
      renderTransactionsTable();
      resetTransactionForm();
    }
  });

  searchInput.addEventListener('input', renderTransactionsTable);
  typeFilter.addEventListener('change', renderTransactionsTable);
  categoryFilter.addEventListener('change', renderTransactionsTable);
  periodFilter.addEventListener('change', renderTransactionsTable);
  sortSelect.addEventListener('change', renderTransactionsTable);
  resetFiltersButton.addEventListener('click', () => {
    searchInput.value = '';
    typeFilter.value = 'all';
    categoryFilter.value = 'all';
    periodFilter.value = '';
    sortSelect.value = 'date-desc';
    renderTransactionsTable();
  });

  cancelEditButton.addEventListener('click', () => {
    resetTransactionForm();
  });

  renderTransactionsTable();
}

function populateCategoryOptions(type, selectElement) {
  const categories = getCategories().filter((category) => category.type === type);
  selectElement.innerHTML = '<option value="">Selecione</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.name}`;
    selectElement.appendChild(option);
  });
}

function populateCategoryFilter(selectElement) {
  const categories = getCategories();
  selectElement.innerHTML = '<option value="all">Todas</option>';

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = `${category.icon} ${category.name}`;
    selectElement.appendChild(option);
  });
}

function saveTransactionFromForm() {
  const id = document.getElementById('transactionId').value;
  const type = document.getElementById('transactionType').value;
  const description = document.getElementById('transactionDescription').value.trim();
  const value = parseFloat(document.getElementById('transactionValue').value);
  const categoryId = document.getElementById('transactionCategory').value;
  const date = document.getElementById('transactionDate').value;
  const paymentMethod = document.getElementById('transactionPayment').value;
  const notes = document.getElementById('transactionNotes').value.trim();

  if (!type || !description || !value || value <= 0 || !categoryId || !date || !paymentMethod) {
    showToast('Preencha corretamente todos os campos obrigatórios.', 'error');
    return;
  }

  const transaction = {
    id: id || generateId('transaction'),
    type,
    description,
    value: Number(value.toFixed(2)),
    categoryId,
    category: getCategoryById(categoryId)?.name || 'Outros',
    date,
    paymentMethod,
    notes,
    userId: getCurrentUser()?.id
  };

  const transactions = getTransactions();
  const updatedTransactions = id
    ? transactions.map((item) => (item.id === id ? transaction : item))
    : [transaction, ...transactions];

  saveTransactions(updatedTransactions);
  showToast(id ? 'Movimentação atualizada com sucesso.' : 'Movimentação cadastrada com sucesso.', 'success');
  resetTransactionForm();
  renderTransactionsTable();
}

function fillTransactionForm(transactionId) {
  const transaction = getTransactions().find((item) => item.id === transactionId);
  if (!transaction) {
    return;
  }

  document.getElementById('transactionId').value = transaction.id;
  document.getElementById('transactionType').value = transaction.type;
  document.getElementById('transactionDescription').value = transaction.description;
  document.getElementById('transactionValue').value = transaction.value;
  document.getElementById('transactionDate').value = transaction.date;
  document.getElementById('transactionPayment').value = transaction.paymentMethod;
  document.getElementById('transactionNotes').value = transaction.notes || '';
  populateCategoryOptions(transaction.type, document.getElementById('transactionCategory'));
  document.getElementById('transactionCategory').value = transaction.categoryId;

  document.getElementById('transactionTitle').textContent = 'Editar movimentação';
  document.getElementById('transactionSubmitText').textContent = 'Salvar alterações';
  document.getElementById('cancelEditTransaction').classList.remove('hidden');
}

function resetTransactionForm() {
  document.getElementById('transactionForm').reset();
  document.getElementById('transactionId').value = '';
  document.getElementById('transactionType').value = 'income';
  document.getElementById('transactionTitle').textContent = 'Nova movimentação';
  document.getElementById('transactionSubmitText').textContent = 'Adicionar movimentação';
  document.getElementById('cancelEditTransaction').classList.add('hidden');
  populateCategoryOptions('income', document.getElementById('transactionCategory'));
}

function renderTransactionsTable() {
  const rows = getTransactions();
  const tableBody = document.getElementById('transactionTableBody');

  if (!tableBody) {
    return;
  }

  const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const typeFilterValue = document.getElementById('typeFilter')?.value || 'all';
  const categoryFilterValue = document.getElementById('categoryFilter')?.value || 'all';
  const periodValue = document.getElementById('periodFilter')?.value || '';
  const sortValue = document.getElementById('sortSelect')?.value || 'date-desc';

  const filteredTransactions = rows
    .filter((item) => {
      const matchesSearch = item.description.toLowerCase().includes(searchValue);
      const matchesType = typeFilterValue === 'all' || item.type === typeFilterValue;
      const matchesCategory = categoryFilterValue === 'all' || item.categoryId === categoryFilterValue;
      const matchesPeriod = !periodValue || item.date.startsWith(periodValue);
      return matchesSearch && matchesType && matchesCategory && matchesPeriod;
    })
    .sort((a, b) => {
      if (sortValue === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortValue === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortValue === 'value-desc') return Number(b.value) - Number(a.value);
      if (sortValue === 'value-asc') return Number(a.value) - Number(b.value);
      return 0;
    });

  if (!filteredTransactions.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">Nenhuma movimentação encontrada para os filtros selecionados.</div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredTransactions
    .map((transaction) => {
      const category = getCategoryById(transaction.categoryId) || { name: transaction.category || 'Outros', icon: '•', color: '#94a3b8' };
      return `
        <tr>
          <td>${transaction.description}</td>
          <td><span class="tag" style="background:${category.color}22;color:${category.color};">${category.icon} ${category.name}</span></td>
          <td><span class="badge ${transaction.type === 'income' ? 'income' : 'expense'}">${transaction.type === 'income' ? 'Receita' : 'Despesa'}</span></td>
          <td class="${transaction.type === 'income' ? 'value-positive' : 'value-negative'}">${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.value)}</td>
          <td>${formatDate(transaction.date)}</td>
          <td>${transaction.paymentMethod}</td>
          <td class="table-actions">
            <button type="button" class="icon-mini-btn" data-action="edit-transaction" data-id="${transaction.id}" title="Editar">✏️</button>
            <button type="button" class="icon-mini-btn" data-action="delete-transaction" data-id="${transaction.id}" title="Excluir">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join('');
}
