import Phaser from "phaser";
import QuizManager from "../../managers/QuizManager.js";
import questions from "../../data/questions.json";

class MinigameScene extends Phaser.Scene {
    constructor() {
        super({ key: "MinigameScene", physics: { arcade: true } });
        this.challengePlatforms = [];
        this.platforms = [];
        this.players = [];

        // Track challenge state
        this.challengeActive = false;
        this.challengeBase = null;
        this.challengeQuestionY = null;
    }

    preload() {
        this.load.pack("minigameAsset_pack", "../assets/minigameAssets.json");
        this.load.spritesheet("player", "../assets/player.png", { frameWidth: 32, frameHeight: 48 });
        this.load.animation("SpriteAnimation", "../assets/sprite_animation.json");
    }

    init(data) {
        this.quizManager = new QuizManager(questions, 1); // using one question per challenge, for instance
        this.currentQuestion = this.quizManager.getCurrentQuestion();
        this.returnScene = data.returnScene || "BoardScene";
    }

    create() {
        console.log("🎮 Minigame Started!");

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        this.add.image(400, 300, "blue_bg_layer1").setOrigin(0.5).setScale(1);

        this.platforms = this.physics.add.staticGroup();
        this.challengePlatforms = this.physics.add.staticGroup();

        this.floor = this.physics.add.staticImage(400, 800, "grass_platform")
            .setScale(4, 1)
            .refreshBody();
        
        const worldHeight = 100000;
        const wallY = this.floor.y - worldHeight;
        
        this.leftWall = this.physics.add.staticImage(0, wallY, null)
            .setOrigin(0, 0)
            .setDisplaySize(10, worldHeight)
            .refreshBody();

        this.rightWall = this.physics.add.staticImage(this.scale.width, wallY, null)
            .setOrigin(1, 0)
            .setDisplaySize(10, worldHeight)
            .refreshBody();

        this.highestYReached = this.floor.y;
        this.nextChallengeHeight = 1000;
        this.platformSpawningEnabled = true;
        this.platformSpawnLimitY = this.floor.y - 1000;
        this.resumePlatformSpawnY = null;
        this.lastPlatformY = this.floor.y;

        this.spawnOffset = 1000;

        this.distanceText = this.add.text(20, 20, "Height: 0", {
            fontSize: "20px",
            fill: "#ffffff",
            backgroundColor: "transparent",
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0);

        this.spawnPlatforms();
        this.initializeMainPlayer();

        // Overlap for regular platforms.
        this.physics.add.overlap(this.players[0], this.platforms, (player, platform) => {
            const isFalling = player.body.velocity.y > 0;
            const isAbove = player.y + player.height / 2 < platform.y;
            if (isFalling && isAbove) {
                this.physics.world.collide(player, platform);
            }
        });

        // Overlap for challenge platforms.
        this.physics.add.overlap(this.players[0], this.challengePlatforms, (player, platform) => {
            const isFalling = player.body.velocity.y > 0;
            const isAbove = player.y + player.height / 2 < platform.y;
            if (isFalling && isAbove) {
                this.physics.world.collide(player, platform);
            }
        });

        this.physics.add.overlap(this.players[0], this.challengePlatforms, this.checkAnswerPlatform, null, this);
    }

    initializeMainPlayer() {
        const spawnX = this.scale.width / 2;
        const spawnY = this.floor.y - 70; 

        const player1 = this.createPlayer(spawnX, spawnY);
        this.players.push(player1);
        this.setupPlayerControls(player1, "W", "A", "D");

        this.cameras.main.startFollow(this.players[0]);
        this.cameras.main.setDeadzone(this.scale.width, this.scale.height / 2);
    }

    createPlayer(x, y) {
        const player = this.physics.add.sprite(x, y, "player", 6).setScale(0.6);
        player.setGravityY(1000).setData({
            canJump: true,
            onWall: false,
            alive: true
        });
        
        player.play("walk_south");
        
        this.physics.add.collider(player, this.floor);
        this.physics.add.collider(player, this.leftWall);
        this.physics.add.collider(player, this.rightWall);
        
        return player;
    }
    
    setupPlayerControls(player, upKey, leftKey, rightKey) {
        const keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes[upKey],
            left: Phaser.Input.Keyboard.KeyCodes[leftKey],
            right: Phaser.Input.Keyboard.KeyCodes[rightKey]
        });

        this.input.keyboard.on("keydown", (event) => {
            if (!player.getData("alive")) return;
            const key = event.key.toUpperCase();

            if (key === upKey) this.handleJump(player);
            if (key === leftKey) {
                player.setVelocityX(-500);
                if (player.body.blocked.down) player.play("walk_west");
            }
            if (key === rightKey) {
                player.setVelocityX(500);
                if (player.body.blocked.down) player.play("walk_east");
            }
        });

        this.input.keyboard.on("keyup", (event) => {
            if (!player.getData("alive")) return;
            const key = event.key.toUpperCase();
            if ([leftKey, rightKey].includes(key) && !keys.left.isDown && !keys.right.isDown) {
                player.setVelocityX(0);
                player.play("walk_south");
            }
        });
    }
    
    handleJump(player) {
        const { canJump, onWall } = player.data.values;
        if ((canJump && player.body.blocked.down) || onWall) {
            player.setVelocityY(-600);
            if (onWall) {
                player.setVelocityX(player.body.blocked.left ? -200 : 200);
            }
            player.setData({ canJump: false, onWall: false });
        }
    }
    
    createPlatform(x, y) {
        const platform = this.platforms.create(x, y, "grass_platform")
            .setScale(0.6)
            .refreshBody();
        platform.setData('oneWay', true);
        return platform;
    }

    spawnPlatforms() {
        const cameraY = this.cameras.main.worldView.y;
        const targetSpawnY = cameraY - this.spawnOffset;
        while (this.lastPlatformY > targetSpawnY) {
            const spacingY = 150;
            const minGapX = 200;
            let x;
            if (this.lastPlatformX === undefined) {
                x = Phaser.Math.Between(100, this.scale.width - 100);
            } else {
                do {
                    x = Phaser.Math.Between(100, this.scale.width - 100);
                } while (Math.abs(x - this.lastPlatformX) < minGapX);
            }
            this.lastPlatformX = x;
            this.lastPlatformY -= spacingY;
            this.createPlatform(x, this.lastPlatformY);
        }
    }

    spawnChallengeStructure() {
        // How far above the last platform the challenge structure should appear
        const challengeSpacing = 150;
        const baseY = this.lastPlatformY - challengeSpacing;
        console.log("Challenge structure baseY:", baseY);
        const centerX = this.scale.width / 2;

        // Create the base challenge platform and mark it
        this.challengeBase = this.challengePlatforms.create(centerX, baseY, "grass_platform")
            .setScale(0.6)
            .refreshBody();
        this.challengeBase.setData('challengeBase', true);
    
        // Trampoline
        const trampoline = this.physics.add.staticImage(centerX, baseY - 20, "grass_brown2")
            .setScale(0.5)
            .refreshBody();
        this.physics.add.collider(this.players, trampoline, (player) => {
            player.setVelocityY(-1000);
            this.challengeActive = false;
        });

        // Answer platforms above the base
        const answerY = baseY - 400;
        const totalPlatforms = 4;
        const sidePadding = 150;
        const spacingX = (this.scale.width - 2 * sidePadding) / (totalPlatforms - 1);
       
        for (let i = 0; i < totalPlatforms; i++) {
            const x = sidePadding + i * spacingX;
            const option = this.currentQuestion.options[i];
            
            // Create the answer platform and store the option text in its data
            const answerPlatform = this.challengePlatforms.create(x, answerY, "grass_platform")
                .setScale(0.6)
                .refreshBody();
            answerPlatform.setData('isAnswer', true);
            answerPlatform.setData('option', option);
            
            // Create the answer text above the platform
            this.add.text(x, answerY - 50, option, {
                fontSize: "20px",
                fill: "#000"
            }).setOrigin(0.5);
        }

        this.challengeQuestionY = answerY - 200;
        this.challengeQuestionText = this.add.text(centerX, baseY - 200, this.currentQuestion.question, {
            fontSize: "24px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(1);

        // Update lastPlatformY so that subsequent spawns continue from here
        this.lastPlatformY = baseY - 800;
        this.platformSpawningEnabled = true;
        this.platformSpawnLimitY = -Infinity;
    }

    checkAnswerPlatform(player, platform) {
        if (platform.getData('isAnswer') && this.challengeActive) {
            // Retrieve the selected option from the platform's data
            const selectedOption = platform.getData('option');
            
            // Use QuizManager's submitAnswer() to check the answer (see :contentReference[oaicite:2]{index=2})
            const { isCorrect, correctAnswer } = this.quizManager.submitAnswer(selectedOption);
            
            // Display feedback based on correctness (customize as needed)
            if (isCorrect) {
                console.log("✅ Correct!");
            } else {
                console.log(`❌ Incorrect, correct answer: ${correctAnswer}`);
            }

             if (this.quizManager.hasMoreQuestions()) {
                this.currentQuestion = this.quizManager.getCurrentQuestion();
            } else {
                // Reinitialize if you want to cycle through questions
                this.quizManager = new QuizManager(questions, 1);
                this.currentQuestion = this.quizManager.getCurrentQuestion();
            }
            
            // Resume camera or take other action
            this.cameras.main.startFollow(player);
            this.challengeActive = false;
        }
    }


    update() {
        const cameraY = this.cameras.main.worldView.y;
      
        this.players.forEach(player => {
            const isGrounded = player.body.blocked.down;
            const isOnWall = player.body.blocked.left || player.body.blocked.right;
            if (isGrounded) {
                player.setData({ canJump: true, onWall: false });
            } else if (isOnWall) {
                player.setData("onWall", true);
            }

            if (player.getData("alive") && player.y < this.highestYReached) {
                this.highestYReached = player.y;
                const distance = Math.round(this.floor.y - this.highestYReached);
                this.distanceText.setText(`Height: ${distance}`);
            }

            const distance = Math.round(this.floor.y - this.highestYReached);
            if (distance >= this.nextChallengeHeight) {
                this.spawnChallengeStructure();
                this.nextChallengeHeight += 5000;
            }

            if (this.platformSpawningEnabled) {
                this.spawnPlatforms();
                this.platformSpawningEnabled = false;
            }

            if (cameraY < this.lastPlatformY - 100) {
                this.platformSpawningEnabled = true;
            }

            if (this.challengeBase && !this.challengeActive) {
                const challengeBaseTop = this.challengeBase.y - (this.challengeBase.displayHeight / 2);
                const playerBottom = player.y + (player.displayHeight / 2);
                const threshold = 20; 
                
                if (Math.abs(playerBottom - challengeBaseTop) < threshold) {
                    this.challengeActive = true;  
                    console.log("Player landed on challenge base; panning camera to", this.challengeQuestionY);
                    
                    this.cameras.main.stopFollow();
                  
                    this.cameras.main.pan(this.cameras.main.centerX, this.challengeQuestionY + 400, 500, 'Power2');
                }
            }

            // Clean up off screen platforms
            this.platforms.getChildren().forEach(platform => {
                if (platform.y > cameraY + this.scale.height + 200) {
                    platform.destroy();
                }
            });

            // Clean up off screen challenge platforms
            this.challengePlatforms.getChildren().forEach(platform => {
                if (platform.y > cameraY + this.scale.height + 200) {
                    platform.destroy();
                }
            });

            if (player.y > cameraY + this.scale.height + 100) {
                console.log("💀 Game Over");
                this.scene.restart();
            }
        });
    }
}

export default MinigameScene;
