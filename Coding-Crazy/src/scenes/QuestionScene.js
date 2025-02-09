import Phaser from "phaser";
import questions from "../data/questions.json";

class QuestionScene extends Phaser.Scene {
  constructor() {
    super({ key: "QuestionScene" });
    this.currentQuestionIndex = 0;
    this.selectedOption = null;
  }

  create() {
    const { width, height } = this.scale; // Get game width and height

    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.selectedOption = null;

    // Create a box for the UI instead 
    const boxWidth = width * 0.7; // 70% of the screen width
    const boxHeight = height * 0.6; // 60% of the screen height
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    this.add.rectangle(
      width / 2,
      height / 2,
      boxWidth,
      boxHeight,
      0x8b4513,
      0.9
    ).setStrokeStyle(4, 0x5c3a1e); // Border outline

    // Display question (centered inside the box)
    this.questionText = this.add.text(
      boxX + 50, boxY + 50, this.questions[this.currentQuestionIndex].question, {
      fontSize: `${Math.floor(height * 0.04)}px`,
      fill: "#ffffff",
      wordWrap: { width: boxWidth - 100 },
    });

    // Display multiple-choice options
    this.optionButtons = [];
    const buttonSpacing = height * 0.08;

    this.questions[this.currentQuestionIndex].options.forEach((option, index) => {
      let btn = this.add
        .text(boxX + 60, boxY + 120 + index * buttonSpacing, option, {
          fontSize: `${Math.floor(height * 0.035)}px`,
          fill: "#ffffff",
          backgroundColor: "#444",
          padding: { x: 10, y: 5 },
        })
        .setInteractive()
        .setData("option", option)
        .on("pointerdown", () => this.selectOption(btn));

      this.optionButtons.push(btn);
    });

    // Submit button (positioned at bottom box)
    this.submitButton = this.add
      .text(width / 2 - 50, boxY + boxHeight - 50, "Submit", {
        fontSize: `${Math.floor(height * 0.04)}px`,
        fill: "#000",
        backgroundColor: "#fff",
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .on("pointerdown", () => this.submitAnswer());
  }

  selectOption(selectedBtn) {
    this.selectedOption = selectedBtn.getData("option");

    // Reset all buttons to default color
    this.optionButtons.forEach((btn) => btn.setStyle({ backgroundColor: "#444" }));

    // Highlight selected button
    selectedBtn.setStyle({ backgroundColor: "#228B22" });
  }

  submitAnswer() {
    if (this.selectedOption === null) return;

    const correctAnswer = this.questions[this.currentQuestionIndex].answer;
    if (this.selectedOption === correctAnswer) {
      console.log("Correct!");
    } else {
      console.log("Incorrect!");
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      this.updateQuestion();
    } else {
      this.scene.stop();
      this.scene.resume("MainGameScene"); // Resume main game after questions end
    }
  }

  updateQuestion() {
    this.questionText.setText(this.questions[this.currentQuestionIndex].question);

    this.optionButtons.forEach((btn, index) => {
      btn.setText(this.questions[this.currentQuestionIndex].options[index]);
      btn.setData("option", this.questions[this.currentQuestionIndex].options[index]); // Update stored option
      btn.setStyle({ backgroundColor: "#444" }); // Reset button colors
    });

    this.selectedOption = null;
  }
}

export default QuestionScene;
