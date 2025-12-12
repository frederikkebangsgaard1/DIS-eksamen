// Hent eventid fra URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventid');
const eventinput = document.getElementById('eventid')
eventinput.value = eventId;

console.log(eventId);


// Håndter login formular submission
const loginForm = document.getElementById('loginForm');;

// Login side - håndter formular submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const pincode = document.getElementById('password').value;
  const eventId = document.getElementById('eventid').value;

  // Sæt op data til at sende
  const loginData = {
    eventId: eventId,
    email: email,
    pincode: pincode
  };

  // Send login anmodning til serveren
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    if(response.ok) {
      // Login successful, redirect to weatherpal med query parameters
      const json = await response.json();
      window.location.href = json.redirectUrl;

    } else  {
      alert("Ugyldig event ID, email eller pinkode");
    }

    // Fejlhåndtering
  } catch (error) {
    console.error('Error during login:', error);
    if (error.message) {
      alert('Fejl ved login: ' + error.message);
    } else {
      alert('Ukendt fejl ved login');
    }
  }
});
