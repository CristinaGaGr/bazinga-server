const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Game = require('../../models/game')
const Actualgames = require("../../models/actual")
const Questions = require('../../models/questions')

const pinGenerator = async () => {
    let pin = Math.floor(Math.random() * 9000) + 1000
    let game_id = null
    if (await Actualgames.find({ pin }) == "") {
        let game = await Game.create({})
        game_id = game._id

        await Actualgames.create({ pin, game_id})

    } else {
        //apartir de 7000 salas va EXTREMADAMENTE LENTO... NOSE SI SERIA MEJOR BAJARME TODO EL ARRAY EN LOCAL I HACER LA VALIDACION LOCALMENTE. 
        return pinGenerator()
    }
    return { pin, game_id }
}
const addToGame = () => {

}


router.post('/', async (req, res) => {
    let { username, dificulty, categories, numberOfQuestions } = req.body
    categories = JSON.parse(categories)
    let arrayQuestions =await questionGenerator(numberOfQuestions, dificulty, categories)
    let { pin, game_id } = await pinGenerator()
    if (req.userId === null) {
        await Game.findByIdAndUpdate(game_id,{questions:arrayQuestions,unloggedOwner:username})
    } else {
        await User.findById(req.userId, (err, resp) => { username = resp.username })
        await Game.findByIdAndUpdate(game_id,{questions:arrayQuestions,owner:req.userId})
    }

    res.send({ pin, game_id }) //respondo con la info y despues actualizo el modelo de forma asyncrona
});



const questionGenerator = async (numberOfQuestions, dificulty, categories) => {
    let arrayQuestions = []
    let selectedQuestions = []
    arrayQuestions = await Questions.find({ category: categories, difficulty: dificulty }, { _id: 1 })
    if (arrayQuestions.length < numberOfQuestions) {
        console.log(`pending to complete ${numberOfQuestions-arrayQuestions.length} questions`)
    }
    let numberResponseMongo = arrayQuestions.length
    for (let i = 0; i < numberOfQuestions - 1 && i < numberResponseMongo; i++) {
        let position = Math.floor(Math.random() * arrayQuestions.length)
        selectedQuestions.push(arrayQuestions[position])
        arrayQuestions.splice(position, 1)
    }
    return (selectedQuestions)
}





// 

















//  let username = req.body.username
// if (req.userId) {
//     await User.findById(req.userId, (err, resp) => { username = resp.username })
//     res.send("ok logged user")
// } else {

router.head('/join', async (req, res, next) => {  //<<--- validar username  (/:pincode/:username)
    // let actualGame = await Actualgames({ pin: req.body.pin })
    // if (actualGame == "") {
    //     res.send("not valid pin")
    // } else {
    //     if (req.userId) {
    //         //  await User.findById(req.userId, (err, resp) => { username = resp.username })
    //         res.send("user con token nombre usuario siempre valido")
    //     } else {

    //         let response = await Game.findById(actualGame.game_id).populate("User")
    //         if (response.noLogedUsers.indexOf(username) === -1 && response.users.username.indexOf()) {
    //             res.status(200)
    //         } else {
    //             res.status(409).
    //         }
    //     }
    // }


    //    res.json({ response: "Get->/game/join" })   //return 201 (ok) o (409(si falla) + body (error: "String")) (ultimo)
});


router.post('/join', async (req, res) => {    //<<<--- (pincode----username)

    let actualGame = await Actualgames.findOne({ pin: +req.body.pin });
    if (actualGame.game_id.id === "") {
        res.status(404).send("pincode not valid or game started") //falta posar e status correcte.
    } else {

        if (req.userId) {
            Game.findByIdAndUpdate(actualGame.game_id, { $push: { users: req.userId } })
        } else {
            Game.findByIdAndUpdate(actualGame.game_id, {
                $push: {
                    noLogedUsers: req.body.username
                }
            })
        }
        res.status(200).send(actualGame.game_id);
    }
});






module.exports = router;
