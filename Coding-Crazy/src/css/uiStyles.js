const UIStyles = {
  // 🌟 Background Styles
  background: {
    color: 0x000000, // Black background color
    opacity: 0.5,
    borderColor: 0xffffff, // White border color
    borderThickness: 2,
    borderRadius: 10,
    borderOpacity: 1,
  },

  // 🌟 Question Text Style
  questionText: {
    fontSize: "24px",
    fill: "#fff", // White text color
    fontStyle: "bold",
    fontFamily: "Arial",
    wordWrap: { width: 600 }, // Adjust width based on container
    shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true },
  },

  // 🌟 Timer Text Style
  timerText: {
    fontSize: "20px",
    fill: "#fff", // White text color
    fontWeight: "bold",
    fontStyle: "italic",
  },

  // 🌟 Button Styles
  quizButton: {
    widthRatio: 0.4, // 40% of the parent container width
    heightRatio: 0.08, // 8% of the screen height
    backgroundColor: 0x000000, // Default button color
    opacity: 0.8,
    hoverColor: 0x228b22, // Hover color (Green)
    incorrectColor: 0xff0000, // Incorrect answer color (Red)
    correctColor: 0x228b22, // Correct answer color (Green)
    textColor: "#ffffff", // White text color
    fontSize: "20px",
    fontFamily: "Arial",
    fontStyle: "bold",
    padding: { x: 10, y: 5 },
    borderRadius: 25,
  },

  // 🌟 Answer Tooltip Styles
  answerTooltip: {
    correctBackgroundColor: 0x228b22, // Green for correct answer
    incorrectBackgroundColor: 0xff0000, // Red for incorrect answer
    borderRadius: 15,
    borderThickness: 3,
    borderColor: 0xffffff, // White border color
    opacity: 1,
  },

  // 🌟 Answer Tooltip Text Style
  answerTooltipText: {
    fontSize: "20px",
    fill: "#fff", // White text color
    fontStyle: "bold",
    fontFamily: "Arial",
  },

  //Special addition for message bar
  // 🌟 Question Text Style
  btmMsgText: {
    fontSize: "18px",
    fill: "#fff", // White text color
    fontStyle: "bold",
    fontFamily: "Arial",
    wordWrap: { width: 600 }, // Adjust width based on container
    shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true },
  },
};

export default UIStyles;
