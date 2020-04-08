require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require('http');

const cors = require("cors");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose
    .connect(`mongodb://localhost/${process.env.DBNAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(x => {
        console.log(
            `Connected to Mongo! Database name: "${x.connections[0].name}"`
        );
    })
    .catch(err => {
        console.error("Error connecting to mongo", err);
    });

const indexRouter = require("./routes/index");
const authRouter = require('./routes/auth/auth');
const gameRouter = require('./routes/game/game');


const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));

// Middleware Setup

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:

app.use(
    cors({
        credentials: true,
        origin: [`http://localhost:${process.env.FRONT}`] // <== this will be the URL of our React app (it will be running on port 3000)
    })
);

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
