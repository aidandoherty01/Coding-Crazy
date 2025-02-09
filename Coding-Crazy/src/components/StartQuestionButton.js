import Phaser from "phaser";

class StartQuestionButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    // Button dimensions
    const buttonWidth = 220;
    const buttonHeight = 60;

    // Create button background (rectangle)
    this.buttonBg = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x1e1e1e)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive()
      .on("pointerdown", () => {
        scene.scene.pause();
        scene.scene.launch("QuestionScene");
      })
      .on("pointerover", () => {
        this.buttonBg.setFillStyle(0x333333); // Darker hover effect
        this.buttonText.setStyle({ fill: "#f1c40f" }); // Gold text
      })
      .on("pointerout", () => {
        this.buttonBg.setFillStyle(0x1e1e1e); // Default color
        this.buttonText.setStyle({ fill: "#ffffff" }); // Default text
      });

    // Create button text
    this.buttonText = scene.add.text(0, 0, "Start Questions", {
      fontSize: "28px",
      fill: "#ffffff",
      fontFamily: "Arial",
    }).setOrigin(0.5, 0.5);

    // Add both elements to the container
    this.add(this.buttonBg);
    this.add(this.buttonText);

    // Add this container to the scene
    scene.add.existing(this);
  }
}

export default StartQuestionButton;
