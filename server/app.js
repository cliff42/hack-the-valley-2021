const express = require("express");
const https = require('https');
const axios = require('axios');
require('dotenv').config()

// Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// MongoDB
const mongoose = require('mongoose');
const dbConfig = require('./config/database.config');
const User = require('./models/user.js');

const PORT = process.env.PORT || 3000;

const app = express();

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Gets a list of the current open events from NASA's EONET API
app.get("/events", (req, res) => {
  // NASA's EONET API
  axios.get('https://eonet.sci.gsfc.nasa.gov/api/v3/events', { params: { status: "open", limit: 100 } })
    .then(response => {
      console.log('getting NASA EONET event data...');
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

app.get("/test-db", async (req, res) => {
    try {
        let users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});