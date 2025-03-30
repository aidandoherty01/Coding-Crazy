import { Player } from "../src/classes/playerClass.js";

export class gameSession {
  constructor(accessCode, maxPlayers = 6, difficulty = 5) {
    this.roomCode = accessCode;
    this.usernames = [];
    this.players = {};
    this.maxPlayers = maxPlayers;
    this.difficulty = difficulty;
    this.countdownStarted = false;
    this.countdown = 10;
    this.APlusLoc = Math.floor(Math.random() * 41) + 1; //In the future we'll make this based on the board selected
  }

  addUser(username) {
    this.usernames.push(username);
    this.players[username] = new Player(username);
  }

  deleteUser(username) {
    this.usernames = this.usernames.filter((user) => user.name !== username);
    delete this.players[username];
  }

  numPlayers() {
    return this.usernames.length;
  }

  full() {
    return this.usernames.length >= this.maxPlayers;
  }

  empty() {
    return this.usernames.length === 0;
  }

  findUsername(id) {
    return this.usernames.find((item) => item.id === id);
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
