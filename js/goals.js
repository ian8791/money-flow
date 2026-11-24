document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goalForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveGoalFromForm();
  });

  document.getElementById('cancelGoalEdit').addEventListener('click', resetGoalForm);
  document.getElementById('goalList').addEventListener('click', handleGoalListAction);
  document.getElementById('goalMovementActions').addEventListener('click', handleGoalMovement);
  renderGoals();
});

function saveGoalFromForm() {
  const id = document.getElementById('goalId').value;
  const name = document.getElementById('goalName').value.trim();
  const description = document.getElementById('goalDescription').value.trim();
  const target = Number(document.getElementById('goalTarget').value);
  const saved = Number(document.getElementById('goalSaved').value || 0);
  const targetDate = document.getElementById('goalDate').value;

  if (!name || !Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0) {
    showToast('Informe um nome e valores válidos para a meta.', 'error');
    return;
  }

  const goals = getGoals();
  const goal = {
    id: id || generateId('goal'),
    name,
    description,
    target: Number(target.toFixed(2)),
    saved: Number(saved.toFixed(2)),
    targetDate
  };
  const updatedGoals = id
    ? goals.map((item) => item.id === id ? goal : item)
    : [...goals, goal];

  saveGoals(updatedGoals);
  showToast(id ? 'Meta atualizada.' : 'Meta criada.', 'success');
  resetGoalForm();
  renderGoals();
}

function handleGoalListAction(event) {
  const button = event.target.closest('[data-goal-action]');
  if (!button) {
    return;
  }

  const goals = getGoals();
  const goal = goals.find((item) => item.id === button.dataset.id);
  if (!goal) {
    return;
  }

  if (button.dataset.goalAction === 'edit') {
    document.getElementById('goalId').value = goal.id;
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalDescription').value = goal.description || '';
    document.getElementById('goalTarget').value = goal.target;
    document.getElementById('goalSaved').value = goal.saved;
    document.getElementById('goalDate').value = goal.targetDate || '';
    document.getElementById('goalFormTitle').textContent = 'Editar meta';
    document.getElementById('goalSubmitText').textContent = 'Salvar alterações';
    document.getElementById('cancelGoalEdit').classList.remove('hidden');
    document.getElementById('goalName').focus();
    return;
  }

  if (button.dataset.goalAction === 'delete' && confirmDelete('Deseja realmente excluir esta meta?')) {
    saveGoals(goals.filter((item) => item.id !== goal.id));
    showToast('Meta excluída.', 'success');
    renderGoals();
  }
}

function handleGoalMovement(event) {
  const button = event.target.closest('[data-goal-operation]');
  if (!button) {
    return;
  }

  const goalId = document.getElementById('goalMovementTarget').value;
  const amount = Number(document.getElementById('goalMovementAmount').value);
  const goals = getGoals();
  const goal = goals.find((item) => item.id === goalId);

  if (!goal || !Number.isFinite(amount) || amount <= 0) {
    showToast('Selecione uma meta e informe um valor positivo.', 'error');
    return;
  }

  if (button.dataset.goalOperation === 'withdraw' && amount > Number(goal.saved)) {
    showToast('O valor de retirada não pode superar o total reservado.', 'error');
    return;
  }

  const nextSaved = button.dataset.goalOperation === 'deposit'
    ? Number(goal.saved) + amount
    : Number(goal.saved) - amount;
  saveGoals(goals.map((item) => item.id === goal.id
    ? { ...item, saved: Number(nextSaved.toFixed(2)) }
    : item));

  document.getElementById('goalMovementForm').reset();
  renderGoals();
  showToast(button.dataset.goalOperation === 'deposit' ? 'Valor reservado na meta.' : 'Valor retirado da meta.', 'success');
}

function renderGoals() {
  const list = document.getElementById('goalList');
  const goals = getGoals();
  const select = document.getElementById('goalMovementTarget');
  list.replaceChildren();
  select.replaceChildren();

  goals.forEach((goal) => {
    const option = document.createElement('option');
    option.value = goal.id;
    option.textContent = goal.name;
    select.appendChild(option);

    const target = Number(goal.target) || 0;
    const saved = Number(goal.saved) || 0;
    const remaining = Math.max(target - saved, 0);
    const excess = Math.max(saved - target, 0);
    const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
    const card = document.createElement('article');
    card.className = 'goal-card';
    if (saved >= target) {
      card.classList.add('is-complete');
    }

    const heading = document.createElement('div');
    heading.className = 'goal-card-header';
    const title = document.createElement('h3');
    title.textContent = goal.name;
    const status = document.createElement('span');
    status.className = 'badge income';
    status.textContent = saved >= target ? 'Meta atingida' : `${progress.toFixed(1)}% concluído`;
    heading.append(title, status);
    card.appendChild(heading);

    if (goal.description) {
      const description = document.createElement('p');
      description.className = 'inline-note';
      description.textContent = goal.description;
      card.appendChild(description);
    }

    const values = document.createElement('div');
    values.className = 'goal-values';
    const valueSummary = document.createElement('span');
    valueSummary.textContent = `Reservado ${formatCurrency(saved)} de ${formatCurrency(target)}`;
    const remainingSummary = document.createElement('span');
    remainingSummary.textContent = excess > 0
      ? `Excedente: ${formatCurrency(excess)}`
      : `Faltam ${formatCurrency(remaining)}`;
    values.append(valueSummary, remainingSummary);
    card.appendChild(values);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'goal-progress';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-label', `Progresso da meta ${goal.name}`);
    progressTrack.setAttribute('aria-valuemin', '0');
    progressTrack.setAttribute('aria-valuemax', '100');
    progressTrack.setAttribute('aria-valuenow', progress.toFixed(1));
    const progressFill = document.createElement('div');
    progressFill.className = 'goal-progress-fill';
    progressFill.style.width = `${progress}%`;
    progressTrack.appendChild(progressFill);
    card.appendChild(progressTrack);

    if (goal.targetDate) {
      const date = document.createElement('p');
      date.className = 'inline-note';
      date.textContent = `Prazo desejado: ${formatDate(goal.targetDate)}`;
      card.appendChild(date);
    }

    const actions = document.createElement('div');
    actions.className = 'goal-actions';
    actions.append(
      createGoalAction('Editar', 'edit', goal.id),
      createGoalAction('Excluir', 'delete', goal.id)
    );
    card.appendChild(actions);
    list.appendChild(card);
  });

  if (!goals.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Ainda não há metas cadastradas.';
    list.appendChild(empty);
    select.innerHTML = '<option value="">Cadastre uma meta primeiro</option>';
  }
}

function createGoalAction(label, action, id) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action === 'delete' ? 'danger-btn' : 'secondary-btn';
  button.dataset.goalAction = action;
  button.dataset.id = id;
  button.textContent = label;
  return button;
}

function resetGoalForm() {
  const form = document.getElementById('goalForm');
  form.reset();
  document.getElementById('goalId').value = '';
  document.getElementById('goalSaved').value = '0';
  document.getElementById('goalFormTitle').textContent = 'Nova meta';
  document.getElementById('goalSubmitText').textContent = 'Criar meta';
  document.getElementById('cancelGoalEdit').classList.add('hidden');
}
