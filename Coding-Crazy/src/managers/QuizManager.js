class QuizManager {
  constructor(questions) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.masteredQuestions = [];
    this.incorrectQuestions = [];
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  submitAnswer(selectedOption) {
    const correctAnswer = this.getCurrentQuestion().answer;
    const isCorrect = selectedOption === correctAnswer;

    if (isCorrect) {
      this.correctAnswers++;
      this.masteredQuestions.push(this.getCurrentQuestion());
    } else {
      this.incorrectQuestions.push(this.getCurrentQuestion());
    }

    this.currentQuestionIndex++;
    return isCorrect;
  }

  hasMoreQuestions() {
    return this.currentQuestionIndex < this.questions.length;
  }
}

export default QuizManager;