const PROFILE_ACCENT_PRESETS = ['#38bdf8', '#16c784', '#f59e0b', '#ff5f6d', '#a78bfa', '#ec4899'];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  if (!form) {
    return;
  }

  const colorInput = document.getElementById('profileAccent');
  const preview = document.getElementById('profilePreview');
  const options = document.getElementById('profileColorOptions');
  const currentProfile = getUserProfile();
  colorInput.value = currentProfile?.accent || '#38bdf8';

  function updateProfilePreview() {
    document.body.style.setProperty('--profile-accent', colorInput.value);
    const red = parseInt(colorInput.value.slice(1, 3), 16);
    const green = parseInt(colorInput.value.slice(3, 5), 16);
    const blue = parseInt(colorInput.value.slice(5, 7), 16);
    document.body.style.setProperty('--profile-accent-soft', `rgba(${red}, ${green}, ${blue}, 0.16)`);
    preview.style.borderColor = colorInput.value;
    options.querySelectorAll('[data-accent]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.accent === colorInput.value));
    });
  }

  options.addEventListener('click', (event) => {
    const button = event.target.closest('[data-accent]');
    if (!button) {
      return;
    }

    colorInput.value = button.dataset.accent;
    updateProfilePreview();
  });

  colorInput.addEventListener('input', updateProfilePreview);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveUserProfile({ accent: colorInput.value });
    applyProfileAccent();
    updateProfilePreview();
    showToast('Cor de destaque salva para esta conta.', 'success');
  });

  document.getElementById('resetProfileAccent').addEventListener('click', () => {
    colorInput.value = '#38bdf8';
    saveUserProfile({ accent: colorInput.value });
    applyProfileAccent();
    updateProfilePreview();
    showToast('Cor padrão restaurada.', 'success');
  });

  updateProfilePreview();
});
