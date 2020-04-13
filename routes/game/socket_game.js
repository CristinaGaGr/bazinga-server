const Game = require('../../models/game')
const Actualgames = require("../../models/actual")
const questions = require('../../models/questions')
const valueCorrect = 2000
const maxResponseTime = 10000


const calculateAnswerScore = (time) => {
    return (Math.floor(valueCorrect - valueCorrect / maxResponseTime * (maxResponseTime - time)))
}
valueTime = valueCorrect - valueCorrect / maxResponseTime * 100

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
    let response = { category: "", type: "", question: "", options: "", id: "", questionNumber: questionNumber + 1, totalquestions: totalquestions + 1 }
    let questionsResponse = await questions.findById(questionId)
    let mixedAnswers
    console.log(questionsResponse)

    if (questionsResponse.type === "multiple") {
        mixedAnswers = await randomOrderOfquestions(questionsResponse.correct_answer, questionsResponse.incorrect_answers)

    } else {
        mixedAnswers = [questionsResponse.correct_answer, questionsResponse.incorrect_answers[0]]
    }
    response.category = questionsResponse.category
    response.type = questionsResponse.type
    response.question = questionsResponse.question
    response.options = mixedAnswers
    response.id = questionsResponse._id

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

        socket.on("/hello", (gameId, user) => {
            if (gameId !== null && user !== null) {

                socket.user = user
                socket.join(gameId)
                socket.room = gameId
                if (socket.numberOfUsers === undefined) {
                    socket.numberOfUsers = 1
                } else {
                    socket.numberOfUsers++

                }
                socket.recivedAnswers = 0
                Game.findByIdAndUpdate(gameId, { $push: { users: user } }, { new: true }, (err, gameResponse) => {
                    if (err) throw err;
                    if (gameResponse !== null) {
                        let UsersArray = []
                        gameResponse.users.forEach(element => {
                            UsersArray.push(element.username)
                        })
                        io.sockets.to(socket.room).emit('/user', UsersArray)
                        //nose como cojer la cookie! 

                        //falta incluir los usuarios logeados.

                    } else {
                        io.sockets.to(socket.room).emit('/user', [""])

                    }
                })
            } else {
                console.log("recived null username or gameId")
            }

        })
    } catch (error) {
console.log(error)
    }

    socket.on("/start", () => {
        try {

            Actualgames.findOneAndDelete({ game_id: socket.room }, (err, res) => {
            })
            Game.findById(socket.room, async (err, gameResponse) => {
                let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
                console.log("1 question", response)
                io.sockets.to(socket.room).in(socket.room).emit('/question', response)

            })
        } catch (error) {
            console.log(error)

        }

    })


    socket.on("/new-question", () => {
        try {
            console.log("newQuestion")
            socket.recivedAnswers++
            if (socket.recivedAnswers === socket.numberOfUsers) {
                socket.recivedAnswers = 0
                Game.findByIdAndUpdate(socket.room, { $inc: { questionNumber: 1 } }, { new: true }, async (err, gameResponse) => {
                    if (gameResponse.questionNumber <= gameResponse.questions.length) {
                        let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
                        console.log("question", response)
                        io.sockets.to(socket.room).in(socket.room).emit('/question', response)
                        if (gameResponse.questionNumber === gameResponse.questions.length) {
                            console.log("endgame")
                            io.sockets.clients(socket.room).forEach(function (s) {
                                s.leave(someRoom);
                                s.disconect()
                                socket.room.slice()
                            });
                        }
                    }

                })
            }
        } catch (error) {
            console.log(error)

        }

    })




    socket.on("/answer", async (questionId, answer, time) => {
        try {

            const currentGame = await Game.findById(socket.room);
            let ranking
            let points = 0
            socket.recivedAnswers++
            if (await checkCorrectAnswer(questionId, answer)) {
                points = calculateAnswerScore(time)
            }
            if (currentGame.ranking.findIndex(obj => obj.user === socket.user.username) === -1) {
                ranking = { user: socket.user.username, score: points }
                currentGame.ranking.push(ranking)
            } else {
                currentGame.ranking[currentGame.ranking.findIndex(obj => obj.user === socket.user.username)].score += points
            }
            await currentGame.save();
            let savedAnswer = { user: socket.user, question: questionId, responseTime: time, answer: answer, points: points }
            console.log(socket.numberOfUsers,socket.recivedAnswers)
            if (socket.recivedAnswers === socket.numberOfUsers) {
                io.sockets.to(socket.room).emit("/correct-answer", await correctAnswer(questionId))
                io.sockets.to(socket.room).emit("/ranking", currentGame.ranking)
                socket.recivedAnswers = 0

            } else {
                console.log("answer recived waiting all user answer")
            }
            currentGame.savedAnswer.push(savedAnswer)
            await currentGame.save()
        } catch (error) {
            console.log(error)

        }

    })

}

module.exports = {
    startListener
}