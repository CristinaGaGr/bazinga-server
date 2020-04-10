const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actualGameSchema = new Schema({
    pin: { type: Number, unique: true },
    game_id: { type: Schema.Types.ObjectId, ref: 'game' }
});

const actualGame = mongoose.model('actualGame', actualGameSchema);

module.exports = actualGame;
