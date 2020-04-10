const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responsesSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    responseTime: Number,
    answer: String,
});

const Responses = mongoose.model('responses', responsesSchema);

module.exports = responses;