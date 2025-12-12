const twilio = require("twilio");
const sendgridMail = require('@sendgrid/mail');
require('dotenv').config();
const db = require('../database/db');
const bcrypt = require('bcrypt');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@em7106.dis.engineer';
const PORT = process.env.PORT || 3000;

twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
sendgridMail.setApiKey(SENDGRID_API_KEY);


// Send notifikation via email og/eller SMS
async function notify(req, res) {
  const city = req.query.city;
  const email = req.query.email;
  const phonenumber = req.query.phonenumber;
  const eventName = req.query.eventName;
  const eventId = req.query.eventId;

  // Tjek for manglende parametre
  if (!city) return res.status(400).json({ error: 'Manglende query-parameter city (by-navn)' });
  if (!email && !phonenumber) return res.status(400).json({ error: 'Manglende query-parameter email eller phonenumber' });
  if (!eventName) return res.status(400).json({ error: 'Manglende query-parameter eventName' });
  if (!eventId) return res.status(400).json({ error: 'Manglende query-parameter eventId' });  

  // Til databasen. Lav en pinkode på 4 cifre
  const pincode = Math.floor(1000 + Math.random() * 9000);
  bcryptedPincode = await bcrypt.hash(pincode.toString(), 10);
  
  // Gem i database
  const insertQuery = 'INSERT INTO pincodes (event_id, email, pincode, event_name, city) VALUES (?, ?, ?, ?, ?)';
  const values = [eventId, email, bcryptedPincode, eventName, city];
  try {
    db.pool.execute(insertQuery, values);
  } catch (err) {
    return res.status(500).json({ error: 'Database fejl: ' + err.message });
  }


// Beskedindhold
  const message = `
Hejsa 😊 \n
Vi håber, du glæder dig til dit event!\n
Vi har lavet en lille side, hvor du kan se den nyeste vejrudsigt for dagen, så du ved hvad du kan forvente. \n
Du finder den her: 
https://dis.engineer/login?city=${encodeURIComponent(city)}&eventid=${encodeURIComponent(eventId)} \n
For at logge ind skal du benytte din personlige pinkode.
Den får du her: ${pincode} 🤫\n
God fornøjelse!🤘 \n
De bedste hilsner, 
WeatherPal Teamet
  `;

  // Tjek for manglende besked
  if (!message) return res.status(400).json({ error: 'Manglende query-parameter message' });
  try {
    console.log(`Notification: ${message}`);

    const emailRes = await sendEmail(email, `Vejrudsigt for dit event`, message);
    const smsRes = await sendSMS(phonenumber, message);

      await Promise.all([emailRes, smsRes]);
      res.json({ status: 'Notification sent', message });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//  Send email via SendGrid
async function sendEmail(to, subject, text) {
  if (!to) throw new Error('Missing recipient email address');
  try {
    return await sendgridMail.send({
    to: to,
    from: SENDGRID_FROM,
    subject: subject,
    text: text,
  });
  } catch (err) {
    // Re-throw with a clearer message for downstream handling
    throw new Error(`SendGrid error: ${err.message}`);
  }
}

// Send SMS via Twilio
async function sendSMS(to, body) {
  try {
      return await twilioClient.messages.create({
      body: body,
      from: 'WeatherPal',
      to: "+" +to
    });
  } catch (error) {
    throw new Error(`Twilio error: ${error.message}`);
  }
}

module.exports = { notify };