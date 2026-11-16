document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('registerForm')) {
    initRegisterForm();
  }

  if (document.getElementById('loginForm')) {
    initLoginForm();
  }
});

function initRegisterForm() {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const fullName = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (!fullName || !email || !password || !confirmPassword) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas não conferem.', 'error');
      return;
    }

    const existingUsers = getUsers();
    const userExists = existingUsers.some((user) => user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      showToast('Este e-mail já está cadastrado.', 'error');
      return;
    }

    const newUser = {
      id: generateId('user'),
      name: fullName,
      email: email.toLowerCase(),
      password
    };

    existingUsers.push(newUser);
    saveUsers(existingUsers);
    showToast('Cadastro realizado com sucesso!', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 700);
  });
}

function initLoginForm() {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showToast('Informe e-mail e senha para entrar.', 'error');
      return;
    }

    const user = getUsers().find((account) => account.email.toLowerCase() === email && account.password === password);

    if (!user) {
      showToast('E-mail ou senha inválidos.', 'error');
      return;
    }

    setCurrentUser(user);
    ensureDefaultCategories();
    showToast('Login realizado com sucesso!', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  });
}
