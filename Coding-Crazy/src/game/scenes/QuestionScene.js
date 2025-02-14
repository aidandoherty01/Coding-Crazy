import Phaser from "phaser";
import questions from "../../data/exported_data.json";
import QuizManager from "../../managers/QuizManager";
import { EventBus } from "../EventBus";

class QuestionScene extends Phaser.Scene {
  constructor() {
    super({ key: "QuestionScene" });
    this.quizManager = null;
    this.selectedOption = null;
    this.timeLeft = 0;
    this.timerText = null;
  }

  init() {
    this.quizManager = new QuizManager(questions);
    this.selectedOption = null;
    this.timeLeft = 0;
    this.timerText = null;
  }

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

  changeScene() {
    this.scene.start("MainGameScene");
  }

  createUI(width, height) {
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.6;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    this.add.rectangle(width / 2, height / 2, boxWidth, boxHeight, 0x8b4513, 0.9)
      .setStrokeStyle(4, 0x5c3a1e);

    this.questionText = this.add.text(boxX + 50, boxY + 50, "", {
      fontSize: `${Math.floor(height * 0.04)}px`,
      fill: "#ffffff",
      wordWrap: { width: boxWidth - 100 },
    });

    this.timerText = this.add.text(boxX + boxWidth - 120, boxY + 20, "", {
      fontSize: `${Math.floor(height * 0.035)}px`,
      fill: "#ff0000",
    });

    this.optionButtons = [];
    const buttonSpacing = height * 0.08;

    for (let i = 0; i < 4; i++) {
      let btn = this.add.text(boxX + 60, boxY + 120 + i * buttonSpacing, "", {
        fontSize: `${Math.floor(height * 0.035)}px`,
        fill: "#ffffff",
        backgroundColor: "#444",
        padding: { x: 10, y: 5 },
      })
      .setInteractive()
      .on("pointerdown", () => this.selectOption(btn));

      this.optionButtons.push(btn);
    }

    this.submitButton = this.add.text(width / 2 - 50, boxY + boxHeight - 50, "Submit", {
      fontSize: `${Math.floor(height * 0.04)}px`,
      fill: "#000",
      backgroundColor: "#fff",
      padding: { x: 10, y: 5 },
    })
    .setInteractive()
    .on("pointerdown", () => this.submitAnswer());
  }

  updateTimerText() {
    this.timerText.setText(`Time: ${this.timeLeft}s`);
  }

  selectOption(selectedBtn) {
    this.selectedOption = selectedBtn.getData("option");
    this.optionButtons.forEach((btn) => btn.setStyle({ backgroundColor: "#444" }));
    selectedBtn.setStyle({ backgroundColor: "#228B22" });
  }

  submitAnswer(timeUp = false) {
    // Prevent submitting an answer if no option is selected
    if (this.selectedOption === null && !timeUp) return;
    this.optionButtons.forEach((btn) => btn.disableInteractive());
    this.submitButton.disableInteractive();
    if (this.questionTimer) this.questionTimer.remove();

    // Submit the answer and show feedback
    const currentQuestion = this.quizManager.getCurrentQuestion();
    const isCorrect = this.quizManager.submitAnswer(this.selectedOption);

    // Remove the current question from the incorrect questions list if it was previously answered incorrectly
    this.incorrectQuestions = this.incorrectQuestions.filter(q => q.question !== currentQuestion.question);

    // Add the current question to the appropriate list
    if (isCorrect) {
        this.masteredQuestions.push(currentQuestion);
    } else {
        this.incorrectQuestions.push(currentQuestion);
    }

    // Show the correct answer and feedback
    this.showCorrectAnswer(isCorrect, currentQuestion.answer);

    // Load the next question or end the quiz
    if (this.quizManager.hasMoreQuestions()) {
      this.time.delayedCall(2000, () => this.loadQuestion());
    } else {
      this.time.delayedCall(2000, () => this.endQuiz());
    }
  }

  showCorrectAnswer(isCorrect, correctAnswer) {
    if (this.feedbackText) {
      this.feedbackText.destroy();
    }

    this.optionButtons.forEach((btn) => {
      if (btn.getData("option") === correctAnswer) {
        btn.setStyle({ backgroundColor: "#00FF00" });
      } else if (btn.getData("option") === this.selectedOption) {
        btn.setStyle({ backgroundColor: "#FF0000" });
      }
    });

    const resultText = isCorrect ? "Correct!" : `Incorrect! Correct Answer: ${correctAnswer}`;
    this.feedbackText = this.add.text(
      this.scale.width / 2 - 50,
      this.scale.height / 2 + 100,
      resultText,
      { fontSize: "20px", fill: "#fff" }
    );
  }

  loadQuestion() {
    if (!this.quizManager.hasMoreQuestions()) {
      this.endQuiz();
      return;
    }

    if (this.feedbackText) {
      this.feedbackText.destroy();
      this.feedbackText = null;
    }

    const currentQuestion = this.quizManager.getCurrentQuestion();
    this.questionText.setText(currentQuestion.question);

    this.optionButtons.forEach((btn, index) => {
      btn.setText(currentQuestion.options[index]);
      btn.setData("option", currentQuestion.options[index]);
      btn.setStyle({ backgroundColor: "#444" });
      btn.setInteractive();
    });

    this.submitButton.setInteractive();
    this.selectedOption = null;
    this.setTimer(currentQuestion.type);
  }

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
