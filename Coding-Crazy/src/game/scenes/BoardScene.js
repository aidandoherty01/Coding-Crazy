import Phaser from "phaser";
import { EventBus } from "../../game/EventBus";
import {
  Direction,
  EVENT_TYPE,
  make_original_digraph,
} from "../../data/board_graph";
import { Player } from "../../classes/playerClass";

class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.animation("SpriteAnimation", "../assets/sprite_animation.json");
  }

  create() {
    console.log(this.game.config.stateObject);
    this.socket = this.game.config.stateObject.socket;
    this.username = this.game.config.stateObject.username;
    this.players = Object.entries(this.game.config.stateObject.players).reduce(
      (acc, [key, p]) => {
        console.log(key, p);
        acc[key] = new Player(p.id, p.loc, p.x, p.y, p.numAPlusses);
        return acc;
      },
      {}
    );
    this.roomCode = String(this.game.config.stateObject.roomCode);
    console.log("socket: ", this.socket);
    console.log(this.players);
    console.log("🎮 BoardScene is now active!");

    this.add.image(0, 0, "board").setOrigin(0).setScale(0.5);

    this.original_board = make_original_digraph();
    if (this.game.config.stateObject.APlusLoc) {
      this.ANode = this.game.config.stateObject.APlusLoc;
    } else {
      this.ANode = Math.floor(Math.random() * 41) + 1;
    }
    console.log(this.game.config.stateObject.APlusLoc);
    this.original_board.getVertex(this.ANode).addEvent(EVENT_TYPE.A_plus);
    this.APlus = this.add
      .image(
        this.original_board.getVertex(this.ANode).x * 32 - 16,
        this.original_board.getVertex(this.ANode).y * 32 - 16,
        "A+"
      )
      .setScale(0.25);
    this.playerSprites = {};
    this.playerTitles = {};
    for (const pyer in this.players) {
      console.log("PYER: ", pyer);
      const xPix =
        this.original_board.getVertex(this.players[pyer].loc).x * 32 - 16;
      const yPix =
        this.original_board.getVertex(this.players[pyer].loc).y * 32 - 16;
      this.playerSprites[pyer] = this.add
        .sprite(xPix, yPix, "player", 6)
        .setScale(0.6);
      this.playerTitles[pyer] = this.add.text(xPix, yPix - 20, pyer, {
        fontSize: "16px Arial",
        fill: "rgba(255, 255, 255, 0.75)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: { left: 3, right: 3, top: 1.5, bottom: 1.5 },
      });
      this.playerTitles[pyer].setOrigin(0.5, 1);
    }
    console.log(this.players);
    console.log(this.username);

    this.testTurnButton = this.add.text(500, 50, "Start Turn", {
      font: "20px Arial",
      fill: "#ffffff",
      backgroundColor: "#ff0000",
      padding: { x: 10, y: 5 },
    });

    this.testTurnButton.setInteractive();
    this.testTurnButton.on("pointerdown", () => {
      this.startPlayerTurn();
    });

    this.APlusText = this.add.text(
      700,
      100,
      `Number of A+s: ${this.players[this.username].numAPlusses}`,
      {
        fontSize: "20px",
        fill: "#000000",
      }
    );

    this.socket.on("movement", (data) => {
      console.log(data);
      console.log(this.username);
      if (data.movingPlayer != this.username) {
        this.walkThePath(data.path, 0, 1, data.movingPlayer);
      }
    });

    this.socket.on("APlus_movement", (data) => {
      console.log(data);
      if (data.collector != this.username) {
        this.original_board
          .getVertex(this.ANode)
          .removeEvent(EVENT_TYPE.A_plus);
        this.ANode = data.loc;
        this.original_board.getVertex(this.ANode).addEvent(EVENT_TYPE.A_plus);
        this.APlus.setPosition(
          this.original_board.getVertex(this.ANode).x * 32 - 16,
          this.original_board.getVertex(this.ANode).y * 32 - 16
        );
        this.players[data.collector].numAPlusses += 1;
      }
    });

    this.events.on("shutdown", () => {
      this.socket.off("movement");
      this.socket.off("APlus_movement");
    });

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  startPlayerTurn() {
    this.scene.launch("QuestionScene", { questionLimit: 4 });

    // Listen for the event when the question scene ends
    const questionScene = this.scene.get("QuestionScene");
    questionScene.events.once("quizCompleted", this.onQuizCompleted, this);
  }

  onQuizCompleted(correctAnswers) {
    console.log(`✅ Quiz completed! Player got ${correctAnswers} correct.`);

    this.scene.pause();
    this.scene.launch("SpinnerScene", { correctAnswers });

    // Get the SpinnerScene and listen for spin results
    const spinScene = this.scene.get("SpinnerScene");
    spinScene.events.once(
      "spinResult",
      (spinResult) => this.moveSpace(spinResult, this.username),
      this
    );
  }

  moveSpace(spacesLeft, playerIndex) {
    console.log("Moving one space", playerIndex, this.players[playerIndex]);
    if (
      this.original_board.getNextMoves(this.players[playerIndex].loc).length ==
      1
    ) {
      //console.log(this.original_board.getNextMoves(this.playerNode));
      const pathToPoint = this.original_board
        .getNextMoves(this.players[playerIndex].loc)[0]
        .getPath();
      this.players[playerIndex].moveLoc(
        this.original_board.getVertex(
          this.original_board
            .getNextMoves(this.players[playerIndex].loc)[0]
            .getTo()
        )
      );
      console.log(this.socket);
      if (this.socket) {
        console.log(this.roomCode, this.username, pathToPoint);
        this.socket.emit("move_player", {
          roomCode: this.roomCode,
          username: this.username,
          path: pathToPoint,
        });
      }

      this.walkThePath(pathToPoint, 0, spacesLeft, playerIndex);
    } else {
      const generatedData = {
        player: this.players[playerIndex],
        board: this.original_board,
        currNode: this.players[playerIndex].loc,
      };
      this.events.once(
        "choiceMade",
        (choice) => {
          this.handleChoice(choice, spacesLeft, playerIndex);
        },
        this
      );
      this.scene.pause();
      this.scene.launch("ChoiceScene", generatedData);
    }
    return;
  }

  handleChoice(choice, spacesLeft, playerIndex) {
    this.players[playerIndex].moveLoc(
      this.original_board.getVertex(choice.getTo())
    );
    this.scene.resume();
    console.log(choice);
    if (this.socket) {
      this.socket.emit("move_player", {
        roomCode: this.roomCode,
        username: this.username,
        path: choice.path,
      });
    }
    this.walkThePath(choice.path, 0, spacesLeft, playerIndex);
  }

  walkThePath(path, index, spacesLeft, playerIndex) {
    console.log(path, index, spacesLeft, playerIndex);
    const pathDir = path[index];
    let x_val, y_val;
    if (pathDir == Direction.UP) {
      x_val = 0;
      y_val = -32;
      this.playerSprites[playerIndex].play("walk_north");
    } else if (pathDir == Direction.DOWN) {
      x_val = 0;
      y_val = 32;
      this.playerSprites[playerIndex].play("walk_south");
    } else if (pathDir == Direction.RIGHT) {
      x_val = 32;
      y_val = 0;
      this.playerSprites[playerIndex].play("walk_east");
    } else {
      x_val = -32;
      y_val = 0;
      this.playerSprites[playerIndex].play("walk_west");
    }
    this.tweens.add({
      targets: this.playerSprites[playerIndex],
      x: this.playerSprites[playerIndex].x + x_val,
      y: this.playerSprites[playerIndex].y + y_val,
      duration: 250,
      ease: "Linear",
      onUpdate: () => {
        // Keep the text above the sprite
        this.playerTitles[playerIndex].setPosition(
          this.playerSprites[playerIndex].x,
          this.playerSprites[playerIndex].y - 24
        );
      },
      onComplete: () => {
        if (index < path.length - 1) {
          this.walkThePath(path, index + 1, spacesLeft, playerIndex);
        } else if (spacesLeft > 1) {
          this.triggerEvents(playerIndex); //Eventually will be so it's based on the player
          this.moveSpace(spacesLeft - 1, playerIndex);
        } else {
          this.triggerEvents(playerIndex);
          return;
        }
      },
    });
  }

  triggerEvents(playerIndex) {
    const events = this.original_board
      .getVertex(this.players[playerIndex].loc)
      .getEvents();
    console.log(this.players[playerIndex].loc);
    console.log(events);
    for (let i = 0; i < events.length; i++) {
      this.handleEvent(events.at(i), playerIndex);
    }
  }

  handleEvent(ev, playerIndex) {
    console.log("EVENT:", ev);
    switch (ev) {
      case EVENT_TYPE.Nothing:
        break;
      case EVENT_TYPE.A_plus: {
        console.log("You got a star!");
        this.players[playerIndex].numAPlusses += 1;
        this.APlusText.setText(
          `Number of A+s: ${this.players[playerIndex].numAPlusses}`
        );
        let newALoc;
        do {
          newALoc = this.original_board.randomVertex();
        } while (newALoc === this.ANode);
        this.original_board
          .getVertex(this.ANode)
          .removeEvent(EVENT_TYPE.A_plus);
        this.ANode = newALoc;
        if (this.socket) {
          console.log(this.roomCode, this.username, newALoc);
          this.socket.emit("Aplus_moved", {
            roomCode: this.roomCode,
            username: this.username,
            loc: newALoc,
          });
        }
        this.original_board.getVertex(this.ANode).addEvent(EVENT_TYPE.A_plus);
        this.APlus.setPosition(
          this.original_board.getVertex(this.ANode).x * 32 - 16,
          this.original_board.getVertex(this.ANode).y * 32 - 16
        );
        break;
      }
      default:
        break;
    }
  }
}

export default BoardScene;
