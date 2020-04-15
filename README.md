
# BAZZINGA!
The new quizz game

![quiz](https://media.giphy.com/media/TfEceTuCZkd1u/giphy.gif
)

## What is Bazzinga?

Bazzinga is a movile quizz game that allows users to compete against friends. 

PORT=4000
DBNAME=BAZINGA
FRONT=https://bazinga.ragulion.online
BACK=https://apibazinga.ragulion.online
PRIVATEKEY=BAZINGATOKENKEY



The game's questions are based on 9 knowledge categories: 

- Books :blue_book:
- Films :cinema:
- Music :musical_note:
- TV :tv:
- Videogames :video_game
- Science & Nature :microscope:
- Sports :football:
- Geography :earth_americas:
- History :page_with_curl:

The game has 9 cartoonish iconic characters, one to represent each category. 
The objective of the game is to anwers questions correctly and in doing so, beat your opponents! The time limit to answer the given questions is 20 seconds.

A player may start a new game by pressing the CREATE button on the app. That player will be the owner of the game and will provide a numeric pin code to their friends to join the game.
The owner can set in the game: Number of questions, Categories and Difficulty.
Once your friends are in the game Starts!!!

The questions can be True/False or they can have 4 answers (with only 4 correct).
It is important to answer correctly and as soon as possible, since response time is also considered.
After each question a board with the results are shown for making the game more competitive.
The final ranking is shown after the last question :trophy:

The quizz game is free-to-use BUT if you decide to register you have some benefits like seeing your game history.



### USER CAN:
- SignUp / SignIn / Logut (not mandatory)
- Create a new game
- Join a game
- If you are the owner: Configure the game
- Compete with friends
- See ranking
- If you have an account: See history games


### MVP
- Movile quizz game  :iphone:
- A complete multiplayer live game
- Display X number of questions randomly from the chosen categories
- Sum the points of each user (for correct answer and response time) and show them
- Making a raking of each game
- Be very visual




### Models

````
const question = new Schema({
    category: String,
    type: String,
    difficulty: String,
    question: { type: String},
    correct_answer: String,
    incorrect_answers: Array
});



const game = new Schema({
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    pinCode: Number,
    status: String,
    gameStarted: Boolean,
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    actualQuestion: Number,
    results: [{ type: Schema.Types.ObjectId, ref: 'responses' }]
});



const User = new Schema({
    password: String,
    username: { type: String, unique: true }
});


const responses = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    responseTime: Number,
    answer: String,
});
````


