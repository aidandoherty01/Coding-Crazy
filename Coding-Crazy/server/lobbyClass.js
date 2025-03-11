export class Lobby {
  constructor(accessCode, maxPlayers = 6, difficulty = 5) {
    this.accessCode = accessCode;
    this.users = [];
    this.maxPlayers = maxPlayers;
    this.difficulty = difficulty;
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

  findUsername(id) {
    return this.users.find((item) => item.id === id);
  }
}
