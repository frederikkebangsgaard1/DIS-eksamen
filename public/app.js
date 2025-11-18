const btn = document.getElementById('btn');
const cityInput = document.getElementById('city');
const result = document.getElementById('result');

btn.addEventListener('click', async () => {
  const q = cityInput.value.trim();
  if (!q) {
    result.textContent = 'Skriv en by.';
    return;
  }
  result.textContent = 'Henter...';
  try {
    const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      result.textContent = 'Fejl: ' + (err.error || res.statusText);
      return;
    }
    const d = await res.json();
    result.innerHTML = `
      <h2>${d.city}${d.country ? ', ' + d.country : ''}</h2>
      <p><strong>${d.temp}°C</strong> — ${d.description || ''}</p>
      <p>Føles som ${d.feels_like}°C</p>
      ${d.icon ? `<img src="${d.icon}" alt="${d.description || ''}"/>` : ''}
    `;
  } catch (e) {
    result.textContent = 'Netværksfejl: ' + e.message;
  }
});
