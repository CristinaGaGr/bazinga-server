

const socketGame = require('./routes/game/socket_game')
const connection = (io) => {
	io.on('connection', socket => {
		socketGame.startListener(socket,io)
		console.log('New client connected');
		socket.on('disconnect', () => console.log('Client disconnected from'));
		
	});

};
module.exports = {
	connection
}

