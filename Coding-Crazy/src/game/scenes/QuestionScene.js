import Phaser from "phaser";
import questions from "../../data/questions.json";
import QuizManager from "../../managers/QuizManager";
import { EventBus } from "../EventBus";

class QuestionScene extends Phaser.Scene {
  // Initialize the scene FIRST TIME ONLY
  constructor() {
    super({ key: "QuestionScene" });
    this.quizManager = null;
    this.selectedOption = null;
    this.timeLeft = 0;
    this.timerText = null;
  }

  // Initialize the scene ON EVERY RESTART
  init() {
    this.quizManager = new QuizManager(questions);
    this.selectedOption = null;
    this.timeLeft = 0;
    this.timerText = null;
    this.answerSubmitted = false;
  }

  // Load the question scene
  create() {
    console.log("❓ QuestionScene is now active!");

    // Get the screen dimensions
    const { width, height } = this.scale;

    // Get the previous quiz results from the game's registry
    this.previousCorrect = this.registry.get("correctAnswers") || 0;
    this.previousIncorrect = this.registry.get("incorrectAnswers") || 0;
    this.masteredQuestions = this.registry.get("masteredQuestions") || [];
    this.incorrectQuestions = this.registry.get("incorrectQuestions") || [];

    // Create the UI elements
    this.createUI(width, height);
    this.loadQuestion();

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  // Change the scene to the main game scene
  changeScene() {
    this.scene.start("MainGameScene");
  }

  // Select an option for multiple-choice questions
  selectOption(selectedBtn) {
      if (this.answerSubmitted) return; // Prevent changing answers after submission

      this.selectedOption = selectedBtn.getData("option");

      // Disable all buttons to prevent further selection
      this.optionButtons.forEach((btn) => btn.disableInteractive());

      // Submit the answer after selecting
      this.submitAnswer();
  }

  // Create the UI elements for the question scene
  createUI(width, height) {
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.6;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    // Background with a subtle gradient effect
    const background = this.add.graphics();
    background.fillStyle('', 0.75); 
    background.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 20); // Rounded edges
    background.lineStyle(6, 0xdee3de, 1);
    background.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 20);
    background.setDepth(-1); // Push it behind text

    // Question Text
    this.questionText = this.add.text(boxX + 50, boxY + 50, "", {
        fontSize: `${Math.floor(height * 0.04)}px`,
        fill: "#fff", // text color
        fontStyle: "bold",
        fontFamily: "Arial",
        wordWrap: { width: boxWidth - 100 },
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true },
    });

    // Timer Text
    this.timerText = this.add.text(boxX + boxWidth - 120, boxY + 20, "", {
        fontSize: `${Math.floor(height * 0.035)}px`,
        fill: "#ffcc00", // text color
        fontWeight: "bold",
        fontStyle: "italic",
    });

    // Option Buttons (2x2 Grid)
    this.optionButtons = [];
    const buttonWidth = boxWidth * 0.4;  // 40% of the box width
    const buttonHeight = height * 0.08;  // Fixed height for buttons
    const startX = boxX + 50;            // Left padding
    const startY = boxY + 150;           // Start Y position
    const colSpacing = buttonWidth + (boxWidth * 0.05); // Space between columns
    const rowSpacing = buttonHeight + 20; // Space between rows

    for (let i = 0; i < 4; i++) {
        let col = i % 2; // Column index (0 or 1)
        let row = Math.floor(i / 2); // Row index (0 or 1)

        let btn = this.add.text(startX + col * colSpacing, startY + row * rowSpacing, "", {
            fontSize: `${Math.floor(height * 0.035)}px`,
            fill: "#fff",
            padding: { x: 20, y: 10 },
            fontStyle: "bold",
            fontFamily: "Arial",
            align: "center",
            backgroundColor: "#444444",
            shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true },
        })
        .setInteractive()
        .setFixedSize(buttonWidth, buttonHeight) // Ensure consistent button size

        .on("pointerover", () => {
            if (!this.answerSubmitted && btn.getData("option") !== this.selectedOption) {
                btn.setStyle({ backgroundColor: "#228B22" }); // Lighter green on hover
            }
        })        
        .on("pointerout", () => {
            if (!this.answerSubmitted && btn.getData("option") !== this.selectedOption) {
                btn.setStyle({ backgroundColor: "#444444" }); // Reset on hover out
            }
        })
        .on("pointerdown", () => {
            if (!this.answerSubmitted) {
              this.selectOption(btn);
            }
        });

        // Add the button to the list
        this.optionButtons.push(btn);
    }
  }

  // Update the timer text
  updateTimerText() {
    this.timerText.setText(`Time: ${this.timeLeft}s`);
  }

  // Submit the selected answer
  submitAnswer() {
      if (this.answerSubmitted) return; // Prevent multiple submissions
      this.answerSubmitted = true; // Mark as submitted

      if (this.questionTimer) this.questionTimer.remove();

      // Disable all option buttons
      this.optionButtons.forEach(btn => btn.disableInteractive());

      const currentQuestion = this.quizManager.getCurrentQuestion();
      const isCorrect = this.quizManager.submitAnswer(this.selectedOption);

      this.incorrectQuestions = this.incorrectQuestions.filter(q => q.question !== currentQuestion.question);

      if (isCorrect) {
          this.masteredQuestions.push(currentQuestion);
      } else {
          this.incorrectQuestions.push(currentQuestion);
      }

      this.showCorrectAnswer(isCorrect, currentQuestion.answer);

      if (this.quizManager.hasMoreQuestions()) {
          this.time.delayedCall(2000, () => {
              this.answerSubmitted = false; // Reset for next question
              this.loadQuestion();
          });
      } else {
          this.time.delayedCall(2000, () => this.endQuiz());
      }
  }


  // Show the correct answer and feedback
  showCorrectAnswer(isCorrect, correctAnswer) {
      if (this.answerTooltip) {
          this.answerTooltip.destroy();
          this.answerTooltipText.destroy();
      }

      // Create Answer Text
      const answerText = isCorrect ? "✅ Correct!" : `❌ Incorrect, Answer: ${correctAnswer}`;
      this.answerTooltipText = this.add.text(
          0, // Temporarily set X to 0, will adjust after
          0, // Temporarily set Y to 0, will adjust after
          answerText, 
          {
              fontSize: "20px",
              fill: "#fff",
              fontStyle: "bold",
              fontFamily: "Arial",
          }
      );

      // Calculate the text width dynamically
      const textBounds = this.answerTooltipText.getBounds();
      const textWidth = textBounds.width;
      const textHeight = textBounds.height;

      // Set dynamic tooltip width (with padding)
      const tooltipPadding = 20;
      let tooltipWidth = textWidth + tooltipPadding * 2;

      // Set a minimum and maximum width for tooltip
      const minTooltipWidth = 150; // Minimum width for short text
      const maxTooltipWidth = 300; // Maximum width to prevent too wide tooltip
      tooltipWidth = Phaser.Math.Clamp(tooltipWidth, minTooltipWidth, maxTooltipWidth);

      // Set tooltip height dynamically based on text height
      const tooltipHeight = textHeight + tooltipPadding * 2;

      // Tooltip Positioning (centered above the question box)
      const tooltipX = this.scale.width / 2 - tooltipWidth / 2;
      const tooltipY = this.questionText.y - 100; 

      // Create Tooltip Background
      this.answerTooltip = this.add.graphics();
      this.answerTooltip.fillStyle(0x8B4513, 1); // Brown color with no transparency
      this.answerTooltip.fillRoundedRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 15);
      this.answerTooltip.lineStyle(4, 0x3e2714, 1); // Darker brown border
      this.answerTooltip.strokeRoundedRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 15);

      // Adjust text position to center inside tooltip
      this.answerTooltipText.setX(tooltipX + (tooltipWidth - textWidth) / 2);
      this.answerTooltipText.setY(tooltipY + (tooltipHeight - textHeight) / 2);

      // Bring the tooltip to the front
      this.answerTooltip.setDepth(100);
      this.answerTooltipText.setDepth(101);

      // 🔹 Highlight selected option as red (if incorrect) or green (if correct)
      this.optionButtons.forEach((btn) => {
          const option = btn.getData("option");

          if (option === correctAnswer) {
              btn.setStyle({ backgroundColor: "#00FF00" }); // Green for correct answer
          } else if (option === this.selectedOption) {
              btn.setStyle({ backgroundColor: "#FF0000" }); // Red for wrong answer
          }
      });
  }



  // Load the next question or end the quiz
  loadQuestion() {
    if (!this.quizManager.hasMoreQuestions()) {
      this.endQuiz();
      return;
    }

    // Remove tooltip when loading a new question
    if (this.answerTooltip) {
        this.answerTooltip.destroy();
        this.answerTooltip = null;
    }
    if (this.answerTooltipText) {
        this.answerTooltipText.destroy();
        this.answerTooltipText = null;
    }

    const currentQuestion = this.quizManager.getCurrentQuestion();
    this.questionText.setText(currentQuestion.question);

    this.optionButtons.forEach((btn, index) => {
      btn.setText(currentQuestion.options[index]);
      btn.setData("option", currentQuestion.options[index]);
      btn.setStyle({ backgroundColor: "#444" });
      btn.setInteractive();
    });

    // Initialize values for the next question
    this.selectedOption = null;
    this.answerSubmitted = false;
    this.setTimer(currentQuestion.type);
  }

  // Set the timer based on the question type
  setTimer(questionType) {
    switch (questionType) {
      case "multipleChoice":
        this.timeLeft = 10;
        break;
      case "fillInBlank":
        this.timeLeft = 20;
        break;
      case "trueFalse":
        this.timeLeft = 5;
        break;
      case "matching":
        this.timeLeft = 15;
        break;
      case "ordering":
        this.timeLeft = 20;
        break;
      default:
        this.timeLeft = 10;
    }
    
    this.updateTimerText();

    this.questionTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.updateTimerText();
        if (this.timeLeft <= 0) {
          this.submitAnswer(true);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  // End the quiz and return to the main game scene
  endQuiz() {
    if (this.feedbackText) {
      this.feedbackText.destroy();
      this.feedbackText = null;
    }

    // ✅ Confirm registry values before updating
    console.log("🔄 Previous Registry Values:");
    console.log("🔹 Correct Answers:", this.registry.get("correctAnswers"));
    console.log("🔹 Incorrect Answers:", this.registry.get("incorrectAnswers"));
    console.log("🔹 Mastered Questions:", this.registry.get("masteredQuestions"));
    console.log("🔹 Incorrect Questions:", this.registry.get("incorrectQuestions"));


    const totalCorrect = (this.registry.get("correctAnswers") || 0) + this.quizManager.correctAnswers;
    const totalIncorrect = (this.registry.get("incorrectAnswers") || 0) + this.quizManager.questions.length - this.quizManager.correctAnswers;

    // Store the quiz results in the game's registry
    this.registry.set("correctAnswers", totalCorrect);
    this.registry.set("incorrectAnswers", totalIncorrect); 

    // Store the questions that were mastered and need review
    this.registry.set("masteredQuestions", this.quizManager.masteredQuestions); 
    this.registry.set("incorrectQuestions", this.quizManager.incorrectQuestions); 

    // ✅ Confirm new registry values
    console.log("🆕 Updated Registry Values:");
    console.log("✅ Correct Answers:", totalCorrect);
    console.log("❌ Incorrect Answers:", totalIncorrect);
    console.log("⭐ Mastered Questions:", this.masteredQuestions.map(q => q.question));
    console.log("⚠️ Incorrect Questions:", this.incorrectQuestions.map(q => q.question));

    console.log("🎮 Stopping QuestionScene and resuming MainGameScene...");
    this.scene.stop();
    this.scene.resume("MainGameScene");
  }
}

export default QuestionScene;
