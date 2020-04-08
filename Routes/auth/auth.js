const express = require('express');
const router = express.Router();

router.get('/signin', (req, res, next) => {
    res.json({ response: "Get->/auth/Signin" })
});


router.post('/signin', (req, res) => {
    res.json({ response: "post ->/auth/Signin" })

});


router.get('/signup', (req, res, next) => {
    res.json({ response: "get->/auth/Signup" })
});


router.post('/signup', async (req, res, next) => {
    res.json({ response: "post->/auth/signup" })

});


router.post('/logout', (req, res) => {
    res.json({ response: "post->/auth/logout" })
});




module.exports = router;
