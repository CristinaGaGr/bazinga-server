

const socketGame = require('./routes/game/socket_game')
const connection = (io) => {
	io.on('connection', socket => {
		socketGame.startListener(socket,io)
		console.log('New client connected',socket.rooms,socket.room, socket.id);
		socket.on('disconnect', () => console.log('Client disconnected'));
		
	});

};
module.exports = {
	connection
}

