document.getElementById("getWeather").addEventListener("click", async () => {
  const city = document.getElementById("city").value;
  const start = new Date();
  console.log("Client start:", start.toISOString());

  const res = await fetch(`/vejr/api/weather?city=${encodeURIComponent(city)}`);
  const data = await res.json();

  const end = new Date();
  console.log("Client slut:", end.toISOString());
  console.log("Client tid (ms):", end - start);
  console.log("JSON data:", data);

  const current = data.current_condition[0];
  document.getElementById("weatherResult").innerHTML = `
                <p><strong>Temperatur:</strong> ${current.temp_C} °C</p>
                <p><strong>Vejr:</strong> ${current.weatherDesc[0].value}</p>
                <p><strong>Vind:</strong> ${current.windspeedKmph} km/t</p>
            `;
});

document.getElementById("getWeathers").addEventListener("click", async () => {
  const cities = document.getElementById("cities").value;
  const start = new Date();
  console.log("Client start:", start.toISOString());

  const res = await fetch(
    `/vejr/api/weathers?cities=${encodeURIComponent(cities)}`
  );
  const data = await res.json();

  const end = new Date();
  console.log("Client slut:", end.toISOString());
  console.log("Client tid (ms):", end - start);
  console.log("JSON data:", data);

  document.getElementById("weathersResult").innerHTML = data
    .map(
      (item) => `
        <h3>${item.city}</h3>
        <p><strong>Temperatur:</strong> ${item.weather.temp_C} °C</p>
        <p><strong>Vejr:</strong> ${item.weather.weatherDesc[0].value}</p>
        <p><strong>Vind:</strong> ${item.weather.windspeedKmph} km/t</p>
    `
    )
    .join("");
});