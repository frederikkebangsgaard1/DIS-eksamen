const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const { notify } = require('./controllers/notifyController');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'Manglende query-parameter city (by-navn)' });
  try {
    const unixtime = Math.floor(Date.now() / 1000) + 86400; // nu + 24 timer
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, units: 'metric', appid: API_KEY, dt: unixtime }
    });
    const data = resp.data;
    const result = {
      city: data.name,
      country: data.sys && data.sys.country,
      temp: data.main && data.main.temp,
      feels_like: data.main && data.main.feels_like,
      description: data.weather && data.weather[0] && data.weather[0].description,
      icon: data.weather && data.weather[0] ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : null
    };
    res.json(result);
  } catch (err) {
    const status = err.response && err.response.status ? err.response.status : 500;
    const message = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
    res.status(status).json({ error: message });
  }
});

// Webhook endpoint for notifications fra understory
app.post('/api/notify', notify);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
