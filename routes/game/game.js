const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Game = require('../../models/game')
const Actualgames = require("../../models/actual")

const pinGenerator = async () => {
    let pin = Math.floor(Math.random() * 10000)
    let game_id = null
    if (await Actualgames.find({ pin }) == "") {
        let game = await Game.create({})
        game_id = game._id

        await Actualgames.create({ pin, game_id })

    } else {
        //apartir de 7000 salas va EXTREMADAMENTE LENTO... NOSE SI SERIA MEJOR BAJARME TODO EL ARRAY EN LOCAL I HACER LA VALIDACION LOCALMENTE. 
        return pinGenerator()
    }
    return { pin, game_id }
}
const addToGame = () => {
    
}


router.post('/', async (req, res) => {
    let username = req.body.username
    if (req.userId) {
        await User.findById(req.userId, (err, resp) => { username = resp.username })
    }
    let { pin, game_id } = await pinGenerator()
    res.send({ pin, game_id })
    Game.findByIdAndUpdate(game_id, { owner: req.userId },()=>console.log("game updated"))
});



router.head('/join', (req, res, next) => {  //<<--- validar username  (/:pincode/:username)
    res.json({ response: "Get->/game/join" })   //return 201 (ok) o (409(si falla) + body (error: "String")) (ultimo)
});


router.post('/join', (req, res) => {
    let username = req.body.username
    if (req.userId) {
        await User.findById(req.userId, (err, resp) => { username = resp.username })
    }

     //<<<--- (pincode----username)
    res.json({ response: "post ->/game/join" }) //(200 si ok) body  id de la sala (prioritari)
});






module.exports = router;
