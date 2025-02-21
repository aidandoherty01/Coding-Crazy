const UIStyles = {
    // 🌟 Background Styles
    background: {
        color: 0x000000,
        opacity: 0.5,
        borderColor: 0xffffff,
        borderThickness: 2,
        borderRadius: 10
    },

    // 🌟 Question Text Style
    questionText: {
        fontSize: "24px",
        fill: "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        wordWrap: { width: 600 }, // Adjust width based on container
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true }
    },

    // 🌟 Timer Text Style
    timerText: {
        fontSize: "20px",
        fill: "#fff",
        fontWeight: "bold",
        fontStyle: "italic"
    },

    // 🌟 Button Styles
    button: {
        widthRatio: 0.4, // 40% of the parent container width
        heightRatio: 0.08, // 8% of the screen height
        backgroundColor: 0x000000, // Default button color
        hoverColor: 0x228B22, // Hover color (Green)
        activeColor: 0xff0000, // Incorrect answer color
        correctColor: 0x00ff00, // Correct answer color
        textColor: "#ffffff",
        fontSize: "20px",
        fontFamily: "Arial",
        padding: { x: 10, y: 5 },
        borderRadius: 15
    },

    // 🌟 Option Button Styles
    optionButton: {
        fontStyle: "bold",
        fontFamily: "Arial",
        fill: "#fff",
        backgroundColor: "#000000",
        borderRadius: 25,
        shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 3, fill: true },
        hoverBackgroundColor: "#228B22",
        correctBackgroundColor: "#00FF00",
        incorrectBackgroundColor: "#FF0000",
    },

    // 🌟 Answer Tooltip Styles
    answerTooltip: {
        correctBackgroundColor: 0x00FF00, // Green for correct answer
        incorrectBackgroundColor: 0xFF0000, // Red for incorrect answer
        borderRadius: 15,
        borderThickness: 3,
        borderColor: 0xffffff,
        opacity: 1,
    },

    // 🌟 Answer Tooltip Text Style
    answerTooltipText: {
        fontSize: "20px",
        fill: "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
    }
};

export default UIStyles;
