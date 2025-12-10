const twilio = require("twilio");
const sendgridMail = require('@sendgrid/mail');
require('dotenv').config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@em7106.dis.engineer';
const PORT = process.env.PORT || 3000;

twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
sendgridMail.setApiKey(SENDGRID_API_KEY);



async function notify(req, res) {
  const city = req.query.city;
  const email = req.query.email;
  const phonenumber = req.query.phonenumber;
  const eventName = req.query.eventName;  

  const message = `
Hej, Tak for din tilmelding! \n
På linken nedenfor kan du se vejrudsigten for i morgen hvor eventet finder sted. \n
https://dis.engineer?city=${encodeURIComponent(city)}&eventName=${encodeURIComponent(eventName)} \n
Vi glæder os til at se dig!
  `;

  /*
  Hej {userName}, \n
  Tak for din tilmelding til {eventName}! \n
  På linken nedenfor kan du se vejrudsigten for i morgen hvor eventet finder sted. \n
  https://dis.engineer?city={city}&eventName={eventName} \n
  Vi glæder os til at se dig! \n
  De bedste hilsner, \n
  WeatherPal Teamet
  */



  if (!message) return res.status(400).json({ error: 'Manglende query-parameter message' });
  try {
    console.log(`Notification: ${message}`);

    const emailRes = await sendEmail(email, `Vejrudsigt for dit event i ${city}`, message);
    const smsRes = await sendSMS(phonenumber, message);

      await Promise.all([emailRes, smsRes]);
      res.json({ status: 'Notification sent', message });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

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