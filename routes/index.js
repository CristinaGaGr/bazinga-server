const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Jwt = require('jsonwebtoken')
function validateEmail(email) {
    const re = /[a-z0-9!#$%&'*+\=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/g;
    return re.test(email);
}
const UserCheckToken = express.Router();

UserCheckToken.use((req, res, next) => {
    const token = req.cookies.bazinga;
    if (token) {
        Jwt.verify(token, process.env.PRIVATEKEY, (err, decoded) => {
            if (err) {
                return res.json({ mensaje: 'Token inválida' });
            } else {
                req._id = decoded;
                next();
            }
        });
    } else {
        req._id = null;
        next();

    }
});



/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        response: 'home'
    });
});

router.post('/me', UserCheckToken, (req, res, next) => {
    if (req._id) {
        User.findById(req._id, (err, response) => {
            let { username, email } = response;
            res.json({ data: { username, email } });
        })
    } else {
        res.json({ response: "me->/me", user: req._id })

    }

});


router.post('/signup', async (req, res, next) => {
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
        User.create({ username: username + Math.random() * 230, password, email }, (err, respUser) => {
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

                    res.json({ error: "No valid password", login: false });

                }

            });

        }

    })

});




module.exports = router;
