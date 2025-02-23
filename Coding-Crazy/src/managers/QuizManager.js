class QuizManager {
  constructor(questions) {
    this.questions = this.shuffleArray(questions); // Shuffle the questions
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
  }

  
  // Fisher-Yates Shuffle Algorithm
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }


  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }


  submitAnswer(selectedOption) {
    const currentQuestion = this.getCurrentQuestion();
    const correctAnswer = currentQuestion.answer;
    const isCorrect = selectedOption === correctAnswer;

    if (isCorrect) {
      this.correctAnswers++;

      // Add to masteredQuestions only if it's not already in there
      if (!this.masteredQuestions.some(q => q.question === currentQuestion.question)) {
        this.masteredQuestions.push(currentQuestion);
      }

      // Remove from incorrectQuestions if it was previously incorrect
      this.incorrectQuestions = this.incorrectQuestions.filter(q => q.question !== currentQuestion.question);
    } else {
      // Add to incorrectQuestions only if it's not already in there
      if (!this.incorrectQuestions.some(q => q.question === currentQuestion.question)) {
        this.incorrectQuestions.push(currentQuestion);
      }
    }

    this.currentQuestionIndex++;

    return { isCorrect, correctAnswer };
  }

  
  hasMoreQuestions() {
    return this.currentQuestionIndex < this.questions.length;
  }
}

export default QuizManager;