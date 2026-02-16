const form = document.getElementById('registration-form');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  statusEl.classList.remove('hidden', 'ok', 'error');
  statusEl.textContent = result.message;

  if (response.ok) {
    statusEl.classList.add('ok');
    form.reset();
  } else {
    statusEl.classList.add('error');
  }
});
