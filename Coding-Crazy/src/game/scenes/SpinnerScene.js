import Phaser from "phaser";
import { EventBus } from "../EventBus";

class SpinnerScene extends Phaser.Scene {

    constructor() {
        super({ key: "SpinnerScene" });
    }


    init(data) {
        this.correctAnswers = data?.correctAnswers || 0;
    }


    create() {
        console.log("🎡 Spinner Scene is now active.");

        // Listen for the `quizCompleted` event and update `correctAnswers`
        EventBus.on("quizCompleted", this.updateCorrectAnswers, this);

        // Determine the number of slices based on correct answers
        const numberOfSlices = this.getSliceCount();
        console.log(`🔢 Number of slices on the spinner: ${numberOfSlices}`);

        this.createWheelGraphics(numberOfSlices);
        EventBus.emit("current-scene-ready", this);
    }


    getSliceCount() {
        // More correct answers = More slices (better movement potential)
        switch (this.correctAnswers) {
            case 4: return 10;  // Best case (10 slices)
            case 3: return 8;
            case 2: return 6;
            case 1: return 4;
            default: return 2;  // Worst case (2 slices, meaning limited movement)
        }
    }


    updateCorrectAnswers(correctAnswers) {
        console.log(`📊 Quiz Completed - Correct Answers: ${correctAnswers}`);
        this.correctAnswers = correctAnswers;
    }


    createWheelGraphics(numberOfSlices) {
        const degrees = 360 / numberOfSlices;
        const wheel = this.add.graphics();
        let choices = this.getMovementValue(numberOfSlices);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const wheelRadius = 150;

        wheel.lineStyle(2, 0x000000); // Outline for wheel and slices

        for (let i = 0; i < numberOfSlices; i++) {
            let startSliceAngle = Phaser.Math.DegToRad(270 + i * degrees);
            let endSliceAngle = Phaser.Math.DegToRad(270 + (i + 1) * degrees);
            let averageAngle = (startSliceAngle + endSliceAngle) / 2;
            let sliceCenterX = centerX + Math.cos(averageAngle) * (wheelRadius - 30);
            let sliceCenterY = centerY + Math.sin(averageAngle) * (wheelRadius - 30);

            let movementValue = choices[i];

            this.add.text(sliceCenterX, sliceCenterY, movementValue, {
                font: '23px Arial',
                fill: '#000000'
            }).setOrigin(0.5);

            wheel.fillStyle(0xffffff, 1);
            wheel.slice(centerX, centerY, wheelRadius, startSliceAngle, endSliceAngle, false);
            wheel.fillPath();
            wheel.strokePath();
        }

        // Add the spinning pinwheel on top
        this.pinWheel = this.add.sprite(centerX, centerY, "pin_wheel");
        this.spinPin(degrees, choices);
    }


    getMovementValue(numberOfSlices) {
        // Generate an array of numbers from 1 to numberOfSlices
        let values = Array.from({ length: numberOfSlices }, (_, i) => i + 1);

        // Shuffle the array to distribute numbers randomly
        Phaser.Math.RND.shuffle(values);

        return values;
    }



    spinPin(setDegrees, choices) {
        let isSpinning = false;

        this.input.on('pointerdown', function () {
            if (!isSpinning) {
                let numberOfSpins = Phaser.Math.Between(5, 15);
                let randomDegree = Phaser.Math.Between(0, 360);
                let endResult = Math.floor(randomDegree / setDegrees);
                isSpinning = true;

                this.tweens.add({
                    targets: this.pinWheel,
                    angle: (360 * numberOfSpins) + randomDegree,
                    duration: 1500,
                    ease: "Cubic.easeOut",
                    callbackScope: this,
                    onComplete: function () {
                        this.tweens.angle = 0;
                        this.time.delayedCall(2000, () => this.scene.stop());
                        this.time.delayedCall(2000, () =>
                            this.events.emit('spinResult', choices[endResult]));
                        console.log("🎯 Spin Result: " + choices[endResult]);
                        this.scene.resume("BoardScene");
                    }
                });
            }
        }, this);
    }


    shutdown() {
        EventBus.off("quizCompleted", this.updateCorrectAnswers, this);
    }
}

export default SpinnerScene;
