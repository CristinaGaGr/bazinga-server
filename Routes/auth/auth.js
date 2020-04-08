const express = require('express');
const router = express.Router();
var user = require('./../../models/User')

router.get('/signin', (req, res, next) => {
    res.json({ response: "Get->/auth/Signin" })
});


router.post('/signin', (req, res) => {

    res.json({ response: "post ->/auth/Signin" })

});




router.post('/logout', (req, res) => {
    res.json({ response: "post->/auth/logout" })
});




module.exports = router;
