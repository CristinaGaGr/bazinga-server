const express = require('express');
const router = express.Router();
const User = require('../models/user');


module.exports = (io) => {
    router.get('/me', (req, res, next) => {
        if (req.userId) {
            User.findById(req.userId, (err, response) => {
                res.send({ username: response.username, id: response._id });
            })
        } else {
            res.send(null)
        }
    });

    return router;
};






