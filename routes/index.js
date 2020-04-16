const express = require('express');
const router = express.Router();
const User = require('../models/user');


module.exports = (io) => {
    router.get('/me', (req, res, next) => {
        if (req.userId) {
            User.findById(req.userId._id, (err, response) => {
                if (response !== null) {
                    
                    res.send({ username: response.username, _id: response._id });
                } else {
                    
                    res.send(null);
                }
            });
        } else {
            res.send(null);
        }
    });




    return router;
};






