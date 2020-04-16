const Game = require('../../models/game');
const Actualgames = require("../../models/actual");
const questions = require('../../models/questions');
const valueCorrect = 1000;
const maxResponseTime = 10000;


const calculateAnswerScore = (time) => {
	return Math.round(valueCorrect + valueCorrect * (1 - time / maxResponseTime));
};

const randomOrderOfquestions = (correct, incorrects) => {
	console.log(correct);
	let array = [];
	let count = 0;
	let positionOfCorrcetAnswer = Math.floor(Math.random() * incorrects.length + 1);
	for (let i = 0; i < 4; i++) {
		if (i === positionOfCorrcetAnswer) {
			array.push(correct);
		} else {
			array.push(incorrects[count]);
			count++;
		}

	}
	return array;
};
const getNextCuestion = async (questionId, questionNumber, totalQuestions) => {
	let response = { category: "", type: "", question: "", options: "", id: "", questionNumber: questionNumber + 1, totalQuestions: totalQuestions };
	let questionResponse = await questions.findById(questionId);
	if (!questionResponse) {
		return;
	}
	let mixedAnswers;
	if (questionResponse.type === "multiple") {
		mixedAnswers = randomOrderOfquestions(questionResponse.correct_answer, questionResponse.incorrect_answers);

	} else {
		mixedAnswers = [questionResponse.correct_answer, questionResponse.incorrect_answers[0]].sort().reverse();
	}
	response.category = questionResponse.category;
	response.type = questionResponse.type;
	response.question = questionResponse.question;
	response.options = mixedAnswers;
	response.id = questionResponse._id;
	return response;
};
const correctAnswer = async (questionId) => {
	let answer;
	await questions.findById(questionId, async (err, questionsResponse) => {
		if (!questionsResponse) {
			return;
		}

		answer = questionsResponse.correct_answer;

	});
	return String(answer);
};

const checkCorrectAnswer = async (questionId, answer) => {
	return answer === await correctAnswer(questionId);
};


const startListener = (socket, io) => {
	try {
		if (io.sockets.actualGame === undefined) {
			io.sockets.actualGame = {};
		}

		socket.on("/hello", (gameId, user) => {
			console.log("hello")
			if (gameId && user) {
				if (io.sockets.actualGame[gameId] === undefined) {
					io.sockets.actualGame[gameId] = { numberOfAnswers: 0, numberOfPlayersAtRoom: 0, waitingResponse: true };
				}
				io.sockets.actualGame[gameId].numberOfPlayersAtRoom++;
				socket.user = user;
				socket.join(gameId);
				socket.room = gameId;
				console.log("socket.id", socket.id, "socket.room", socket.room, "socket.username", socket.username, "gameId", gameId, "usern", user);
				Game.findByIdAndUpdate(gameId, { $push: { users: user } }, { new: true }, (err, gameResponse) => {
					if (err || !gameResponse) {
						console.error(err);
					} else {

						if (gameResponse !== null) {
							let UsersArray = [];
							gameResponse.users.forEach(element => {
								UsersArray.push(element.username);
							});
							console.log(UsersArray);
							io.sockets.to(socket.room).emit('/user', UsersArray);
						}
					}
				});
			} else {
				console.log("recived null username or gameId");
			}
		});

		socket.on("/bye", (user, owner) => {
			console.log("bye")
			try {
				console.log(socket.id);
				if (owner) {
					console.log("/bye owner");
					Game.findById(socket.room, (err, game) => {
						if (err || !game) {
							console.error(err);
						} else {

							if (game.questionNumber === 0) {
								io.sockets.to(socket.room).emit('/die');
								socket.leave(socket.room);

							}
						}
					});
				} else {

					socket.leave(socket.room);
					Game.findByIdAndUpdate(socket.room, { $pull: { users: user } }, { new: true }, (err, gameResponse) => {
						if (err || !gameResponse) {
							console.error(err);
						} else {
							console.log("bye", socket.room);
							if (gameResponse !== null) {
								let UsersArray = [];
								gameResponse.users.forEach(element => {
									UsersArray.push(element.username);
								});
								io.sockets.to(socket.room).emit('/user', UsersArray);
							}
						}
					});
				}
			} catch (error) {
				console.error(error);
			}
		});




		socket.on("/start", () => {
			try {
				console.log("/start", socket.room);
				Actualgames.findOneAndDelete({ game_id: socket.room }, (err, res) => {
					if (err) {
						console.error(err);
					}
				});
				Game.findById(socket.room, async (err, gameResponse) => {
					if (err || !gameResponse) {
						console.error(err);
					} else {
						let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length);
						io.sockets.actualGame[socket.room].waitingResponse = true;
						io.sockets.to(socket.room).in(socket.room).emit('/question', response);
					}

				});
			} catch (error) {
				console.error(error);

			}

		});


		socket.on("/new-question", () => {
			console.log("new-question")
			console.log("sending new question", socket.room);
			try {
				if (io.sockets.actualGame[socket.room].waitingResponse) {
					io.sockets.actualGame[socket.room].waitingResponse = false;
					Game.findByIdAndUpdate(socket.room, { $inc: { questionNumber: 1 } }, { new: true }, async (err, gameResponse) => {
						if (err || !gameResponse) {
							console.error(err);
							return;
						}
						let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length, gameResponse.questionNumber);
						io.sockets.to(socket.room).in(socket.room).emit('/question', response);
					});
				}
			} catch (error) {
				console.error(error);
			}
		});

		socket.on("/waited", async (questionId) => {
			console.log("wait")
			console.log("sending correct answer waited");
			io.sockets.to(socket.room).emit("/correct-answer", await correctAnswer(questionId));
			console.log("sending ranking waited");
			const currentGame = await Game.findById(socket.room);
			if (currentGame) {
				io.sockets.actualGame[socket.room].waitingResponse = true;
				io.sockets.actualGame[socket.room].numberOfAnswers = 0;
				io.sockets.to(socket.room).emit("/ranking", currentGame.ranking);
			}
		});




		socket.on("/answer", async (questionId, answer, time) => {
			console.log("recived answer");
			try {
				io.sockets.actualGame[socket.room].numberOfAnswers++;
				const currentGame = await Game.findById(socket.room);
				if (!currentGame) {
					console.log("error");
					return;
				}
				let ranking;
				let points = 0;
				if (await checkCorrectAnswer(questionId, answer)) {
					points = calculateAnswerScore(time);
				}
				if (points < 0 || points > (valueCorrect * 2)) {
					console.log("filtering points");
					points = 0;
				}
				if (currentGame.ranking.findIndex(obj => obj.user === socket.user.username) === -1) {
					ranking = { user: socket.user.username, score: points };
					currentGame.ranking.push(ranking);
				} else {
					currentGame.ranking[currentGame.ranking.findIndex(obj => obj.user === socket.user.username)].score += points;
				}
				console.log("responsetime:", time, "answer points:", points, "acumuled points:", currentGame.ranking[currentGame.ranking.findIndex(obj => obj.user === socket.user.username)].score, "number of answers", io.sockets.actualGame[socket.room].numberOfAnswers, "players at room", io.sockets.actualGame[socket.room].numberOfPlayersAtRoom);
				let savedAnswer = { user: socket.user, question: questionId, responseTime: time, answer: answer, points: points };
				if (io.sockets.actualGame[socket.room].numberOfAnswers === io.sockets.actualGame[socket.room].numberOfPlayersAtRoom) {
					io.sockets.actualGame[socket.room].waitingResponse = true;
					console.log("sending correct answer");
					io.sockets.to(socket.room).emit("/correct-answer", await correctAnswer(questionId));
					console.log("sending ranking");
					io.sockets.to(socket.room).emit("/ranking", currentGame.ranking);
					console.log("rankiing-->", currentGame.ranking);
					io.sockets.actualGame[socket.room].numberOfAnswers = 0;
				} else {
					console.log("answer recived waiting all user answer");
				}
				currentGame.savedAnswer.push(savedAnswer);
				await currentGame.save();
			} catch (error) {
				console.error(error);
			}
		});
	} catch (error) {
		console.log("socket error");
		console.log(error);
	}

};

module.exports = {
	startListener
};