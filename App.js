require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const cors = require('cors');
const Questions = require('./models/questions');
const questionsData = require('./seed/questions');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwtMiddleware = require('./routes/middleware/jwt');


mongoose
	.connect(`mongodb://localhost/${process.env.DBNAME}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(x => {
		console.log(`Connected to Mongo! Database name: ${x.connections[0].name}`	);
	})
	.catch(err => {
		console.error('Error connecting to mongo', err);
	});

Questions.countDocuments((err, count) => {
	if (count === 0) {
		Questions.create(questionsData);
	}
});


const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(cookieParser());
// ADD CORS SETTINGS HERE TO ALLOW CROSS-ORIGIN INTERACTION:
app.use(
	cors({
		credentials: true,
		origin: [process.env.FRONT] // <== this will be the URL of our React app (it will be running on port 3000)
	})
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));




/**
 * Create HTTP server.
 */

const server = http.createServer(app);

const io = require('socket.io')(server,{ handlePreflightRequest: (req, res) => {
	const headers = {
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
		"Access-Control-Allow-Credentials": true
	};
	res.writeHead(200, headers);
	res.end();
}})//), {pingTimeout:4000,pingInterval:1000});
require('./socket.js').connection(io);


const indexRouter = require('./routes/index')(io);
const authRouter = require('./routes/auth/auth');
const gameRouter = require('./routes/game/game');

//middleware jwt
app.use(jwtMiddleware);

app.use('/', indexRouter);
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
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});


module.exports = {
	app,
	global,
	server
};
