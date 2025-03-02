import Phaser from "phaser";

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    console.log("🚀 BootScene is now active!");
    console.log("🚀 Initializing Game Registry...");

    // Initialize registry values if they don't exist
    this.registry.set("correctAnswers", this.registry.get("correctAnswers") || 0);
    this.registry.set("incorrectAnswers", this.registry.get("incorrectAnswers") || 0);
    this.registry.set("masteredQuestions", this.registry.get("masteredQuestions") || []);
    this.registry.set("incorrectQuestions", this.registry.get("incorrectQuestions") || []);

    console.log("✅ Registry Initialized:", this.registry.getAll());

    // Start the main game scene
    this.scene.start("MainGameScene");
  }
}

export default BootScene;
