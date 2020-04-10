const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Jwt = require('jsonwebtoken')
function validateEmail(email) {
    // const re = /[a-z0-9!#$%&'*+\=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/g;
    // return re.test(email);
    return true;
}




/* GET home page. */
router.get('/', function (req, res, next) {
   res.send({ response: "I am alive" }).status(200);
});

router.get('/me', (req, res, next) => {
    if (req.userId) {
        User.findById(req.userId, (err, response) => {
            let { username, email } = response;
            res.send(username);
        })
    } else {
        res.send(null)
    }
});


router.post('/signup', async (req, res) => {
    let { username, password, repeatPassword, email } = req.body;
    let error = {
        response: [],
        status: false
    };

    let responsedb = await User.find({ username });
    if (responsedb.length !== 0) {
        error.status = true;
        error.response.push("username exists")
    }
    if (!validateEmail(email)) {
        error.status = true;
        error.response.push("Email are not valid")

    }

    if (password !== repeatPassword) {
        error.status = true;
        error.response.push("Passwords are not identical")
    }

    if (error.status === false) {
        User.create({ username: username, password, email }, (err, respUser) => {
            const token = Jwt.sign({ _id: respUser._id }, process.env.PRIVATEKEY, { expiresIn: '12h' });
            res.cookie('bazinga', token, {
                maxAge: 43200000,
                httpOnly: true,
                secure: false
            });
            res.json({ respUser, error })
        });
    } else {
        res.json(error)
    }
});


router.post('/signin', (req, res) => {
    let { username, password } = req.body
    User.findOne({ username }, (err, respUser) => {
        if (err) throw err;

        if (respUser === null) {
            res.json(
                {

                    error: "User not exist"
                }
            )
        } else {

            respUser.comparePassword(password, function (err, isMatch) {

                if (err) throw err;

                if (isMatch) {
                    const token = Jwt.sign({ _id: respUser._id }, process.env.PRIVATEKEY, { expiresIn: '12h' });
                    res.cookie('bazinga', token, {
                        maxAge: 43200000,
                        httpOnly: true,
                        secure: false
                    });
                    res.json({ respUser, login: true });

                } else {
                    //401
                    res.json({ error: "No valid password", login: false });

                }

            });

        }

    })

});




module.exports = router;
