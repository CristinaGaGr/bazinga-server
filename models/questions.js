const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    category: String,
    type: String,
    difficulty: String,
    question: { type: String },
    correct_answer: String,
    incorrect_answers: Array
});

const question = mongoose.model('question', questionSchema);

module.exports = question;