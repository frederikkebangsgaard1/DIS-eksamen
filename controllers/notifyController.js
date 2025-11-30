const twilio = require("twilio");
const sendgridMail = require('@sendgrid/mail');
require('dotenv').config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const PORT = process.env.PORT || 3000;

twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
sendgridMail.setApiKey(SENDGRID_API_KEY);



async function notify (req, res) {
  const city = req.query.city;
  const email = req.query.email;
  const phonenumber = req.query.phonenumber;
  const eventName = req.query.eventName;

  console.log(phonenumber, typeof phonenumber);
  

  const message = `
  Hej, Tak for din tilmelding! \n
På linken nedenfor kan du se vejrudsigten for i morgen hvor eventet finder sted. \n
https://dis.engineer?city=${encodeURIComponent(city)}&eventName=${encodeURIComponent(eventName)} \n
Vi glæder os til at se dig!
  `;


  if (!message) return res.status(400).json({ error: 'Manglende query-parameter message' });
  try {
    console.log(`Notification: ${message}`);
    if (email) {
      await sendEmail(email, `Vejrudsigt for dit event i ${city}`, message);
    }
    if (phonenumber) {
      await sendSMS(phonenumber, message);
    }
    res.json({ status: 'Notification sent', message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function sendEmail(to, subject, text) {


}

async function sendSMS(to, body) {
  return await twilioClient.messages.create({
    body: body,
    from: 'DIS Weather Buddy',
    to: "+" +to
  });
}

module.exports = { notify };