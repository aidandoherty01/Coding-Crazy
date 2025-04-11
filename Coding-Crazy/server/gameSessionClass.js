import { Player } from "../src/classes/playerClass.js";

export class gameSession {
  constructor(accessCode, maxPlayers = 6, difficulty = 5) {
    this.roomCode = accessCode;
    // this.usernames = [];  // Array of usernames (strings)
    this.players = {};  // Player objects (from playerClass.js)
    this.maxPlayers = maxPlayers;
    this.difficulty = difficulty;
    this.countdownStarted = false;
    this.countdown = 10;
    this.APlusLoc = Math.floor(Math.random() * 41) + 1; //In the future we'll make this based on the board selected
  }

  addUser(username) {
    this.players[username] = new Player(username);
  }

  deleteUser(username) {
    delete this.players[username];
  }

  findUsername(username) {
    return this.players[username] ? username : "";
  }

  getUsernames() {
    return Object.keys(this.players);
  }

  numPlayers() {
    return this.getUsernames().length;
  }

  full() {
    return this.numPlayers() >= this.maxPlayers;
  }

  empty() {
    return this.numPlayers() === 0;
  }

  countingDown() {
    return this.countdownStarted;
  }

  startCountdown() {
    this.countdownStarted = true;
  }

  tickCount() {
    this.countdown--;
  }

  reachedZero() {
    return this.countdown <= 0;
  }

  resetCountdown() {
    this.countdown = 10;
    this.countdownStarted = false;
  }
}
