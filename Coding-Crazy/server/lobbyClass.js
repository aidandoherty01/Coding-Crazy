export class Lobby {
  constructor(accessCode, maxPlayers = 6, difficulty = 5) {
    this.accessCode = accessCode;
    this.users = [];
    this.maxPlayers = maxPlayers;
    this.difficulty = difficulty;
    this.countdownStarted = false;
    this.countdown = 10;
  }

  addUser(user) {
    this.users.push(user);
  }

  deleteUser(username) {
    this.users = this.users.filter((user) => user.name !== username);
  }

  numPlayers() {
    return this.users.length;
  }

  full() {
    return this.users.length >= this.maxPlayers;
  }

  empty() {
    return this.users.length === 0;
  }

  findUsername(id) {
    return this.users.find((item) => item.id === id);
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
