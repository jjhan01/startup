// Event messages
const GameEndEvent = 'gameEnd';
const GameStartEvent = 'gameStart';

const start = document.getElementById("start");

const quiz = document.getElementById("quiz");

const question = document.getElementById("question");

const qImg = document.getElementById("qImg");

const choiceA = document.getElementById("A");

const choiceB = document.getElementById("B");

const choiceC = document.getElementById("C");

const counter = document.getElementById("counter");

const timeGauge = document.getElementById("timeGauge");

const progress = document.getElementById("progress");

const scoreDiv = document.getElementById("scoreContainer");

let questions = [

  {

    question : "Where is this temple located?",

      imgSrc : "favicon.ico",

      choiceA : "Correct",

      choiceB : "Wrong",

      choiceC : "Wrong",

      correct : "A"

  },{

      question : "What does CSS stand for?",

      imgSrc : "img/css.png",

      choiceA : "Wrong",

      choiceB : "Correct",

      choiceC : "Wrong",

      correct : "B"

  },{

      question : "What does JS stand for?",

      imgSrc : "img/js.png",

      choiceA : "Wrong",

      choiceB : "Wrong",

      choiceC : "Correct",

      correct : "C"

  }

];


const lastQuestion = questions.length - 1;

let runningQuestion = 0;


function renderQuestion(){

  let q = questions[runningQuestion];

 

  question.innerHTML = "<p>"+ q.question +"</p>";

  qImg.innerHTML = "<img src="+ q.imgSrc +">";

  choiceA.innerHTML = q.choiceA;

  choiceB.innerHTML = q.choiceB;

  choiceC.innerHTML = q.choiceC;

}


function renderProgress(){

  for(let qIndex = 0; qIndex <= lastQuestion; qIndex++){

      progress.innerHTML += "<div class='prog' id="+ qIndex +"></div>";

  }

}











const btnDescriptions = [
  { file: 'sound1.mp3', hue: 120 },
  { file: 'sound2.mp3', hue: 0 },
  { file: 'sound3.mp3', hue: 60 },
  { file: 'sound4.mp3', hue: 240 },
];

class Button {
  constructor(description, el) {
    this.el = el;
    this.hue = description.hue;
    this.sound = loadSound(description.file);
    this.paint(25);
  }

  paint(level) {
    const background = `hsl(${this.hue}, 100%, ${level}%)`;
    this.el.style.backgroundColor = background;
  }

  async press(volume) {
    this.paint(50);
    await this.play(volume);
    this.paint(25);
  }

  // Work around Safari's rule to only play sounds if given permission.
  async play(volume = 1.0) {
    this.sound.volume = volume;
    await new Promise((resolve) => {
      this.sound.onended = resolve;
      this.sound.play();
    });
  }
}

class Game {
  buttons;
  allowPlayer;
  sequence;
  playerPlaybackPos;
  mistakeSound;
  socket;

  constructor() {
    this.buttons = new Map();
    this.allowPlayer = false;
    this.sequence = [];
    this.playerPlaybackPos = 0;
    this.mistakeSound = loadSound('error.mp3');



    const playerNameEl = document.querySelector('.player-name');
    playerNameEl.textContent = this.getPlayerName();

    this.configureWebSocket();
  }

  async reset() {
    this.allowPlayer = false;
    this.playerPlaybackPos = 0;
    this.sequence = [];
    this.updateScore('--');
    await this.buttonDance(1);
    this.addButton();
    await this.playSequence();
    this.allowPlayer = true;

    // Let other players know a new game has started
    this.broadcastEvent(this.getPlayerName(), GameStartEvent, {});
  }

  getPlayerName() {
    return localStorage.getItem('userName') ?? 'Mystery player';
  }


  updateScore(score) {
    const scoreEl = document.querySelector('#score');
    scoreEl.textContent = score;
  }



  async saveScore(score) {
    const userName = this.getPlayerName();
    const date = new Date().toLocaleDateString();
    const newScore = { name: userName, score: score, date: date };

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newScore),
      });

      // Let other players know the game has concluded
      this.broadcastEvent(userName, GameEndEvent, newScore);

      // Store what the service gave us as the high scores
      const scores = await response.json();
      localStorage.setItem('scores', JSON.stringify(scores));
    } catch {
      // If there was an error then just track scores locally
      this.updateScoresLocal(newScore);
    }
  }

  updateScoresLocal(newScore) {
    let scores = [];
    const scoresText = localStorage.getItem('scores');
    if (scoresText) {
      scores = JSON.parse(scoresText);
    }

    let found = false;
    for (const [i, prevScore] of scores.entries()) {
      if (newScore > prevScore.score) {
        scores.splice(i, 0, newScore);
        found = true;
        break;
      }
    }

    if (!found) {
      scores.push(newScore);
    }

    if (scores.length > 10) {
      scores.length = 10;
    }

    localStorage.setItem('scores', JSON.stringify(scores));
  }

  // Functionality for peer communication using WebSocket

  configureWebSocket() {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    this.socket.onopen = (event) => {
      this.displayMsg('system', 'game', 'connected');
    };
    this.socket.onclose = (event) => {
      this.displayMsg('system', 'game', 'disconnected');
    };
    this.socket.onmessage = async (event) => {
      const msg = JSON.parse(await event.data.text());
      if (msg.type === GameEndEvent) {
        this.displayMsg('player', msg.from, `scored ${msg.value.score}`);
      } else if (msg.type === GameStartEvent) {
        this.displayMsg('player', msg.from, `started a new game`);
      }
    };
  }

  displayMsg(cls, from, msg) {
    const chatText = document.querySelector('#player-messages');
    chatText.innerHTML =
      `<div class="event"><span class="${cls}-event">${from}</span> ${msg}</div>` + chatText.innerHTML;
  }

  broadcastEvent(from, type, value) {
    const event = {
      from: from,
      type: type,
      value: value,
    };
    this.socket.send(JSON.stringify(event));
  }
}

const game = new Game();

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function loadSound(filename) {
  return new Audio('assets/' + filename);
}



