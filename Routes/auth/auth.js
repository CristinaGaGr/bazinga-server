const express = require('express');
const router = express.Router();
var User = require('./../../models/User')

router.get('/signin', (req, res, next) => {
    res.json({ response: "Get->/auth/Signin" })
});


router.post('/signin', (req, res) => {
    let { username, password } = req.body
    User.findOne({ username }, (err, user) => {
        if (err) throw err;
        if (user === null) {
            res.json(
                {
                    error: "User not exist"
                }
            )
        } else {
            user.comparePassword(password, function (err, isMatch) {

                if (err) throw err;

                if (isMatch) {

                    res.json({ login: true })

                } else {

                    res.json({ error: "No valid password", login: false })

                }

            });

        }

    })

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


router.post('/logout', (req, res) => {
    res.json({ response: "post->/auth/logout" })
});




module.exports = router;
