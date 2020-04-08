const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const question = new Schema({
    category: String,
    type: String,
    difficulty: String,
    question: { type: String},
    correct_answer: String,
    incorrect_answers: Array
});

const question = mongoose.model('question', question);

module.exports = question;