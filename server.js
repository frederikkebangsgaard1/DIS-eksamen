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





// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})

app.use(cookieParser());

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helmet middleware for security headers
app.use(helmet());

app.get("/", (req, res) => {
  res.redirect("/weatherpal");
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/weatherpal', authController.checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', authController.auth);
app.post('/logout', authController.logout);

// Weather endpoint
app.get('/api/weather', authController.checkAuth, async (req, res) => {
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
    console.error('Weather API error:', err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const message = err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
    res.status(status).json({ error: message });
  }
});

// Webhook endpoint for notifications fra understory
app.post('/api/notify', notify);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint ikke fundet' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Intern serverfejl' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/weatherPal", (req, res) => {
  res.sendFile(__dirname + "/public/weatherPal.ico");
});
