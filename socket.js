

const socketGame = require('./routes/game/socket_game')
const connection = (io) => {
	io.on('connection', socket => {
		console.log("Number of conected users at socket:", io.engine.clientsCount, socket.user, socket.id)

		socketGame.startListener(socket, io)
		console.log('New user connected');
		socket.on('disconnect', () => {
			try {
				io.sockets.actualGame[socket.room].numberOfPlayersAtRoom--
				io.in(socket.room).emit("/answer", null, null, null, true);
		
			
			} catch (error) {

			}
			console.log('User disconnected');
		})

	});

};
module.exports = {
	connection
}

