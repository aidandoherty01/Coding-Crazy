import Phaser from "phaser";

class StartQuestionButton extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);

    // Store a reference to the scene
    this.scene = scene;

    // Small square button dimensions
    const buttonSize = 30;
    const margin = 20; // Space from the edges

    // Position at the top-right of the screen
    const buttonX = scene.scale.width - buttonSize - margin;
    const buttonY = margin + buttonSize / 2; // Keep it aligned

    // Create a small square button background
    this.buttonBg = scene.add.rectangle(buttonX, buttonY, buttonSize, buttonSize, 0x1e1e1e)
      .setStrokeStyle(3, 0xffffff) // White border
      .setInteractive()
      .on("pointerdown", () => {
        if (scene.scene.isActive("QuestionScene")) {
          return;
        } else {
          scene.scene.launch("QuestionScene");
        }
      })
      .on("pointerover", () => {
        this.buttonBg.setFillStyle(0x333333); // Darker hover effect
      })
      .on("pointerout", () => {
        this.buttonBg.setFillStyle(0x1e1e1e); // Default color
      });

    // Add a "❓" icon
    this.buttonText = scene.add.text(buttonX, buttonY, "❓", {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "Arial",
    }).setOrigin(0.5, 0.5); // Center the text inside the button

    // Add both elements to the container
    this.add(this.buttonBg);
    this.add(this.buttonText);

    // Add this container to the scene
    scene.add.existing(this);
  }
}

export default StartQuestionButton;
