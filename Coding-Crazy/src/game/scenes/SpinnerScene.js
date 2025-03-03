import Phaser from "phaser";;
import { EventBus } from "../EventBus";

class SpinnerScene extends Phaser.Scene {

    constructor() {
        super({ key: "SpinnerScene" });
        }
    
    preload() {
        this.load.pack("asset_pack", "../assets/assets.json");
    }

    create() {
        console.log("Spinner Scene is now active.");
        this.createWheel(Phaser.Math.Between(1, 10));
        EventBus.emit("current-scene-ready", this);
    }

    createWheel(numberOfSlices)
    {
        var degrees = 360 / numberOfSlices;
        var wheel = this.add.graphics();
        let choices = [];
        wheel.lineStyle(2, 0x000000);       //outline for wheel and slices

        for(var i = 0; i < numberOfSlices; i++)
        {
            let startSliceAngle = Phaser.Math.DegToRad(270 + i * degrees);
            let endSliceAngle = Phaser.Math.DegToRad(270 + (i + 1) * degrees);
            let averageAngle = (startSliceAngle + endSliceAngle) / 2;
            let testSliceCenterX = 350 + Math.cos(averageAngle) * 100;
            let testSliceCenterY = 225 + Math.sin(averageAngle) * 100;
            let randomTest = Phaser.Math.Between(1, 6);
            console.log("RANDOM TEST VALUE: " + randomTest);
            choices.push(randomTest);
            
            this.add.text(testSliceCenterX, testSliceCenterY, randomTest, 
                {
                    font: '23px Arial', 
                    fill: '#000000'
                }
            );
            
            wheel.fillStyle(0xffffff, 1);
            wheel.slice(350, 225, 150, startSliceAngle, endSliceAngle, false);
            wheel.fillPath();
            wheel.strokePath();
        }

        // Adding pinwheel on top of drawn wheel
        this.pinWheel = this.add.sprite(350, 225, "pin_wheel");
        this.spinPin(degrees, choices);
    }

    spinPin(setDegrees, choices)
    {
        //var numberOfSlices = 360 / setDegrees;
        let isSpinning = false;
        //const spinResults = [1, 2, 3, 4, 5, 6];
  
        this.input.on('pointerdown', function (pointer)
        {
          if(!isSpinning)
          {
              var numberOfSpins = Phaser.Math.Between(1, 10);
              var randomDegree = Phaser.Math.Between(0, 360);
              var endResult = Math.floor((randomDegree  / setDegrees));
              isSpinning = true;
  
              this.tweens.add(
                  {
                      targets: this.pinWheel,
                      angle: (360 * numberOfSpins) + randomDegree,
                      duration: 1000,
                      ease: "Sine.easeInOut",
                      callbackScope: this,
                      onComplete: function(tween) {
                          this.tweens.angle = 0;
                          this.time.delayedCall(2000, () => this.scene.stop());
                          this.time.delayedCall(2000, () => 
                            this.events.emit('spinResult', choices[endResult]));
                          console.log("END CHOICE: " + choices[endResult]);
                          this.scene.resume("BoardScene");
                      }
                  }
              );

          }
        }, this);
    }
}

export default SpinnerScene;