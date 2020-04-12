const Game = require('../../models/game')
const Actualgames = require("../../models/actual")
const questions = require('../../models/questions')
const valueCorrect = 2000
const maxResponseTime = 20000


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

const checkCorrectAnswer = async (questionId, answer) => {
    let correct = false
    await questions.findById(questionId, async (err, questionsResponse) => {
        if (answer === questionsResponse.correct_answer) {
            correct = true
        }
    })
    return correct
}


const startListener = (io) => {

    io.on("/hello", (gameId, user) => {
        io.username = user
        io.join(gameId)
        io.room = gameId
        console.log(io.room)
        if (io.numberOfUsers === undefined) {
            io.numberOfUsers = 0
        } else {
            io.numberOfUsers++
        }
        io.numberOfUsers = io.numberOfUsers + 1
        io.recivedAnswers =0
        Game.findByIdAndUpdate(gameId, { $push: { noLogedUsers: user } }, { new: true }, (err, gameResponse) => {
            io.emit('/user', gameResponse.noLogedUsers)
            //nose como cojer la cookie!

            //falta incluir los usuarios logeados. 
        })

    })

    io.on("/start", () => {
        console.log("number of users-->",io.numberOfUsers)
        console.log("recived answers-->",io.recivedAnswers)

        Actualgames.findOneAndDelete({ game_id: io.room }, (err, res) => {
            console.log(err, res)
        })
        Game.findById(io.room, async (err, gameResponse) => {
            let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
            io.emit('/question', response)

        })

    })

    io.on("/answer", (questionId, answer, time) => {
        let points = 0
        io.recivedAnswers++
        console.log(io.numberOfUsers)
        console.log(io.recivedAnswers)

        if (checkCorrectAnswer(questionId, answer)) {
            points = calculateAnswerScore(time)
        }
        if (io.recivedAnswers === io.numberOfUsers) {
            console.log("all answers recived sending response ")
            io.recivedAnswers= 0
        }
        let ranking = { user: io.username, }
        let results = { user: io.username, question: questionId, responseTime: time, answer: answer, points: points }
        Game.findByIdAndUpdate(io.room, { $inc: { questionNumber: 1 }, $push: { results: results } }, { new: true }, async (err, gameResponse) => {
          //  console.log(gameResponse.questionNumber, gameResponse.questions.length)
            if (gameResponse.questionNumber !== gameResponse.questions.length) {
                let response = await getNextCuestion(gameResponse.questions[gameResponse.questionNumber], gameResponse.questionNumber, gameResponse.questions.length)
                io.emit('/question', response)

            } else {
                console.log("game end")
            }

        })

    })

}

module.exports = {
            startListener
        }