const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    password: String,
    userName: { type: String, unique: true }


});

const User = mongoose.model('User', User);

module.exports = User;