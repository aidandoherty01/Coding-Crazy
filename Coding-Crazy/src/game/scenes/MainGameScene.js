import Phaser from "phaser";
import { EventBus } from "../../game/EventBus";

class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
  }

  preload() {
    this.load.pack("asset_pack", "../assets/assets.json");
  }

  create() {
    console.log("🎮 MainGameScene is now active!");

    this.scene.launch("BoardScene");
    
    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }
}


export default MainGameScene;