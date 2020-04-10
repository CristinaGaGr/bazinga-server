require("dotenv").config();
const jwtDecode = require('jwt-decode')
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require('http');
const Jwt = require('jsonwebtoken')
const fs = require("fs")
const cors = require("cors");
const Questions = require("./models/questions")
const routeToQuestions ="seed/questions.json"
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose
    .connect(`mongodb://localhost/${process.env.DBNAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(x => {
        console.log(
            `Connected to Mongo! Database name: "${x.connections[0].name}"`
        );
    })
    .catch(err => {
        console.error("Error connecting to mongo", err);
    });

Questions.countDocuments((err, count) => {
    if (count === 0) {
        fs.readFile(routeToQuestions, (err, data) => {
            if (err) throw err;
            Questions.create(JSON.parse(data))

        })
    } 
})
const indexRouter = require("./routes/index");
const authRouter = require('./routes/auth/auth');
const gameRouter = require('./routes/game/game');


const app = express();


// Middleware Setup

app.use(logger("dev"));
app.use(cookieParser());

// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:

app.use(
    cors({
        credentials: true,
        origin: [`http://localhost:${process.env.FRONT}`] // <== this will be the URL of our React app (it will be running on port 3000)
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



//middleware jwt

app.use((req, res, next) => {
    const token = req.cookies.bazinga;
    if (token) {
        Jwt.verify(token, process.env.PRIVATEKEY, (err, decoded) => {
            if (err) {
                next()

                return res.json({ mensaje: 'Token inválida' });
            } else {
                req.userId = decoded;
                next();
            }
        });
    } else {
        req.userId = '5e906d024ca19c4c94e0a6f4';
        // req.userId = null;
        next();

    }

});

app.use("/", indexRouter);
app.use('/game', gameRouter);
app.use('/auth', authRouter);
// 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});



module.exports = app;
