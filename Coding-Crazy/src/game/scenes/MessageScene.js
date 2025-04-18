import Phaser from "phaser";
import { EventBus } from "../EventBus";
import UIStyles from "../../css/uiStyles";

class MessageScene extends Phaser.Scene {
  // Initialize the scene FIRST TIME ONLY
  constructor() {
    super({ key: "MessageScene" });
  }

  // Initialize the scene ON EVERY RESTART
  init(data) {
    this.message = data.message;
  }

  // Load the question scene
  create() {
    console.log("MessageScene is now active!");
    this.scene.bringToTop();
    // Get the screen dimensions
    const { width, height } = this.scale;

    // Create the UI elements
    this.createUI(width, height);

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  // Change the scene to the main game scene
  changeScene() {
    this.scene.start("MainGameScene");
  }

  // Create the UI elements for the question scene
  createUI(width, height) {
    const boxWidth = width * 0.5;
    const boxHeight = height * 0.3;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    // Background for question box
    const background = this.add.graphics();
    background.fillStyle(
      UIStyles.background.color,
      UIStyles.background.opacity
    );
    background.fillRoundedRect(
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      UIStyles.background.borderRadius
    );
    background.lineStyle(
      UIStyles.background.borderThickness,
      UIStyles.background.borderColor,
      UIStyles.background.borderOpacity
    );
    background.strokeRoundedRect(
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      UIStyles.background.borderRadius
    );
    background.setDepth(-1);

    // text
    this.messageText = this.add.text(
      boxX + boxWidth / 2,
      boxY + boxHeight / 2,
      this.message,
      {
        ...UIStyles.questionText,
        wordWrap: { width: boxWidth - 100 },
        align: "center",
      }
    );

    this.messageText.setPosition(
      boxX + (boxWidth - this.messageText.width) / 2,
      boxY + (boxHeight - this.messageText.height) / 2
    );
  }
}

export default MessageScene;
