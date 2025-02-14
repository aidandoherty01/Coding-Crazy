import Phaser from "phaser";
import StartQuestionButton from "../components/StartQuestionButton";
import { EventBus } from "../game/EventBus";

class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
  }

  preload() {
    this.load.pack("asset_pack", "../assets/assets.json");
  }

  create() {
    console.log("🎮 MainGameScene is now active!");
    
    this.add.image(0, 0, "forest").setOrigin(0);

    // Add character images with scale adjustments
    const characters = [
      { x: 30, y: 450, key: "ignivolt" },
      { x: 540, y: 450, key: "carnodusk" },
      { x: 420, y: 450, key: "iguanignite" },
      { x: 290, y: 450, key: "aquavalor" },
      { x: 160, y: 450, key: "frostsaber" },
      { x: 680, y: 450, key: "parazoid" },
      { x: 810, y: 450, key: "jivy" },
    ];

    characters.forEach(({ x, y, key }) => {
      this.add.image(x, y, key).setOrigin(0).setScale(0.5);
    });

    // Add player animation frames
    const playerFrames = [
      { x: 0, y: 0, frame: 0 },
      { x: 0, y: 100, frame: 1 },
      { x: 0, y: 200, frame: 2 },
      { x: 0, y: 300, frame: 3 },
      { x: 100, y: 0, frame: 4 },
      { x: 200, y: 0, frame: 5 },
      { x: 300, y: 0, frame: 6 },
    ];

    playerFrames.forEach(({ x, y, frame }) => {
      this.add.image(x, y, "player", frame).setOrigin(0);
    });

    new StartQuestionButton(this);

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("QuestionScene");
  }
}

export default MainGameScene;