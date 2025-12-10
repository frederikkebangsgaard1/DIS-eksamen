const bcrypt = require('bcrypt');
const db = require('../database/db');

async function auth(req, res) {
      const { eventId, email, pincode } = req.body;
    
      if (!eventId || !email || !pincode) {
        return res.status(400).json({ error: 'Manglende felter i login data' });
      }
      
      try {
        const query = 'SELECT * FROM pincodes WHERE event_id = ? AND email = ? LIMIT 1';
        const [rows] = await db.pool.execute(query, [eventId, email]);
        console.log(rows);
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Ugyldig event ID eller email' });
        }

        const eventName = rows[0].event_name;
        const city = rows[0].city;
        
        const storedHashedPincode = rows[0].pincode;
    
        const isMatch = await bcrypt.compare(pincode.toString(), storedHashedPincode);
        if (!isMatch) {
          return res.status(401).json({ error: 'Ugyldig pinkode' });
        }
        // Set cookie for session (simple example, not secure for production)
        res.cookie('session-pin', pincode, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        res.cookie('session-email', email, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        res.cookie('session-event', eventId, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        // Login successful
        return res.redirect(`/weatherpal?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}&city=${encodeURIComponent(city)}`);
    
      } catch (err) {
        console.error('Login fejl:', err.message);
        return res.status(500).json({ error: 'Intern serverfejl' });
      }
}

async function logout(req, res) {
  res.clearCookie('session-pin');
  res.clearCookie('session-email');
  res.clearCookie('session-event');
  return res.status(200).json({ message: 'Logged out' });
}

async function checkAuth(req, res, next) {

    console.log('Checking authentication');
    const pincode = req.cookies['session-pin'] || false;
    const email = req.cookies['session-email'] || false;
    const eventId = req.cookies['session-event'] || false;
    
      if (!eventId || !email || !pincode) {
        const eventIdfromQuery = req.query.eventId || '';
        console.log('No session cookies found, redirecting to login', eventIdfromQuery);
        if (eventIdfromQuery) {
          return res.redirect(`/login?eventid=${eventIdfromQuery}`);
        }
        
        return res.redirect('/login');
      }
      
      try {
        const query = 'SELECT * FROM pincodes WHERE event_id = ? AND email = ? LIMIT 1';
        const [rows] = await db.pool.execute(query, [eventId, email]);
        console.log(rows);
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Ugyldig event ID eller email' });
        }
    
        const storedHashedPincode = rows[0].pincode;
    
        const isMatch = await bcrypt.compare(pincode.toString(), storedHashedPincode);
        if (!isMatch) {
          return res.status(401).json({ error: 'Ugyldig pinkode' });
        }
        // Login successful
        return next();
    
      } catch (err) {
        console.error('Login fejl:', err.message);
        return res.status(500).json({ error: 'Intern serverfejl' });
      }

}

module.exports = { auth, checkAuth, logout };