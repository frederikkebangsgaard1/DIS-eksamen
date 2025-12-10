// Hent query-parameter 'city' og eventName fra URL'en
const urlParams = new URLSearchParams(window.location.search);
const city = urlParams.get('city');
const eventName = urlParams.get('eventName');

// Sæt først event navn og by
const eventNameElement = document.getElementById('eventName');
if (eventName) {
  eventNameElement.textContent = eventName;
} else {
  eventNameElement.textContent = "Ukendt Event";
}

const vejrinfoElement = document.getElementById('vejrinfo');
if (city) {
  vejrinfoElement.textContent = `Henter vejrudsigten for ${city}...`;
} else {
  vejrinfoElement.textContent = "Ingen by angivet for vejrudsigten.";
}


if (city && eventName) {
  // Hent vejrudsigten fra serverens API
  fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        vejrinfoElement.innerHTML = `<p>Fejl ved hentning af vejrudsigten: ${data.error}</p>`;
      } else {
        vejrinfoElement.innerHTML = `
          <p><strong>Temperatur:</strong> ${data.temp}°C</p>
          <p><strong>Føles som:</strong> ${data.feels_like}°C</p>
          <p><strong>Vejr:</strong> ${data.description}</p>
          ${data.icon ? `<img src="${data.icon}" alt="${data.description}"/>` : ''}
        `;
      }
    })
    .catch(error => {
      messageSection.innerHTML += `<p>Netværksfejl ved hentning af vejrudsigten: ${error.message}</p>`;
    });
}