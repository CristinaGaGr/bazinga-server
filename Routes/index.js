var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.json({
        response: 'home'
    });
});
router.get('/me', (req, res, next) => {
    res.json({ response: "me->/me" })
});



module.exports = router;
