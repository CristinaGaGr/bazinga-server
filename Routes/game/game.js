const express = require('express');
const router = express.Router();

router.get('/newgame', (req, res, next) => {
    res.json({ response: "Get->/game/newgame" })
});


router.post('/newgame', (req, res) => {
    res.json({ response: "post ->/game/newgame" })

});



router.get('/join', (req, res, next) => {
    res.json({ response: "Get->/game/join" })
});


router.post('/join', (req, res) => {
    res.json({ response: "post ->/game/join" })

});


router.get('/waiting', (req, res, next) => {
    res.json({ response: "Get->/game/waiting" })
});


router.post('/waiting', (req, res) => {
    res.json({ response: "post ->/game/waiting" })

});


router.get('/Play', (req, res, next) => {
    res.json({ response: "Get->/game/Play" })
});


router.post('/Play', (req, res) => {
    res.json({ response: "post ->/game/Play" })

});




module.exports = router;
