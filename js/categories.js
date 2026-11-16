document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('categoryForm')) {
    initCategoriesPage();
  }
});

function initCategoriesPage() {
  const form = document.getElementById('categoryForm');
  const list = document.getElementById('categoryList');
  const typeField = document.getElementById('categoryType');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveCategory();
  });

  list.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }

    const categoryId = actionButton.dataset.id;
    const action = actionButton.dataset.action;

    if (action === 'edit-category') {
      fillCategoryForm(categoryId);
      return;
    }

    if (action === 'delete-category') {
      const category = getCategories().find((item) => item.id === categoryId);
      if (!category) {
        return;
      }

      const transactionsUsingCategory = getTransactions().filter((transaction) => transaction.categoryId === categoryId);
      if (transactionsUsingCategory.length) {
        showToast('Não é possível excluir uma categoria em uso.', 'error');
        return;
      }

      const confirmed = confirmDelete('Deseja realmente excluir esta categoria?');
      if (!confirmed) {
        return;
      }

      const nextCategories = getCategories().filter((item) => item.id !== categoryId);
      saveCategories(nextCategories);
      showToast('Categoria excluída com sucesso.', 'success');
      renderCategoriesList();
      form.reset();
    }
  });

  typeField.addEventListener('change', () => {
    const selectedType = typeField.value;
    if (selectedType === 'income') {
      document.getElementById('categoryIcon').value = '💼';
      document.getElementById('categoryColor').value = '#16c784';
    } else {
      document.getElementById('categoryIcon').value = '🍽️';
      document.getElementById('categoryColor').value = '#f97316';
    }
  });

  renderCategoriesList();
}

function saveCategory() {
  const categoryId = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value.trim();
  const type = document.getElementById('categoryType').value;
  const icon = document.getElementById('categoryIcon').value.trim() || '📌';
  const color = document.getElementById('categoryColor').value || '#94a3b8';

  if (!name || !type) {
    showToast('Preencha o nome e o tipo da categoria.', 'error');
    return;
  }

  const categories = getCategories();
  const matchedCategory = categories.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.type === type && item.id !== categoryId);

  if (matchedCategory) {
    showToast('Já existe uma categoria com esse nome para esse tipo.', 'error');
    return;
  }

  const categoryData = {
    id: categoryId || generateId('category'),
    name,
    type,
    icon,
    color
  };

  const updatedCategories = categoryId
    ? categories.map((item) => (item.id === categoryId ? categoryData : item))
    : [...categories, categoryData];

  saveCategories(updatedCategories);
  showToast(categoryId ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.', 'success');
  resetCategoryForm();
  renderCategoriesList();
}

function fillCategoryForm(categoryId) {
  const category = getCategories().find((item) => item.id === categoryId);
  if (!category) {
    return;
  }

  document.getElementById('categoryId').value = category.id;
  document.getElementById('categoryName').value = category.name;
  document.getElementById('categoryType').value = category.type;
  document.getElementById('categoryIcon').value = category.icon || '📌';
  document.getElementById('categoryColor').value = category.color || '#94a3b8';
  document.getElementById('categoryTitle').textContent = 'Editar categoria';
  document.getElementById('categorySubmitText').textContent = 'Salvar categoria';
  document.getElementById('cancelEditCategory').classList.remove('hidden');
}

function resetCategoryForm() {
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryType').value = 'income';
  document.getElementById('categoryIcon').value = '💼';
  document.getElementById('categoryColor').value = '#16c784';
  document.getElementById('categoryTitle').textContent = 'Nova categoria';
  document.getElementById('categorySubmitText').textContent = 'Adicionar categoria';
  document.getElementById('cancelEditCategory').classList.add('hidden');
}

function renderCategoriesList() {
  const list = document.getElementById('categoryList');
  const categories = getCategories();

  if (!list) {
    return;
  }

  if (!categories.length) {
    list.innerHTML = '<div class="empty-state">Nenhuma categoria cadastrada.</div>';
    return;
  }

  list.innerHTML = categories
    .map((category) => `
      <div class="category-item">
        <div class="category-info">
          <span class="category-swatch" style="background:${category.color};"></span>
          <div>
            <strong>${category.icon} ${category.name}</strong><br>
            <small style="color: var(--muted); text-transform: capitalize;">${category.type === 'income' ? 'Receita' : 'Despesa'}</small>
          </div>
        </div>
        <div class="category-actions">
          <button type="button" class="icon-mini-btn" data-action="edit-category" data-id="${category.id}" title="Editar">✏️</button>
          <button type="button" class="icon-mini-btn" data-action="delete-category" data-id="${category.id}" title="Excluir">🗑️</button>
        </div>
      </div>
    `)
    .join('');
}

window.addEventListener('DOMContentLoaded', () => {
  const cancelButton = document.getElementById('cancelEditCategory');
  if (cancelButton) {
    cancelButton.addEventListener('click', resetCategoryForm);
  }
});
