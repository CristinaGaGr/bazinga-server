const Game = require('../../models/game')
const Actualgames = require("../../models/actual")
const questions = require('../../models/questions')
const valueCorrect = 1000 //
const maxResponseTime = 10000 //<--- tottal 10s


const calculateAnswerScore = (time) => {
	return Math.round(valueCorrect + valueCorrect * (1 - time / maxResponseTime))
}
// valueTime = valueCorrect - valueCorrect / maxResponseTime * 100

const randomOrderOfquestions = (correct, incorrects) => {
	let array = []
	let count = 0
	let positionOfCorrcetAnswer = Math.floor(Math.random() * incorrects.length + 1)
	for (let i = 0; i < 4; i++) {
		if (i === positionOfCorrcetAnswer) {
			array.push(correct)
		} else {
			array.push(incorrects[count])
			count++
		}

	}
	return array
}
const getNextCuestion = async (questionId, questionNumber, totalquestions) => {
	let response = { category: "", type: "", question: "", options: "", id: "", questionNumber: questionNumber + 1, totalQuestions: totalquestions }
	let questionResponse = await questions.findById(questionId)
	let mixedAnswers
	if (questionResponse.type === "multiple") {
		mixedAnswers = randomOrderOfquestions(questionResponse.correct_answer, questionResponse.incorrect_answers)

	} else {
		mixedAnswers = [questionResponse.correct_answer, questionResponse.incorrect_answers[0]]
	}
	response.category = questionResponse.category
	response.type = questionResponse.type
	response.question = questionResponse.question
	response.options = mixedAnswers
	response.id = questionResponse._id
	return response
}
const correctAnswer = async (questionId) => {
	let answer
	await questions.findById(questionId, async (err, questionsResponse) => {

		answer = questionsResponse.correct_answer

	})
	return String(answer)
}

const checkCorrectAnswer = async (questionId, answer) => {
	let correct = false
	if (answer === await correctAnswer(questionId)) {
		correct = true
	}
	return correct
}


const startListener = (socket, io) => {
	try {
		if (io.sockets.actualGame === undefined) {
			io.sockets.actualGame = {}
		}


		socket.on("/hello", (gameId, user) => {
			if (gameId !== null && user !== null) {
				if (io.sockets.actualGame[gameId] === undefined) {
					io.sockets.actualGame[gameId] = { numberOfAnswers: 0, numberOfPlayersAtRoom: 0, waitingResponse: true }
				}
				io.sockets.actualGame[gameId].numberOfPlayersAtRoom++
				socket.user = user
				socket.join(gameId)
				socket.room = gameId
				Game.findByIdAndUpdate(gameId, { $push: { users: user } }, { new: true }, (err, gameResponse) => {
					if (err) throw err;
					if (gameResponse !== null) {
						let UsersArray = []
						gameResponse.users.forEach(element => {
							UsersArray.push(element.username)
						})
						io.sockets.to(socket.room).emit('/user', UsersArray)
					}
				})
			} else {
				console.log("recived null username or gameId")
			}
		})

		socket.on("/bye", (user,owner) => {
			console.log("fjaslkd")
			try {
				if (owner) {
					console.log("isowner")
					Game.find(socket.room, (game) => {
						if (game.questionNumber === 0) {
							io.sockets.to(socket.room).emit('/die')
						}
					})
				} else {

					socket.leave(socket.room)
					Game.findByIdAndUpdate(socket.room, { $pull: { users: user } }, { new: true }, (err, gameResponse) => {
						if (gameResponse !== null) {
							let UsersArray = []
							gameResponse.users.forEach(element => {
								UsersArray.push(element.username)
							})
							io.sockets.to(socket.room).emit('/user', UsersArray)
						}
					})
				}
			} catch (error) {
				console.error(error)
			}
		})




		socket.on("/start", () => {
			try {
				Actualgames.findOneAndDelete({ game_id: socket.room }, (err, res) => {
				})
				Game.findById(socket.room, async (err, gameResponse) => {
					let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
					io.sockets.actualGame[socket.room].waitingResponse = true
					io.sockets.to(socket.room).in(socket.room).emit('/question', response)

				})
			} catch (error) {
				console.log(error)

			}

		})


		socket.on("/new-question", () => {
			try {
				if (io.sockets.actualGame[socket.room].waitingResponse) {
					io.sockets.actualGame[socket.room].waitingResponse = false
					Game.findByIdAndUpdate(socket.room, { $inc: { questionNumber: 1 } }, { new: true }, async (err, gameResponse) => {
						//	if (gameResponse.questionNumber <= gameResponse.questions.length) {
						let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length, gameResponse.questionNumber)
						io.sockets.to(socket.room).in(socket.room).emit('/question', response)
						//	}
					})
				}
			} catch (error) {
				console.log(error)
			}
		})




		socket.on("/answer", async (questionId, answer, time) => {
			try {
				io.sockets.actualGame[socket.room].numberOfAnswers++
				const currentGame = await Game.findById(socket.room);
				let ranking
				let points = 0
				if (await checkCorrectAnswer(questionId, answer)) {
					points = calculateAnswerScore(time)
				}
				if (currentGame.ranking.findIndex(obj => obj.user === socket.user.username) === -1) {
					ranking = { user: socket.user.username, score: points }
					currentGame.ranking.push(ranking)
				} else {
					currentGame.ranking[currentGame.ranking.findIndex(obj => obj.user === socket.user.username)].score += points
				}
				let savedAnswer = { user: socket.user, question: questionId, responseTime: time, answer: answer, points: points }
				if (io.sockets.actualGame[socket.room].numberOfAnswers === io.sockets.actualGame[socket.room].numberOfPlayersAtRoom) {
					io.sockets.actualGame[socket.room].waitingResponse = true
					io.sockets.to(socket.room).emit("/correct-answer", await correctAnswer(questionId))
					io.sockets.to(socket.room).emit("/ranking", currentGame.ranking)
					io.sockets.actualGame[socket.room].numberOfAnswers = 0
					if (currentGame.questionNumber === currentGame.questions.length) {
						setTimeout(() => {
							console.log("delete socket room")
							delete io.sockets.actualGame[socket.room]
						}, 1000 * 60);
					}
				} else {
					console.log("answer recived waiting all user answer")
				}
				currentGame.savedAnswer.push(savedAnswer)
				await currentGame.save()
			} catch (error) {
				console.log(error)
			}
		})
	} catch (error) {
		console.log("socket error")
		console.log(error)
	}

}

module.exports = {
	startListener
}