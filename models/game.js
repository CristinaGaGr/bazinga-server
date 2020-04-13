const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    users: [{ _id: {type: Schema.Types.ObjectId, ref: 'User'},username: String}],
    owner: { _id: {type: Schema.Types.ObjectId, ref: 'User'},username: String},
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    ranking: [{ user: String, score:Number}],
    questionNumber: { type: Number, default: 0 },
    savedAnswer: [{
        user: { _id: {type: Schema.Types.ObjectId, ref: 'User'},username: String},//{ type: Schema.Types.ObjectId, ref: 'User' },
        question: { type: Schema.Types.ObjectId, ref: 'Question' },
        responseTime: Number,
        answer: String,
        points:Number
    }]

});

const Game = mongoose.model('game', gameSchema);

module.exports = Game;
//uml
{ ranking: { } }