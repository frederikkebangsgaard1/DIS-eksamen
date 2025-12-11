const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const { notify } = require('./controllers/notifyController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const authController = require('./controllers/authController');
const db = require('./database/db'); // Import database connection

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

db.testConnection(); // tjek DB ved opstart


// Rate limiting - beskytter mod misbrug ved at begrænse anmodninger
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutter
	limit: 500, // Max 500 anmodninger per IP per 15 minutter
	standardHeaders: 'draft-8', // Brug moderne rate limit headers
	legacyHeaders: false, // Deaktiver gamle headers
	ipv6Subnet: 56, // IPv6 subnet størrelse
	// store: ... , // Kan bruge Redis, Memcached, osv.
})


// Parser middleware
app.use(cookieParser()); // Læs cookies fra anmodninger
app.use(limiter); // Anvend rate limiting på alle anmodninger
app.use(express.json()); // Parser JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parser URL-encoded bodies

// Helmet middleware for security headers
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
      // Tillad billeder fra egen origin, data-urls og OpenWeatherMap
      imgSrc: ["'self'", "data:", "https://openweathermap.org"],
    },
    },
}));

// Omdiriger root til /weatherpal
app.get("/", (req, res) => {
  res.redirect("/weatherpal");
});

// Serve statiske filer fra public mappen
app.use(express.static(path.join(__dirname, 'public')));

// Hjemmesiden - kræver login
app.get('/weatherpal', authController.checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login-side
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login og logout håndtering
app.post('/login', authController.auth); // Autentificer bruger
app.post('/logout', authController.logout); // Log bruger ud

// Weather endpoint (2-timers forecast)
app.get('/api/weather', authController.checkAuth, async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'Manglende query-parameter city (by-navn)' });

  if (!API_KEY) return res.status(500).json({ error: 'Mangler OPENWEATHER_API_KEY i miljøvariablerne' });

  try {
    // Beregn målttidspunkt: nu + 2 timer (i millisekunder)
    const targetTsMs = Date.now() + 2 * 60 * 60 * 1000;

    // 5-døgn / 3-timers forecast: find det tidspunkt der ligger tættest på +2 timer
    const resp = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { q: city, units: 'metric', appid: API_KEY }
    });

    // Udtruk forecast-listen eller sæt tom array hvis den ikke findes
    const list = resp.data && Array.isArray(resp.data.list) ? resp.data.list : [];
    if (!list.length) return res.status(500).json({ error: 'Ingen forecast-data modtaget fra OpenWeather' });

    // Find det forecast-indgang der ligger tættest på +2 timer fra nu
    const best = list.reduce((closest, entry) => {
      const entryMs = (entry.dt || 0) * 1000;
      const diff = Math.abs(entryMs - targetTsMs);
      if (!closest || diff < closest.diff) return { entry, diff };
      return closest;
    }, null);

    const chosen = best.entry;
    const result = {
      city: resp.data.city && resp.data.city.name,
      country: resp.data.city && resp.data.city.country,
      forecast_time: chosen.dt ? new Date(chosen.dt * 1000).toISOString() : null,
      temp: chosen.main && chosen.main.temp,
      feels_like: chosen.main && chosen.main.feels_like,
      description: chosen.weather && chosen.weather[0] && chosen.weather[0].description,
      icon: chosen.weather && chosen.weather[0] ? `https://openweathermap.org/img/wn/${chosen.weather[0].icon}@2x.png` : null
    };

    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const message = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
    res.status(status).json({ error: message });
  }
});

// Webhook fra Understory - modtager notifications når events ændres
// Skal dette slettes?
app.post('/api/notify', notify);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint ikke fundet' });
});

// Generel fejlhåndtering for hele serveren
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Intern serverfejl' });
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Server kører på port ${PORT}`);
});


