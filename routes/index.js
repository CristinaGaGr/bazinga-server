const express = require('express');
const router = express.Router();
const User = require('../models/user');


module.exports = (io) => {
    router.get('/me', (req, res, next) => {
        if (req.userId) {
            User.findById(req.userId, (err, response) => {
                let { username, email } = response;
                res.send(username);
                io.emit('FromAPI', 'FROM ME');
                setTimeout(() => {
                    io.emit('FromAPI', 'SECOND ROUND');
                }, 1000);
            })
        } else {
            res.send(null)
        }
    });

    return router;
};






