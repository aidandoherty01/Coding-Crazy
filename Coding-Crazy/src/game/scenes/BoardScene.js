import Phaser from "phaser";
import { EventBus } from "../../game/EventBus";
import {
  Direction,
  EVENT_TYPE,
  make_original_digraph,
} from "../../data/board_graph";
import { Player } from "../../classes/playerClass";
import UIStyles from "../../css/uiStyles";

class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.animation("SpriteAnimation", "../assets/sprite_animation.json");
  }

  create() {
    this.socket = this.game.config.stateObject.socket;
    this.username = this.game.config.stateObject.username;
    this.usernameList = Object.keys(this.game.config.stateObject.players);
    this.yourTurn =
      this.username ===
      this.usernameList[this.game.config.stateObject.currPlayer];
    console.log(this.game.config.stateObject.currPlayer);
    console.log(this.usernameList[this.game.config.stateObject.currPlayer]);
    console.log(this.yourTurn);
    this.players = Object.entries(this.game.config.stateObject.players).reduce(
      (acc, [key, p]) => {
        console.log(key, p);
        acc[key] = new Player(p.id, p.loc, p.x, p.y, p.numAPlusses);
        return acc;
      },
      {}
    );
    this.roomCode = String(this.game.config.stateObject.roomCode);
    this.turnsLeft =
      this.game.config.stateObject.numTurns -
      this.game.config.stateObject.currTurn;
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

    this.testMinigame = this.add.text(300, 50, "Minigame", {
      font: "20px Arial",
      fill: "#ffffff",
      backgroundColor: "#ff0000",
      padding: { x: 10, y: 5 },
    });

    this.testMinigame.setInteractive();
    this.testMinigame.on("pointerdown", () => {
      this.startMinigame();
    });

    this.testTurnButton = this.add.text(500, 50, "Start Turn", {
      font: "20px Arial",
      fill: "#ffffff",
      backgroundColor: "#ff0000",
      padding: { x: 10, y: 5 },
    });

    this.testTurnButton.setInteractive();
    this.testTurnButton.on("pointerdown", () => {
      if (this.yourTurn) {
        this.yourTurn = false;
        this.startPlayerTurn();
      }
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

    this.socket.on("next_turn", (data) => {
      console.log(data);
      this.cleanUpAndTokenPass(data);
      this.startUpTurn();
    });

    this.socket.on("full_turn", (data) => {
      console.log(data);
      this.cleanUpAndTokenPass(data);
      this.betweenTurnsToStart();
    });

    this.socket.on("game_complete", (data) => {
      console.log(data);
      //Do end game actions
      this.endMessage();
      localStorage.setItem("isReconnect", "false");
      localStorage.removeItem("roomCode");
      window.dispatchEvent(new Event("reconnect"));
    });

    this.socket.on("spin_move", (data) => {
      console.log(data);
      this.topMessage.setText(`${data.movingPlayer} spun a ${data.spinRes}!`);
      this.topMessage.setPosition(
        this.boxX + (this.boxWidth - this.topMessage.width) / 2,
        this.boxY + (this.boxHeight - this.topMessage.height) / 3
      );
    });

    this.events.on("shutdown", () => {
      this.socket.off("movement");
      this.socket.off("APlus_movement");
      this.socket.off("next_turn");
      this.socket.off("full_turn");
      this.socket.off("game_complete");
      this.socket.off("spin_move");
    });

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
    this.createMessageBar(
      1024,
      1024,
      `${this.usernameList[this.game.config.stateObject.currPlayer]}'s Turn`,
      `Turn ${this.game.config.stateObject.currTurn + 1} of ${
        this.game.config.stateObject.numTurns
      }`
    );
    this.startUpTurn();
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
      (spinResult) => {
        if (this.socket) {
          this.socket.emit("SpinnerResult", {
            spinRes: spinResult,
            username: this.username,
            roomCode: this.roomCode,
          });
        }
        this.moveSpace(spinResult, this.username);
      },
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
          console.log(
            "PI ",
            playerIndex,
            " loc ",
            this.players[playerIndex].loc
          );
          this.triggerEvents(playerIndex);
          if (this.socket && playerIndex == this.username) {
            console.log(
              "LOC",
              this.players[playerIndex].loc,
              this.username,
              this.roomCode
            );
            this.socket.emit("player_landing", {
              roomCode: this.roomCode,
              username: this.username,
              loc: this.players[playerIndex].loc,
            });
          } else if (this.usernameList.length === 1) {
            //Guest
            this.game.config.stateObject.currTurn++;
            if (
              this.game.config.stateObject.currTurn <
              this.game.config.stateObject.numTurns
            ) {
              this.betweenTurnsToStart();
            } else {
              this.endMessage();
            }
          }
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

  cleanUpAndTokenPass(data) {
    console.log(data);
    if (data.movingPlayer != this.username) {
      console.log("DATA LOC", data.loc);
      this.players[data.movingPlayer].moveLoc(
        this.original_board.getVertex(data.loc)
      );
      this.tweens.add({
        targets: this.playerSprites[data.movingPlayer],
        x: this.players[data.movingPlayer].x,
        y: this.players[data.movingPlayer].y,
        duration: 20,
        ease: "Linear",
        onUpdate: () => {
          // Keep the text above the sprite
          this.playerTitles[data.movingPlayer].setPosition(
            this.playerSprites[data.movingPlayer].x,
            this.playerSprites[data.movingPlayer].y - 24
          );
        },
      });
    }
    this.yourTurn = this.username === data.nextPlayer;
    console.log(data.nextPlayer);
    this.topMessage.setText(`${data.nextPlayer}'s Turn`);
    this.topMessage.setPosition(
      this.boxX + (this.boxWidth - this.topMessage.width) / 2,
      this.boxY + (this.boxHeight - this.topMessage.height) / 3
    );
  }

  startUpTurn() {
    if (this.yourTurn) {
      this.scene.launch("MessageScene", { message: "Your Turn Begins Now!" });

      this.time.delayedCall(2500, () => {
        this.scene.stop("MessageScene");
        this.startPlayerTurn();
      });
    }
  }

  endMessage() {
    if (this.usernameList.length === 1) {
      this.scene.launch("MessageScene", { message: "Well Done!" });
      return;
    }
    const sortedPlayers = Object.values(this.players).sort(
      (a, b) => b.numAPlusses - a.numAPlusses
    );
    if (
      sortedPlayers[0].id === this.username &&
      sortedPlayers[0].numAPlusses !== sortedPlayers[1].numAPlusses
    ) {
      //Solo win
      this.scene.launch("MessageScene", { message: "You won!" });
    } else if (
      this.players[this.username].numAPlusses === sortedPlayers[0].numAPlusses
    ) {
      //Tie game
      this.scene.launch("MessageScene", { message: "You tied for first!" });
    } else {
      this.scene.launch("MessageScene", { message: "Better luck next time!" });
    }
  }

  betweenTurnsToStart() {
    //Spot to start up minigame
    //Note: Turn token is already passed in clean-up function,
    //So when minigame ends, just work with what's already set for next turn

    //Now all the stuff after the minigame
    this.turnsLeft--;
    this.bottomMessage.setText(
      `Turn ${this.game.config.stateObject.numTurns - this.turnsLeft + 1} of ${
        this.game.config.stateObject.numTurns
      }`
    );
    this.bottomMessage.setPosition(
      this.boxX + (this.boxWidth - this.bottomMessage.width) / 2,
      this.boxY + (2 * (this.boxHeight - this.bottomMessage.height)) / 3
    );
    this.startUpTurn();
  }

  //Taken from questionScene
  //Using for top messages
  createMessageBar(width, height, topMessage, bottomMessage) {
    this.boxWidth = width * 1;
    this.boxHeight = height * 0.125;
    this.boxX = (width - this.boxWidth) / 2;
    this.boxY = 0;

    // Background for question box
    const background = this.add.graphics();
    background.fillStyle(
      UIStyles.background.color,
      UIStyles.background.opacity
    );
    background.fillRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      UIStyles.background.borderRadius
    );
    background.lineStyle(
      UIStyles.background.borderThickness,
      UIStyles.background.borderColor,
      UIStyles.background.borderOpacity
    );
    background.strokeRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      UIStyles.background.borderRadius
    );
    background.setDepth(1);

    // text
    this.topMessage = this.add.text(
      this.boxX + this.boxWidth / 2,
      this.boxY + this.boxHeight / 3,
      topMessage,
      {
        ...UIStyles.questionText,
        wordWrap: { width: this.boxWidth - 100 },
        align: "center",
      }
    );

    this.topMessage.setPosition(
      this.boxX + (this.boxWidth - this.topMessage.width) / 2,
      this.boxY + (this.boxHeight - this.topMessage.height) / 3
    );

    this.bottomMessage = this.add.text(
      this.boxX + this.boxWidth / 2,
      this.boxY + (2 * this.boxHeight) / 3,
      bottomMessage,
      {
        ...UIStyles.btmMsgText,
        wordWrap: { width: this.boxWidth - 100 },
        align: "center",
      }
    );

    this.bottomMessage.setPosition(
      this.boxX + (this.boxWidth - this.bottomMessage.width) / 2,
      this.boxY + (2 * (this.boxHeight - this.bottomMessage.height)) / 3
    );

    this.topMessage.setDepth(2);
    this.bottomMessage.setDepth(2);
  }
}

export default BoardScene;
