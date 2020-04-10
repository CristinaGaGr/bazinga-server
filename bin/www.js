#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../App');
const debug = require('debug')('express-generator-test:server');
const http = require('http');
const io = require("socket.io")(http)

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
});
server.on('error', onError);
server.on('listening', onListening);



io.sockets.on('connection', function (socket) {

  socket.on('start', function (id) {
    console.log("starting game")
    socket.emit('question', "rooms", 'General');
  })

  socket.on('answer', function (id) {
    console.log("answer recived")
    socket.emit('score', "rooms", 'General');
    socket.emit('question', "rooms", 'General');
  })

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log("disconect")
    socket.leave(socket.room);
  });


});








/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
