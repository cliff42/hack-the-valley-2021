const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
    uid: {type: String, required: true},
    lat: String,
    lng: String,
    phoneNumber: String
}, { collection : 'users' });

const User = mongoose.model("User", UserSchema);
module.exports = User;