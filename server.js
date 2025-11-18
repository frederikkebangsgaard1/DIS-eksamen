const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/weather', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Manglende query-parameter q (by-navn)' });
  if (!API_KEY) return res.status(500).json({ error: 'Server mangler OPENWEATHER_API_KEY. Sæt den i .env eller som env variabel.' });
  try {
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q, units: 'metric', appid: API_KEY }
    });
    const d = resp.data;
    const result = {
      city: d.name,
      country: d.sys && d.sys.country,
      temp: d.main && d.main.temp,
      feels_like: d.main && d.main.feels_like,
      description: d.weather && d.weather[0] && d.weather[0].description,
      icon: d.weather && d.weather[0] ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png` : null
    };
    res.json(result);
  } catch (err) {
    const status = err.response && err.response.status ? err.response.status : 500;
    const message = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
    res.status(status).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
