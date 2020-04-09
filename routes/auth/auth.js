const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const jwt = require("jsonwebtoken")
router.get('/signin', (req, res, next) => {
    res.json({ response: "Get->/auth/Signin" })
});


router.post('/logout', (req, res) => {
    res.json({ response: "post->/auth/logout" })
});

router.post('/delete', (req, res) => {
    User.findOneAndDelete({ username: req.body.username }, (err, response) => {
        if (err) throw err;
        if (response === null) {
            res.json({ action: "user not exist", response: response })

        } else {

            res.json({ action: "user Deleted", response: response })
        }

    })


});


module.exports = router;
