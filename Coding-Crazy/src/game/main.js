import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MainGameScene from "./scenes/MainGameScene";
import QuestionScene from "./scenes/QuestionScene";
import BoardScene from "./scenes/BoardScene";
import ChoiceScene from "./scenes/ChoiceScene";

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 1024,
    backgroundColor: "#FFFFFF", // Background color of the game while loading
    parent: "game-container",
    pixelArt: true,
    scene: [BootScene, MainGameScene, QuestionScene, BoardScene, ChoiceScene],
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    }
};

// Function to start the game
const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
