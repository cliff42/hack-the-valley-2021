const express = require("express");
const https = require('https');
const axios = require('axios');
require('dotenv').config()
const haversine = require('haversine')

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
const e = require("express");
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

main();

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
  console.log("Trying to add new user");
  let user = await User.findOne({uid : req.body.uid} );
  if (!user) {
    user = new User({ uid: req.body.uid, phoneNumber: req.body.phoneNumber, lat: req.body.lat, lng: req.body.lng});
    try {
      await user.save()
      console.log("added phone number for user: " + req.body.uid);
      res.status(200).send(user);
  } catch (err) {
      console.error(err);
      res.status(500).send(err);
  }
  } else {
    res.status(200).send({prevAdded:true, message: "Phone number already added for this user."})
    console.log("User already added");
  }
});

async function main() {
  setInterval(checkUserLoc, 1800000)
}

async function checkUserLoc() {
  try {
    let data = await getEventData();
    let users = await User.find();
    users.forEach(user => {
      let event = isUserNearEvent({latitude: user.lat, longitude: user.lng}, data);
      if (event) {
        console.log("User within 50 km of climate event, sending message");
        client.messages
        .create({
            body: 'Warning, you are within 50km of: ' + event.title,
            from: '+13514443957',
            to: user.phoneNumber
        })
        .then(message => {
          console.log("sent message" + message.sid);
        });
      }
    })
  } catch (err) {
      console.error(err);
  }
}

async function getEventData() {
  let events;
  await axios.get('https://eonet.sci.gsfc.nasa.gov/api/v3/events', { params: { status: "open", limit: 250 } })
    .then(response => {
      console.log('getting NASA EONET event data...');
      events = response.data.events;
      });
  let points = [];
  events.forEach(event => {
    let ps = [];
    let eventName = event.title;
    event.geometry.forEach(g => {
      let point = {
        latitude: g.coordinates[1],
        longitude: g.coordinates[0]
      }
      point["title"] = eventName;
      ps.push(point);
    })
    points.push(...ps);
  });
  return points;
}

function isUserNearEvent(userLocation, points) {
  let res = null;
  points.forEach(point => {
    if (haversine(userLocation, {latitude: point.latitude, longitude: point.longitude}, {threshold: 50})) {
      res = point;
      return;
    }
  })
  return res;
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});