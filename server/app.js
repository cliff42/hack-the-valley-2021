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

// HTTP requests
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}) );

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
  axios.get('https://eonet.sci.gsfc.nasa.gov/api/v3/events', { params: { status: "open", limit: 250 } })
    .then(response => {
      console.log('getting NASA EONET event data...');
      res.json({ message: response.data.events });
    })
    .catch(error => {
      console.log(error);
  });
});

// Send a message to the user's phone number (from Google Firebase) using Twilio
app.post("/send-welcome-message", async (req, res) => {
    try {
        let user = await User.find({uid: req.body.uid});
        if (user.length > 0) {
            client.messages
            .create({
                body: 'You have succesfully signed up to get alerts from Natural Events Tracker!',
                from: '+13514443957',
                to: user[0].phoneNumber
             })
            .then(message => {
              console.log("sent message" + message.sid);
              res.json({message: message.sid});
            });
          } else {
            res.json({message: 'There is no phone number on record for your google account'});
          }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

app.post("/add-user", async (req, res) => {
  console.log("Trying to add new user", req.body);
    let user = new User({ uid: req.body.uid, phoneNumber: req.body.phoneNumber, lat: req.body.lat, lng: req.body.lng});
    try {
        await user.save()
        console.log("added phone number for user: " + req.body.uid);
        res.status(200).send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});