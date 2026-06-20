import * as api from '../../platform/browser-api.js';

const capacityInput = document.getElementById('capacity');
const form = document.getElementById('settings-form');
const rebuildButton = document.getElementById('rebuild');
const status = document.getElementById('status');
const pauseToggle = document.getElementById('pause-toggle');

async function load() {
  const settings = await api.sendMessage({ type: 'getSettings' });
  capacityInput.value = settings.capacity;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await api.sendMessage({
    type: 'setCapacity',
    capacity: Number(capacityInput.value),
  });
  status.textContent = 'Saved.';
});

rebuildButton.addEventListener('click', async () => {
  await api.sendMessage({ type: 'rebuild' });
  status.textContent = 'Rebuilt.';
});

pauseToggle.addEventListener('change', async () => {
  await api.sendMessage({
    type: 'setPaused',
    paused: pauseToggle.checked,
  });
  status.textContent = pauseToggle.checked
    ? '⏸️ Event handlers paused.'
    : '▶️ Event handlers active.';
});

load();