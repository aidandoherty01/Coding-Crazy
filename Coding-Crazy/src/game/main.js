import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MainGameScene from "./scenes/MainGameScene";
import QuestionScene from "./scenes/QuestionScene";
import BoardScene from "./scenes/BoardScene";
import ChoiceScene from "./scenes/ChoiceScene";
import SpinnerScene from "./scenes/SpinnerScene";
import MessageScene from "./scenes/MessageScene";
import MinigameScene from "./scenes/MinigameScene";

// Game Configuration
const baseConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 1024,
  backgroundColor: "#FFFFFF", // Background color of the game while loading
  pixelArt: true,
  scene: [
    BootScene,
    MainGameScene,
    QuestionScene,
    BoardScene,
    ChoiceScene,
    SpinnerScene,
    MessageScene,
    MinigameScene,
  ],
  scale: {
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
};

// Function to start the game

const StartGame = (parentElement, SO) => {
  const game = new Phaser.Game({ ...baseConfig, parent: parentElement });
  game.config.stateObject = SO;

  return game;
};

export default StartGame;
