const express = require('express');
const router = express.Router();
var User = require('../../models/user')

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




router.post('/logout', (req, res) => {
    res.json({ response: "post->/auth/logout" })
});




module.exports = router;
