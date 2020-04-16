const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Jwt = require('jsonwebtoken');

try {

    const validateEmail = (email) => {
        const re = /[a-z0-9!#$%&'*+\=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/g;
        return re.test(email);
    };

    const setCookie = (res, user) => {
        const token = Jwt.sign({ _id: user._id, username: user.username }, process.env.PRIVATEKEY, { expiresIn: '30d' });
        res.cookie('bazinga', token, {
            maxAge: 43200000,
            httpOnly: true,
            secure: false
        });
    };


    router.post('/logout', (req, res) => {
        res.clearCookie('bazinga');
        res.json({ response: "Logout success" });
    });

    router.post('/delete', (req, res) => {
        User.findOneAndDelete({ username: req.body.username }, (err, response) => {
            if (err) throw err;
            if (response === null) {
                res.json({ action: "user not exist", response: response });
            } else {
                res.json({ action: "user Deleted", response: response });
            }
        });
    });


    router.post('/signup', async (req, res) => {
        let { username, password, repeatPassword, email } = req.body;
        let error = false;
        let responsedb = await User.find({ username });
        if ((/[^A-Za-z0-9]+/g).test(username)) {
            res.status(403).send({ error: "Invalid characters in username" });
            return;
        }
        if (responsedb.length !== 0) {
            res.status(401).send({ error: "Username alredy exists" });
            return;
        }
        if (!validateEmail(email)) {
            res.status(401).send({ error: "Email not valid" });
            return;
        }

        if (password !== repeatPassword) {
            res.status(401).send({ error: "Confirm password fields are identical" });
            return;
        }

        if (error === false) {
            User.create({ username: username, password, email }, (err, respUser) => {
                let { _id, username } = respUser;
                setCookie(res, { _id, username });
                res.json({ _id, username });
            });
        }
    });


    router.post('/signin', (req, res) => {
        let { username, password } = req.body;
        User.findOne({ username }, (err, respUser) => {
            if (err) throw err;
            if (respUser === null) {
                res.status(401).send({ error: "No valid password", login: false });

            } else {
                respUser.comparePassword(password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        let { _id, username } = respUser;
                        setCookie(res, { _id, username });
                        res.status(200).json({ _id, username });
                    } else {
                        res.status(401).send({ error: "No valid password", login: false });
                    }
                });
            }
        });
    });
} catch (err) {
    console.error(err);
}

module.exports = router;
