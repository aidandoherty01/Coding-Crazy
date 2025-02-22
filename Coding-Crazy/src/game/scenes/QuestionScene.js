import Phaser from "phaser";
import questions from "../../data/questions.json";
import QuizManager from "../../managers/QuizManager";
import { EventBus } from "../EventBus";
import UIStyles from "../../css/uiStyles";

class QuestionScene extends Phaser.Scene {
  // Initialize the scene FIRST TIME ONLY
  constructor() {
    super({ key: "QuestionScene" });
    this.quizManager = null;
  }

  // Initialize the scene ON EVERY RESTART
  init() {
      const storedQuestions = this.registry.get("questions");

      // Check if storedQuestions exist and are not empty
      const isStoredQuestionsValid = storedQuestions && Array.isArray(storedQuestions) && storedQuestions.length > 0;

      const questionsCopy = isStoredQuestionsValid 
          ? storedQuestions 
          : JSON.parse(JSON.stringify(questions)); // Deep copy to prevent mutation

      this.quizManager = new QuizManager(questionsCopy);

      // Reset mastered and incorrect questions if storedQuestions is empty
      if (!isStoredQuestionsValid) {
          console.log("🔄 Stored questions are empty. Resetting mastered and incorrect questions.");
          this.registry.set("masteredQuestions", []);
          this.registry.set("incorrectQuestions", []);
      }

      // Persist previously stored mastered and incorrect questions
      this.quizManager.masteredQuestions = this.registry.get("masteredQuestions") || [];
      this.quizManager.incorrectQuestions = this.registry.get("incorrectQuestions") || [];
  }


  // Load the question scene
  create() {
   console.log("❓ QuestionScene is now active!");

    // Get the screen dimensions
    const { width, height } = this.scale;

    // Get the previous quiz results from the game's registry
    this.previousCorrect = this.registry.get("correctAnswers") || 0;
    this.previousIncorrect = this.registry.get("incorrectAnswers") || 0;

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
    this.optionButtons.forEach(({ background }) => background.disableInteractive());

    // Submit the answer after selecting
    this.submitAnswer();
  }


  // Create the UI elements for the question scene
  createUI(width, height) {
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.6;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    // Background for question box
    const background = this.add.graphics();
    background.fillStyle(UIStyles.background.color, UIStyles.background.opacity);
    background.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, UIStyles.background.borderRadius);
    background.lineStyle(UIStyles.background.borderThickness, UIStyles.background.borderColor, UIStyles.background.borderOpacity);
    background.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, UIStyles.background.borderRadius);
    background.setDepth(-1);

    // Question Text
    this.questionText = this.add.text(boxX + 50, boxY + 50, "", {
        ...UIStyles.questionText,
        wordWrap: { width: boxWidth - 100 }
    });

    // Timer Text
    this.timerText = this.add.text(boxX + boxWidth - 120, boxY + 20, "", UIStyles.timerText);

    // Option Buttons (2x2 Grid)
    this.optionButtons = [];
    const buttonWidth = boxWidth * 0.3;
    const buttonHeight = height * 0.08;
    const colSpacing = buttonWidth + (boxWidth * 0.05);
    const rowSpacing = buttonHeight + 20;

    const totalButtonWidth = colSpacing * 2 - (boxWidth * 0.05);
    const totalButtonHeight = rowSpacing * 2 - 20;
    const startX = boxX + (boxWidth - totalButtonWidth) / 2;
    const startY = boxY + (boxHeight - totalButtonHeight + 50) / 2;

    for (let i = 0; i < 4; i++) {
      let col = i % 2;
      let row = Math.floor(i / 2);
      let x = startX + col * colSpacing;
      let y = startY + row * rowSpacing;

      // Create a rounded button
      const buttonBackground = this.add.graphics();

      // Set button color and size
      buttonBackground.fillStyle(UIStyles.quizButton.backgroundColor, UIStyles.quizButton.opacity); 
      buttonBackground.fillRoundedRect(x, y, buttonWidth, buttonHeight, UIStyles.quizButton.borderRadius);

      // ✅ Save position and dimensions in the graphics object for later use
      buttonBackground.setData({ x, y, width: buttonWidth, height: buttonHeight });

      // Make the button interactive
      buttonBackground.setInteractive(
          new Phaser.Geom.Rectangle(x, y, buttonWidth, buttonHeight),
          Phaser.Geom.Rectangle.Contains
      );

      // Create button text
      let btnText = this.add.text(x + buttonWidth / 2, y + buttonHeight / 2, "", {
        fontSize: UIStyles.quizButton.fontSize,
        fontFamily: UIStyles.quizButton.fontFamily,
        color: UIStyles.quizButton.textColor,
        fontStyle: UIStyles.quizButton.fontStyle,
        align: "center",
      }).setOrigin(0.5);

      // Handle Hover Effect
      buttonBackground.on("pointerover", () => {
          if (!this.answerSubmitted) {
            this.updateButtonColor(buttonBackground, UIStyles.quizButton.hoverColor);
          }
        });

      buttonBackground.on("pointerout", () => {
        if (!this.answerSubmitted) {
          this.updateButtonColor(buttonBackground, UIStyles.quizButton.backgroundColor);
        }
      });

      buttonBackground.on("pointerdown", () => {
        if (!this.answerSubmitted) {
          this.selectOption(btnText);
        }
      });

      // Store button and text for future reference
      this.optionButtons.push({ background: buttonBackground, text: btnText });
    }

    // Create a text object for "(click anywhere to proceed)"
    this.clickToProceedText = this.add.text(
        width / 2,
        boxY + boxHeight - 20,
        "(click anywhere to proceed)",
        {
            fontSize: "18px",
            fontFamily: "Arial",
            color: "#ffffff",
            align: "center"
        }
    ).setOrigin(0.5).setVisible(false);
  }


  // Update the button color
  updateButtonColor(button, color) {
    button.clear();
    button.fillStyle(color, UIStyles.quizButton.opacity);
    button.fillRoundedRect(button.getData("x"), button.getData("y"), button.getData("width"), button.getData("height"), UIStyles.quizButton.borderRadius);
  }


  // Update the timer text
  updateTimerText() {
    this.timerText.setText(`Time: ${this.timeLeft}s`);
  }

  // Submit the selected answer
  submitAnswer() {
    this.answerSubmitted = true; // Mark as submitted

    if (this.questionTimer) this.questionTimer.remove();

    // Disable all option buttons
    this.optionButtons.forEach(({ background }) => background.disableInteractive());

   // Get answer result from QuizManager
    const { isCorrect, correctAnswer } = this.quizManager.submitAnswer(this.selectedOption);

    this.showCorrectAnswer(isCorrect, correctAnswer);

    // Set a delay based on correctness before allowing progression
    let delay = isCorrect ? 1000 : 10000; // 1 sec if correct, 10 sec if incorrect

    // Function to proceed to next question
    const proceedToNext = () => {
        if (this.answerSubmitted) {
            this.answerSubmitted = false; // Reset for next question
            this.input.off("pointerdown", proceedToNext); // Remove listener after use
            this.clickToProceedText.setVisible(false); // Hide the prompt
            this.loadQuestion();
        }
    };

    if (!isCorrect) {
        // Show "(click anywhere to proceed)" text
        this.clickToProceedText.setVisible(true);

        // Wait to show answer before enabling the click listener
        this.time.delayedCall(100, () => {
            this.input.once("pointerdown", proceedToNext); // Allow early progression on click
        });
    }

    // Enforce auto-progression after delay
    this.time.delayedCall(delay, proceedToNext);
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
      UIStyles.answerTooltipText
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

    // Determine the background color based on correctness
    const tooltipBackgroundColor = isCorrect ? UIStyles.answerTooltip.correctBackgroundColor : UIStyles.answerTooltip.incorrectBackgroundColor;

    // Create Tooltip Background
    this.answerTooltip = this.add.graphics();
    this.answerTooltip.fillStyle(tooltipBackgroundColor, UIStyles.answerTooltip.opacity);
    this.answerTooltip.fillRoundedRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, UIStyles.answerTooltip.borderRadius);
    this.answerTooltip.lineStyle(UIStyles.answerTooltip.borderThickness, UIStyles.answerTooltip.borderColor, 1);
    this.answerTooltip.strokeRoundedRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, UIStyles.answerTooltip.borderRadius);

    // Adjust text position to center inside tooltip
    this.answerTooltipText.setX(tooltipX + (tooltipWidth - textWidth) / 2);
    this.answerTooltipText.setY(tooltipY + (tooltipHeight - textHeight) / 2);

    // Bring the tooltip to the front
    this.answerTooltip.setDepth(100);
    this.answerTooltipText.setDepth(101);

    // Highlight selected incorrect answer as red, correct as green
    this.optionButtons.forEach(({ background, text }) => {
        const option = text.getData("option");

        // Keep previously set color
        let newColor;
        if (option === correctAnswer) {
            newColor = UIStyles.quizButton.correctColor; // Green for correct answer
        } else if (option === this.selectedOption) {
            newColor = UIStyles.quizButton.incorrectColor; // Red for incorrect selected answer
        } else {
            newColor = UIStyles.quizButton.backgroundColor; // Default color (black)
        }

        // Redraw with correct color
        background.clear();
        background.fillStyle(newColor, UIStyles.quizButton.opacity);
        background.fillRoundedRect(
            background.getData("x"), 
            background.getData("y"), 
            background.getData("width"), 
            background.getData("height"), 
            25
        );
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

    this.optionButtons.forEach(({ background, text }, index) => {
      text.setText(currentQuestion.options[index]);
      text.setData("option", currentQuestion.options[index]);

      // Reset button colors
      background.clear();
      background.fillStyle(UIStyles.quizButton.backgroundColor, UIStyles.quizButton.opacity); // Default black
      background.fillRoundedRect(
        background.getData("x"), 
        background.getData("y"), 
        background.getData("width"), 
        background.getData("height"), 
        25
      );
      background.setInteractive();
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

    // Remove mastered questions from the main questions pool
    this.quizManager.questions = this.quizManager.questions.filter(q => 
      !this.quizManager.masteredQuestions.find(mq => mq.question === q.question)
    );

    // ✅ Confirm registry values before updating
    // console.log("🔄 Previous Registry Values:");
    // console.log("🔹 Correct Answers:", this.registry.get("correctAnswers"));
    // console.log("🔹 Incorrect Answers:", this.registry.get("incorrectAnswers"));
    // console.log("🔹 Mastered Questions:", this.registry.get("masteredQuestions"));
    // console.log("🔹 Incorrect Questions:", this.registry.get("incorrectQuestions"));

    // Update the active questions list
    this.registry.set("questions", this.quizManager.questions);

    // Update the total correct and incorrect answers
    const totalCorrect = (this.registry.get("correctAnswers") || 0) + this.quizManager.correctAnswers;
    const totalIncorrect = (this.registry.get("incorrectAnswers") || 0) + this.quizManager.questions.length - this.quizManager.correctAnswers;

    // Store the quiz results in the game's registry
    this.registry.set("correctAnswers", totalCorrect);
    this.registry.set("incorrectAnswers", totalIncorrect);

    // Store the questions that were mastered and need review
    this.registry.set("masteredQuestions", this.quizManager.masteredQuestions);
    this.registry.set("incorrectQuestions", this.quizManager.incorrectQuestions);

    //✅ Confirm new registry values
    console.log("🆕 Updated Registry Values:");
    console.log("✅ Correct Answers:", totalCorrect);
    console.log("❌ Incorrect Answers:", totalIncorrect);
    console.log("⭐ Mastered Questions:", this.quizManager.masteredQuestions.map(q => q.question));
    console.log("⚠️ Incorrect Questions:", this.quizManager.incorrectQuestions.map(q => q.question));

    console.log("🎮 Stopping QuestionScene and resuming MainGameScene...");
    this.scene.stop();
    this.scene.resume("MainGameScene");
  }
}

export default QuestionScene;
