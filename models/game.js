const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const game = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    pinCode: Number,
    status: String,
    gameStarted: Boolean,
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    actualQuestion: Number,
    results: [{ type: Schema.Types.ObjectId, ref: 'responses' }]
});

const Game = mongoose.model('game', game);

module.exports = Game;
//uml