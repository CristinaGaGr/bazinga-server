const Game = require('../../models/game')
const Actualgames = require("../../models/actual")
const Questions = require('../../models/questions')
const randomizer = (correct, incorrects) => {
    let array = []
    let count = 0
    let ok = Math.floor(Math.random() * incorrects.length + 1)
    for (let i = 0; i < 4; i++) {
        if (i === ok) {
            array.push(correct)
        } else {
            array.push(incorrects[count])
            count++
        }

    }
    return array
}

const startListener = (io) => {

    io.on("/hello", (gameId, user) => {
        console.log(user)
        io.username = user
        io.join(gameId)
        io.room = gameId
        Game.findByIdAndUpdate(gameId, { $push: { noLogedUsers: user } }, {new:true},(err,res) => { 
            io.emit('/user', res.noLogedUsers)
                    //nose como cojer la cookie!

                //falta incluir los usuarios logeados. 
        })
      
    })

    io.on("/start", (gameId) => {
        console.log("start", gameId)
        Game.findByIdAndUpdate(gameId, { gameStarted: true }, (err, res) => {
            console.log(res)
            Questions.findById(res.questions[res.questionNumber], async(err, resp) => {  
                console.log(resp)
                let mixedAnswers 
                if  (resp.type==="multiple") {
                    mixedAnswers = await randomizer(resp.correct_answer, resp.incorrect_answers)
                }else{
                    mixedAnswers = [resp.correct_answer, resp.incorrect_answers]
                }
                console.log({category:resp.category,type:resp.type,question:resp.question,options:mixedAnswers})
                io.emit('/question', {category:resp.category,type:resp.type,question:resp.question,options:mixedAnswers})
            })

        })

    })






}

module.exports = {
    startListener
}