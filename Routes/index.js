var express = require('express');
var router = express.Router();
var user = require('./../models/User')

function validateEmail(email) {
    console.log(email)
    var re = /[a-z0-9!#$%&'*+\=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/g;
    return re.test(email);
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        response: 'home'
    });
});
router.get('/me', (req, res, next) => {
    res.json({ response: "me->/me" })
});

router.get('/signup', (req, res, next) => {
    res.json({ response: "get->/Signup" })
});


router.post('/signup', async (req, res, next) => {
    let { username, password, repeatPassword, email } = req.body
    let error = {
        response: [],
        status: false
    }

    let responsedb = await user.find({ username })
    if (responsedb.length !== 0) {
        error.status = true
        error.response.push("username exists")
    }
    if (!validateEmail(email)) {
        error.status = true
        error.response.push("Email not valid")

    }

    if (password !== repeatPassword) {
        error.status = true
        error.response.push("Passwords are not identical")

    }

    if (error.status === false) {
        user.create({ username, password, email })
        res.json({ response: req.body, route: req.route.path, method: req.route.methods, error })
    } else {
        res.json(error)

    }
});

module.exports = router;
