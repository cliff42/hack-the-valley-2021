const express = require("express");
const https = require('https');
const axios = require('axios');
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const PORT = process.env.PORT || 3000;

const app = express();

// Gets a list of the current open events from NASA's EONET API
app.get("/events", (req, res) => {
  // NASA's EONET API
  axios.get('https://eonet.sci.gsfc.nasa.gov/api/v3/events', { params: { status: "open", limit: 20 } })
    .then(response => {
      console.log('getting NASA EONET event data...');
      console.log(response.data.events[0].geometry);
      res.json({ message: response.data.events });
    })
    .catch(error => {
      console.log(error);
  });
});

// Send a message to the user's phone number (from Google Firebase) using Twilio
app.get("/send-message", (req, res) => {
  if (req.number != null) {
    client.messages
    .create({
        body: 'There is a natural event warning in your area',
        from: '+13514443957',
        to: req.number
     })
    .then(message => {
      console.log(message.sid);
      res.json({message: message.sid});
    });
  } else {
    res.json({message: 'There is no phone number on record for your google account'});
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});