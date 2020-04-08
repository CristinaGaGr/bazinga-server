const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responses = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    responseTime: Number,
    answer: String,
});

const Responses = mongoose.model('responses', responses);

module.exports = responses;