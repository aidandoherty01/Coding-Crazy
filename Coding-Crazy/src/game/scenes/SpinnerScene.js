import Phaser from "phaser";;
import { EventBus } from "../EventBus";

class SpinnerScene extends Phaser.Scene {

    constructor() {
        super({ key: 'SpinnerScene' });
        }
    
    preload() {
        this.load.pack("asset_pack", "../assets/assets.json");
    }

    create() {
        console.log("Spinner Scene is now active.");
        
        // Creating wheel with slices
        var numberOfSlices = 6;
        var degrees = 360 / numberOfSlices;
        var wheel = this.add.graphics();
        wheel.lineStyle(2, 0x000000);

        for(var i = 0; i < numberOfSlices; i++)
        {

            wheel.fillStyle(0xffffff, 1);
            wheel.slice(350, 225, 150, Phaser.Math.DegToRad(270 + i * degrees), Phaser.Math.DegToRad(270 + (i + 1) * degrees), false);
            wheel.fillPath();
            wheel.strokePath();
        }

        // Adding pinwheel on top of drawn wheel
        this.pinWheel = this.add.sprite(350, 225, "pin_wheel");
        this.spinPin();

        // Emit an event to notify the React component that the scene is ready
        EventBus.emit("current-scene-ready", this);

    }

    spinPin()
    {
        let isSpinning = false;
        const spinResults = ["1", "2", "3", "4", "5", "6"];
  
        this.input.on('pointerdown', function (pointer)
        {
          if(!isSpinning)
          {
              var numberOfSpins = Phaser.Math.Between(1, 10);
              var degrees = Phaser.Math.Between(0, 360);
              var endResult = Math.floor((degrees  / 60));
              isSpinning = true;
  
              this.tweens.add(
                  {
                      targets: this.pinWheel,
                      angle: (360 * numberOfSpins) + degrees,
                      duration: 1000,
                      ease: "Sine.easeInOut",
                      delay: this.tweens.stagger(100),
                      callbackScope: this,
                      onComplete: function(tween) {
                          console.log("Number landed on:" + spinResults[endResult]);
                          console.log("Number of spins: " + numberOfSpins);
                          console.log("Degrees: " + degrees);
                          isSpinning = false;
                          this.tweens.angle = 0;
                          th
                          
                      }
                  }
              );
          }
        }, this);
    }
}

export default SpinnerScene;