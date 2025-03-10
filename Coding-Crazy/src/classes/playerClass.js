import { Vertex } from "../data/board_graph";
import Phaser from "phaser";
export class Player {
  constructor(id) {
    this.id = id;
    this.loc = 0;
    this.x = 0;
    this.y = 0;
    this.numAPlusses = 0;
  }

  moveLoc(vertex) {
    this.loc = vertex.id;
    this.x = vertex.x * 32 - 16;
    this.y = vertex.y * 32 - 16;
  }
}
