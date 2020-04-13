const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Jwt = require('jsonwebtoken');


function validateEmail(email) {
    const re = /[a-z0-9!#$%&'*+\=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/g;
    return re.test(email);
}

const setCookie = (res, user) => {
    const token = Jwt.sign({ _id: user._id,username:user.username }, process.env.PRIVATEKEY, { expiresIn: '12h' });
    ('sendingcookie')
    res.cookie('bazinga', token, {
        maxAge: 43200000,
        httpOnly: false,
        secure: false
    });
};


router.post('/logout', (req, res) => {
    res.clearCookie('bazinga');
    res.json({ response: "Logout success" })
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
            setCookie(res, respUser);
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
                    setCookie(res, respUser);
                    res.json({ respUser, login: true });
                } else {
                    //401
                    res.status(401).send({ error: "No valid password", login: false });
                }
            });
        }
    })
});

module.exports = router;
