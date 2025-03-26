import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MainGameScene from "./scenes/MainGameScene";
import QuestionScene from "./scenes/QuestionScene";
import BoardScene from "./scenes/BoardScene";
import ChoiceScene from "./scenes/ChoiceScene";
import SpinnerScene from "./scenes/SpinnerScene";

// Game Configuration
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 1024,
  backgroundColor: "#FFFFFF", // Background color of the game while loading
  parent: "game-container",
  pixelArt: true,
  scene: [
    BootScene,
    MainGameScene,
    QuestionScene,
    BoardScene,
    ChoiceScene,
    SpinnerScene,
  ],
  scale: {
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
};

// TEMP TESTING VARIABLE
const testSubject = "Math";

// Function to start the game
const StartGame = (parent, SO, subject = testSubject) => {
  fetch(`http://localhost:5000/collection/${subject}`) // Before starting the game, load the most current study set to questions.json
    .catch((error) =>
      console.error("Error Loading Study Set for Game: ", error)
    );
  console.log("Sanity Log: Starting Game!");
  const game = new Phaser.Game({ ...config, parent });
  game.config.socket = SO.socket;
  game.config.username = SO.username;
  game.config.players = SO.players;
  game.config.roomCode = SO.roomCode;

  return game;
};

export default StartGame;
