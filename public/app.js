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

// Sæt derefter vejrinfo
const vejrinfoElement = document.getElementById('vejrinfo');
if (city) {
  vejrinfoElement.textContent = `Henter vejrudsigten for ${city}...`;
} else {
  vejrinfoElement.textContent = "Ingen by angivet for vejrudsigten.";
}


// Hent og vis vejrudsigten hvis by og eventName er angivet
if (city && eventName) {
  // Hent vejrudsigten fra serverens API - 2-timers forecast
  fetch(`/api/weather?city=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        vejrinfoElement.innerHTML = `<p>Fejl ved hentning af vejrudsigten: ${data.error}</p>`;
      } else {
        // Konverter forecast-tidspunktet til dansk tidsformat
        const timeText = data.forecast_time ? new Date(data.forecast_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'om 2 timer';
        vejrinfoElement.innerHTML = `
          <p><strong>Vejret ca. kl. ${timeText} (${data.city || city}):</strong></p>
          <p><strong>Temperatur:</strong> ${data.temp}°C</p>
          <p><strong>Føles som:</strong> ${data.feels_like}°C</p>
          <p><strong>Vejr:</strong> ${data.description}</p>
          ${data.icon ? `<img src="${data.icon}" alt="${data.description}"/>` : ''}
        `;
      }
    })
    .catch(error => {
      vejrinfoElement.innerHTML = `<p>Netværksfejl ved hentning af vejrudsigten: ${error.message}</p>`;
    });
}


// Logud knap - lytter efter klik og sender logud-anmodning
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
  // Cookies kan kun slettes ved http respons fra serveren, så vi laver et fetch kald
  fetch('/logout', { method: 'POST' })
    .then(response => {
      if (response.ok) {
        window.location.href = '/login';
      } else {
        alert('Fejl ved logud. Prøv igen.');
      }
    })
    .catch(error => {
      alert('Netværksfejl ved logud: ' + error.message);
    });

});