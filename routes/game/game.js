const express = require('express');
const router = express.Router();



router.post('/game', (req, res) => {    //<<<<----- nueva partida (genero el id de la sala)  (prioritario)
    res.json({ response: "post ->/game/newgame" })
});



router.head('/join', (req, res, next) => {  //<<--- validar username  (/:pincode/:username)
    res.json({ response: "Get->/game/join" })   //return 201 (ok) o (409(si falla) + body (error: "String")) (ultimo)
});


router.post('/join', (req, res) => { //<<<--- (pincode----username) 
    res.json({ response: "post ->/game/join" }) //(200 si ok) body  id de la sala (prioritari)
});






module.exports = router;
