

const socketGame = require('./routes/game/socket_game')
const connection = (io) => {
	io.on('connection', socket => {
		socketGame.startListener(socket,io)
		console.log('New client connected');
		socket.on('disconnect', () => { 
			socket.numberOfUsers -= 1
			console.log('Client disconnected from',socket.room,socket.username,socket.numberOfUsers );
		})
		
	});

};
module.exports = {
	connection
}

