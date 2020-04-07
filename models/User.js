const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    Password: String,
    Nick: { type: String, unique: true }


});

const User = mongoose.model('User', User);

module.exports = User;