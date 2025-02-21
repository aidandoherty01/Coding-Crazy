import Phaser from "phaser";
import StartQuestionButton from "../../components/StartQuestionButton";
import { EventBus } from "../../game/EventBus";
import BoardScene from "./BoardScene";
import SpinnerScene from "./SpinnerScene";

class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
  }

  preload() {
    this.load.pack("asset_pack", "../assets/assets.json");
  }

  create() {
    console.log("🎮 MainGameScene is now active!");
    let arrows = [];
    //this.add.image(0, 0, "board").setOrigin(0).setScale(0.5);

    this.scene.launch("BoardScene");
    //this.scene.add("SpinnerScene", SpinnerScene, true);
    console.log("test");
    new StartQuestionButton(this);
    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("QuestionScene");
  }
}


export default MainGameScene;