const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    noLogedUsers:[{type: String}],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    nologgedOwner:String,
    gameStarted: { type: Boolean, default: false },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    ranking: [{ user: String, score:Number}],
    questionNumber: { type: Number, default: 0 },
    results: [{
        user: String,//{ type: Schema.Types.ObjectId, ref: 'User' },
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