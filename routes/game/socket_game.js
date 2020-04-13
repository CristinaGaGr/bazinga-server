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

    await questions.findById(questionId, async (err, questionsResponse) => {
        let mixedAnswers
        console.log(questionsResponse.correct_answer)

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
    })
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

    socket.on("/hello", (gameId, user) => {
        socket.username = user
        socket.join(gameId)
        socket.room = gameId
        console.log(socket.room, user)
        if (socket.numberOfUsers === undefined) {
            socket.numberOfUsers = 1
            console.log("user number 1")
        } else { 
            socket.numberOfUsers++
        }
        socket.recivedAnswers = 0
        Game.findByIdAndUpdate(gameId, { $push: { noLogedUsers: user.username } }, { new: true }, (err, gameResponse) => {
            io.sockets.to(socket.room).emit('/user', gameResponse.noLogedUsers)
            //nose como cojer la cookie!

            //falta incluir los usuarios logeados. 
        })

    })

    socket.on("/start", () => {
        Actualgames.findOneAndDelete({ game_id: socket.room }, (err, res) => {
            console.log(err, res)
        })
        Game.findById(socket.room, async (err, gameResponse) => {
            let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)

            io.sockets.to(socket.room).emit('/question', response)

        })

    })

    socket.on("/answer", async (questionId, answer, time) => {
    
        const CurrentGame = await Game.findById(socket.room);
        let ranking
        let points = 0
        socket.recivedAnswers++
        console.log(socket.numberOfUsers)
        console.log(socket.recivedAnswers)
        if (await checkCorrectAnswer(questionId, answer)) {
            points = calculateAnswerScore(time)
        }
        if (CurrentGame.ranking.findIndex(obj => obj.user === socket.username.username) === -1) {
            ranking = { user: socket.username.username, score: points }
            CurrentGame.ranking.push(ranking)
        } else {
            CurrentGame.ranking[CurrentGame.ranking.findIndex(obj => obj.user === socket.username.username)].score += points
            console.log(CurrentGame.ranking[CurrentGame.ranking.findIndex(obj => obj.user === socket.username.username)].score)
        }
        await CurrentGame.save();
        let results = { user: socket.username.username, question: questionId, responseTime: time, answer: answer, points: points }
        if  (socket.recivedAnswers === socket.numberOfUsers) {
            console.log("all answers recived sending response ")
            io.sockets.to(socket.room).emit("/correct-answer", await correctAnswer(questionId))
            io.sockets.to(socket.room).emit("/ranking", CurrentGame.ranking)
            console.log(socket.recivedAnswers)
            socket.recivedAnswers = 0
            console.log(socket.recivedAnswers)
            Game.findByIdAndUpdate(socket.room, { $inc: { questionNumber: 1 }, $push: { results: results } }, { new: true }, async (err, gameResponse) => {
                if (gameResponse.questionNumber !== gameResponse.questions.length) {
                    let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
                    io.sockets.to(socket.room).in(socket.room).emit('/question', response)

                } else {
                    console.log("game end")
                }

            })
        } else {
            console.log("answer recived waiting all user answer")
            Game.findByIdAndUpdate(socket.room, { results: results })
        }


    })

}

module.exports = {
    startListener
}