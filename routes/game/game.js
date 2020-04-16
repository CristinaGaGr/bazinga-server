const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Game = require('../../models/game');
const Actualgames = require("../../models/actual");
const Questions = require('../../models/questions');

const pinGenerator = async () => {
    let pin = Math.floor(Math.random() * 9000) + 1000;
    let game_id = null;
    if (await Actualgames.find({ pin }) == "") {
        let game = await Game.create({});
        game_id = game._id;

        await Actualgames.create({ pin, game_id });

    } else {
        return pinGenerator();
    }
    return { pin, game_id };
};


const questionGenerator = async (numberOfQuestions, dificulty, categories) => {
    let arrayQuestions = [];
    let selectedQuestions = [];
    arrayQuestions = await Questions.find({ category: categories, difficulty: dificulty }, { _id: 1 });
    let numberResponseMongo = arrayQuestions.length;
    for (let i = 0; i < numberOfQuestions && i < numberResponseMongo; i++) {
        let position = Math.round(Math.random() * arrayQuestions.length);
        selectedQuestions.push(arrayQuestions[position]);
        arrayQuestions.splice(position, 1);
    }
    return (selectedQuestions);
};



router.post('/', async (req, res) => {
    console.log(req.body);
    let { username, difficulty, categories, numberOfQuestions } = req.body;
    const arrayQuestions = await questionGenerator(numberOfQuestions, difficulty, categories);
    const { pin, game_id } = await pinGenerator();
    res.send({ pin, game_id });
    await Game.findByIdAndUpdate(game_id, { questions: arrayQuestions, owner: username });

    setTimeout(() => {
        Actualgames.findOneAndDelete({ game_id }, (err, res) => {
        });
        console.log("cleaning unstarted game..", game_id);
    }, 30 * 60 * 1000);
});





router.post('/join', async (req, res) => {

    let actualGame = await Actualgames.findOne({ pin: +req.body.pin });
    if (actualGame.game_id.id === "") {
        res.status(404).send("pincode not valid or game started");
    } else {

        if (req.userId) {
            Game.findByIdAndUpdate(actualGame.game_id, { $push: { users: req.userId } });
        } else {
            Game.findByIdAndUpdate(actualGame.game_id, {
                $push: {
                    noLogedUsers: req.body.username
                }
            });
        }
        res.status(200).send(actualGame.game_id);
    }
});


router.get('/check', (req, res) => {
    let { username, pin } = req.query;
    try {
        Actualgames.findOne({ pin }).populate('game_id').exec((err, actualGame) => {
            if ((/[^A-Za-z0-9]+/g).test(username)) {
                res.status(403).send({ error: "Invalid characters in username" });
                return;
            }
            if (err || !actualGame) {
                res.status(403).send({ error: "Invalid Pin" });
                return;
            }
            if (actualGame.game_id.users.findIndex(user => user.username === username) === -1) {
                res.status(200).send();
            } else {
                res.status(403).send({ error: "Username in use" });
            }
        });

    } catch (error) {
        console.log(error);

    }
});

module.exports = router;
