const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'wating to users' },
    gameStarted: { type: Boolean, default: false },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    actualQuestion: { type: Number, default: 0 },
    results: [{ type: Schema.Types.ObjectId, ref: 'responses' }]
});

const Game = mongoose.model('game', gameSchema);

module.exports = Game;
//uml