export class Player {
  constructor(id, loc = 0, x = 0, y = 0, numAPlusses = 0) {
    this.id = id;
    this.loc = loc;
    this.x = x;
    this.y = y;
    this.numAPlusses = numAPlusses;
  }

  moveLoc(vertex) {
    this.loc = vertex.id;
    this.x = vertex.x * 32 - 16;
    this.y = vertex.y * 32 - 16;
  }
}
