const db = require('../database/db');

// login 
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Manglende brugernavn eller adgangskode' });
  }

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(query, [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Databasefejl' });
    }

    if (row) {
      // Bruger fundet, login succesfuldt
      return res.json({ message: 'Login succesfuldt', user: { id: row.id, username: row.username } });
    } else {
      // Bruger ikke fundet eller forkert adgangskode
      return res.status(401).json({ error: 'Ugyldigt brugernavn eller adgangskode' });
    }
  })
};

// logout
// lav en logud knap i frontend

