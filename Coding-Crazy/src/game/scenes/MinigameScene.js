import Phaser from "phaser";
import QuizManager from "../../managers/QuizManager.js";
import questions from "../../data/questions.json";

const PIXELS_PER_METER = 50;

class MinigameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MinigameScene", physics: { arcade: true } });

    this.challengeActive = false;
    this.challengeBase = null;
    this.challengeQuestionY = null;
    this.timeLimit = 120; // 2 minutes
  }

  preload() {
    this.load.pack("minigameAsset_pack", "../assets/minigameAssets.json");
    this.load.spritesheet("player", "../assets/player.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.animation("SpriteAnimation", "../assets/sprite_animation.json");
  }

  init(data) {
    this.quizManager = new QuizManager(questions, 1);
    this.currentQuestion = this.quizManager.getCurrentQuestion();
    this.returnScene = data.returnScene || "BoardScene";
  }

  create() {
    console.log("🎮 Minigame Started!");
    this.setupWorld();
    this.roundSettings();
    this.spawnPlatforms();
    this.initializeMainPlayer();
    this.setupColliders();
  }

  // -------- Setup Functions --------
  setupWorld() {
    // Set world bounds and background
    this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
    const worldHeight = 100000;
    this.background = this.add
      .tileSprite(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        worldHeight,
        "blue_bg_layer1"
      )
      .setOrigin(0.5);

    // Create groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.challengePlatforms = this.physics.add.staticGroup();
    this.challengeStructures = this.add.group();

    // Create floor and walls
    this.floor = this.physics.add
      .staticImage(400, 800, "grass_platform")
      .setScale(4, 1)
      .refreshBody();
    const wallY = this.floor.y - worldHeight;
    this.leftWall = this.physics.add
      .staticImage(0, wallY, "pixel_wall")
      .setOrigin(0, 0)
      .setDisplaySize(1, worldHeight)
      .setVisible(false)
      .refreshBody();
    this.rightWall = this.physics.add
      .staticImage(this.scale.width, wallY, "pixel_wall")
      .setOrigin(1, 0)
      .setDisplaySize(1, worldHeight)
      .setVisible(false)
      .refreshBody();

    // Set initial game state values
    this.highestYReached = this.floor.y;
    this.nextChallengeHeight = 1000;
    this.platformSpawningEnabled = true;
    this.platformSpawnLimitY = this.floor.y - 1000;
    this.lastPlatformY = this.floor.y;
    this.spawnOffset = 1000;
    this.distanceText = this.add
      .text(20, 20, "Height: 0", {})
      .setStyle({
        fontSize: "24px",
        fill: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "transparent",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(1);
  }

  roundSettings() {
    this.remainingTime = this.timeLimit;
    this.timerText = this.add
      .text(this.scale.width - 20, 20, this.remainingTime, {
        fontSize: "24px",
        fill: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "transparent",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0) // right‑aligned
      .setScrollFactor(0) // stays on the HUD
      .setDepth(1);

    this.displayResultBanner(
      `${this.timeLimit} seconds to climb go!`,
      "#ffffff"
    );

    this.time.addEvent({
      delay: 1000,
      repeat: this.timeLimit - 1,
      callback: () => {
        this.remainingTime--;
        this.timerText.setText(this.remainingTime);

        if (this.remainingTime <= 0) {
          this.endGame();
        }
      },
    });
  }

  setupColliders() {
    this.physics.add.collider(this.players[0], this.floor);

    // Overlap for regular platforms
   this.physics.add.collider(
     this.players[0],
     this.platforms,
     null, 
     (player, plat) => this.isPlayerApproachingPlatform(player, plat),
     this
   );

   // Overlap for moving platforms
   this.physics.add.collider(
     this.players[0],
     this.movingPlatforms,
     null,
     (player, plat) => this.isPlayerApproachingPlatform(player, plat),
     this
   );

    // Overlap for challenge platforms
    this.physics.add.overlap(
      this.players[0],
      this.challengePlatforms,
      (player, platform) => {
        if (this.isPlayerApproachingPlatform(player, platform)) {
          this.physics.world.collide(player, platform);
          // Call answer check if it is an answer platform during an active challenge
          if (platform.getData("isAnswer") && this.challengeActive) {
            this.checkAnswerPlatform(player, platform);
          }
        }
      },
      null,
      this
    );

    this.physics.add.collider(
      this.players[0],
      this.leftWall,
      (player) => {
        player.setData("touchingLeftWall", true);
        console.log("Colliding with left wall");
        let timer = this.time.delayedCall(
          200,
          () => {
            player.setData("touchingLeftWall", false);
          },
          null,
          this
        );
        player.setData("leftWallTimer", timer);
      },
      null,
      this
    );

    this.physics.add.collider(
      this.players[0],
      this.rightWall,
      (player) => {
        player.setData("touchingRightWall", true);
        console.log("Colliding with right wall");
        let timer = this.time.delayedCall(
          200,
          () => {
            player.setData("touchingRightWall", false);
          },
          null,
          this
        );
        player.setData("rightWallTimer", timer);
      },
      null,
      this
    );
  }

  // -------- Helper Functions --------
  isPlayerApproachingPlatform(player, platform) {
    return (
      player.body.velocity.y > 0 && player.y + player.height / 2 < platform.y
    );
  }

  cleanupGroup(group, offset = 200) {
    const cameraY = this.cameras.main.worldView.y;
    group.getChildren().forEach((item) => {
      if (item.y > cameraY + this.scale.height + offset) {
        item.destroy();
      }
    });
  }

  changeBackgroundColor() {
    const randomColor = Phaser.Display.Color.RandomRGB().color;
    this.background.setTint(randomColor);
  }

  // -------- Player and Controls --------
  initializeMainPlayer() {
    const spawnX = this.scale.width / 2;
    const spawnY = this.floor.y - 100;
    const player = this.createPlayer(spawnX, spawnY);
    this.players = [player];
    this.setupPlayerControls(player, "W", "A", "D");

    this.initialY = player.y;
    this.highestReached = player.y;

    this.cameras.main.startFollow(player);
    this.cameras.main.setDeadzone(this.scale.width, this.scale.height / 2);
  }

  createPlayer(x, y) {
    const player = this.physics.add
      .sprite(x, y, "player", 6)
      .setScale(0.9)
      .setOffset(0, -10);
    player.setGravityY(1000).setData({
      canJump: true,
      alive: true,
    });
    return player;
  }

  setupPlayerControls(player, upKey, leftKey, rightKey) {
    // Array to track currently pressed horizontal keys
    player.movementKeys = [];

    // Keydown handler: check for jump or horizontal input
    this.input.keyboard.on("keydown", (event) => {
      if (!player.getData("alive")) return;
      const key = event.key.toUpperCase();

      if (key === upKey) {
        if (player.body.blocked.down) {
          this.handleJump(player);
        } else if (
          (player.getData("touchingLeftWall") ||
            player.getData("touchingRightWall")) &&
          !player.getData("hasWallJumped")
        ) {
          this.handleWallJump(player);
        }
      }

      if (key === leftKey || key === rightKey) {
        // Only add the key if it isn't already recorded
        if (!player.movementKeys.includes(key)) {
          player.movementKeys.push(key);
        }
        // The dominating key is the last one pressed
        const activeKey = player.movementKeys[player.movementKeys.length - 1];
        if (activeKey === leftKey) {
          player.setVelocityX(-500);
          if (player.body.blocked.down) {
            player.play("walk_west");
          }
        } else if (activeKey === rightKey) {
          player.setVelocityX(500);
          if (player.body.blocked.down) {
            player.play("walk_east");
          }
        }
      }
    });

    // Keyup handler: update movement based on which keys remain pressed
    this.input.keyboard.on("keyup", (event) => {
      if (!player.getData("alive")) return;
      const key = event.key.toUpperCase();
      if (key === leftKey || key === rightKey) {
        // Remove the key from the movement array.
        const index = player.movementKeys.indexOf(key);
        if (index > -1) {
          player.movementKeys.splice(index, 1);
        }
        // If there are still any keys pressed, take the last one as dominant
        if (player.movementKeys.length > 0) {
          const activeKey = player.movementKeys[player.movementKeys.length - 1];
          if (activeKey === leftKey) {
            player.setVelocityX(-500);
            player.play("walk_west");
          } else if (activeKey === rightKey) {
            player.setVelocityX(500);
            player.play("walk_east");
          }
        } else {
          // No horizontal keys are being held down: stop horizontal motion
          if (!player.getData("isWallJump")) {
            player.setVelocityX(0);
            player.play("walk_south");
          }
        }
      }
    });
  }

  handleJump(player) {
    player.setVelocityY(-600);
    player.setData("canJump", false);
    this.sound.play("jump");
    player.setData("isWallJump", false);
  }

  handleWallJump(player) {
    player.setVelocityY(-600);
    this.sound.play("jump");
    if (player.getData("touchingLeftWall")) {
      console.log("Wall jump left");
      player.setVelocityX(500);
      player.setData("touchingLeftWall", false);
    } else if (player.getData("touchingRightWall")) {
      console.log("Wall jump right");
      player.setVelocityX(-500);
      player.setData("touchingRightWall", false);
    }

    player.setData("hasWallJumped", true);
    player.setData("canJump", false);
    player.setData("isWallJump", true);
  }

  // -------- Platform Spawning --------
  createPlatform(x, y) {
    const platform = this.platforms
      .create(x, y, "grass_platform")
      .setScale(0.6)
      .refreshBody();
    platform.setData("oneWay", true);
    return platform;
  }

  createMovingPlatform(x, y) {
    const plat = this.movingPlatforms
      .create(x, y, "grass_platform")
      .setScale(0.6)
      .refreshBody();
    plat.setData("oneWay", true);

    // pick a random horizontal travel distance and speed
    const travel = Phaser.Math.Between(100, 200);
    const duration = Phaser.Math.Between(2000, 4000);

    // make it tween back and forth forever
    this.tweens.add({
      targets: plat,
      x: x + travel,
      ease: "Sine.easeInOut",
      duration: duration,
      yoyo: true,
      repeat: -1,
    });

    return plat;
  }

  spawnPlatforms() {
    const cameraY = this.cameras.main.worldView.y;
    const targetSpawnY = cameraY - this.spawnOffset;
    // Define spacing and gap constraints
    const spacingY = 150;
    const minGapX = 200; // Minimum gap between platform x positions
    const maxGapX = 800; // Maximum gap between platform x positions

    while (this.lastPlatformY > targetSpawnY) {
      let x;

      if (this.lastPlatformX === undefined) {
        // If this is the first platform, choose any x value within bounds
        x = Phaser.Math.Between(100, this.scale.width - 100);
      } else {
        // Calculate allowed x-range based on the previous platform
        const minAllowedX = Math.max(100, this.lastPlatformX - maxGapX);
        const maxAllowedX = Math.min(
          this.scale.width - 100,
          this.lastPlatformX + maxGapX
        );

        // Pick an x value from within the allowed range
        // We also check to ensure the new x is at least minGapX away from the last x
        do {
          x = Phaser.Math.Between(minAllowedX, maxAllowedX);
        } while (Math.abs(x - this.lastPlatformX) < minGapX);
      }

      // Save the new platform's x coordinate and update the y coordinate
      this.lastPlatformX = x;
      this.lastPlatformY -= spacingY;
      if (Phaser.Math.FloatBetween(0, 1) < 0.2) {
        this.createMovingPlatform(x, this.lastPlatformY);
      } else {
        this.createPlatform(x, this.lastPlatformY);
      }
    }
  }

  spawnChallengeStructure() {
    const challengeSpacing = 150;
    const baseY = this.lastPlatformY - challengeSpacing;
    const centerX = this.scale.width / 2;

    // Create challenge base
    this.challengeBase = this.challengePlatforms
      .create(centerX, baseY, "grass_platform")
      .setScale(0.6)
      .setDepth(1)
      .refreshBody();
    this.challengeBase.setData("challengeBase", true);
    this.challengeStructures.add(this.challengeBase);

    // Create trampoline
    const trampoline = this.physics.add
      .staticImage(centerX, baseY - 20, "mushroom_red")
      .setScale(0.5)
      .setDepth(0)
      .refreshBody();
    this.physics.add.collider(this.players, trampoline, (player) => {
      player.setVelocityY(-1200);
      this.sound.play("bounce");
      this.tweens.add({
        targets: trampoline,
        scaleY: trampoline.scaleY * 0.7,
        duration: 100,
        yoyo: true,
        ease: "Quad.easeInOut",
      });
    });
    this.challengeStructures.add(trampoline);

    // Create answer platforms
    const answerY = baseY - 400;
    const totalPlatforms = 4;
    const sidePadding = 150;
    const spacingX =
      (this.scale.width - 2 * sidePadding) / (totalPlatforms - 1);
    for (let i = 0; i < totalPlatforms; i++) {
      const x = sidePadding + i * spacingX;
      const option = this.currentQuestion.options[i];
      const answerPlatform = this.challengePlatforms
        .create(x, answerY, "grass_platform")
        .setScale(0.6)
        .refreshBody();
      answerPlatform.setData("isAnswer", true);
      answerPlatform.setData("option", option);
      const optionText = this.add
        .text(x, answerY - 50, option, {
          fontSize: "24px",
          fill: "#fff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
        this.challengeStructures.add(optionText);
    }

    this.challengeQuestionY = answerY - 200;
    this.challengeQuestionText = this.add
      .text(centerX, baseY - 200, this.currentQuestion.question, {
        fontSize: "36px",
        fill: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "transparent",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(1);
      this.challengeStructures.add(this.challengeQuestionText);
    this.challengeActive = true;
    this.lastPlatformY = baseY - 800;
    this.platformSpawningEnabled = true;
    this.platformSpawnLimitY = -Infinity;
  }

  // -------- Answer Checking --------
  checkAnswerPlatform(player, platform) {
    if (platform.getData("isAnswer") && this.challengeActive) {
      const selectedOption = platform.getData("option");

      const { isCorrect, correctAnswer } =
        this.quizManager.submitAnswer(selectedOption);

      if (isCorrect) {
        console.log("✅ Correct!");
        this.displayResultBanner("Correct!", "#00ff00");
        this.sound.play("correct");
        player.setVelocityY(-1500);
        this.tweens.add({
          targets: platform,
          scaleY: platform.scaleY * 0.7,
          duration: 100,
          yoyo: true,
          ease: "Quad.easeInOut",
        });
      } else {
        console.log(`❌ Incorrect, correct answer: ${correctAnswer}`);
        this.displayResultBanner("Incorrect", "#ff0000");
        this.sound.play("incorrect");
        platform.destroy();

        const cloudY = platform.y + platform.displayHeight / 2;
        const cloud = this.add
          .sprite(platform.x, cloudY, "happy_cloud")
          .setOrigin(0.5)
          .setScale(0.8);

        // Disable the player's gravity so they can be carried upward
        player.body.allowGravity = false;
        player.setVelocityY(0);

        this.tweens.add({
          targets: [cloud, player],
          y: `-=${650}`,
          duration: 5000,
          ease: "Linear",
          onComplete: () => {
            cloud.destroy();
            player.body.allowGravity = true;
          },
        });
      }
      this.currentQuestion = this.quizManager.hasMoreQuestions()
        ? this.quizManager.getCurrentQuestion()
        : (() => {
            this.quizManager = new QuizManager(questions, 1);
            return this.quizManager.getCurrentQuestion();
          })();
      this.challengeActive = false;
    }
  }

  displayResultBanner(message, color) {
    // Create a text object at the center of the camera
    const banner = this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
        fontSize: "48px",
        fill: color,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1);

    // Tween to fade out and destroy the banner after showing for a few seconds
    this.tweens.add({
      targets: banner,
      alpha: 0,
      ease: "Linear",
      delay: 3000, // Keep the banner visible for 2 seconds
      duration: 100,
      onComplete: () => {
        banner.destroy();
      },
    });
  }

  // -------- Update Loop --------
  update() {
    const cameraY = this.cameras.main.worldView.y;

    this.players.forEach((player) => {
      // Update player state
      const isGrounded = player.body.blocked.down;
      if (isGrounded) {
        player.setData({ canJump: true });
        player.setData("hasWallJumped", false);
        if (player.movementKeys.length === 0) {
          player.setVelocityX(0);
          player.setData("isWallJump", false);
        }
      } else if (
        (player.body.blocked.left || player.body.blocked.right) &&
        !player.getData("hasWallJumped")
      ) {
        // In contact with a wall *and* hasn't wall jumped yet: allow wall jump
        player.setData("canJump", true);
      } else {
        // Otherwise, disable jump.
        player.setData("canJump", false);
      }

      // Update player height reached
      if (player.getData("alive") && player.y < this.highestYReached) {
        this.highestYReached = player.y;

        const pixelDistance = this.initialY - this.highestYReached;
        const heightInMeters = Math.round(pixelDistance / PIXELS_PER_METER);
        this.distanceText.setText(`Height: ${heightInMeters}m`);
      }

      // Update next challenge and platform spawning
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
      if (this.challengeBase) {
        const challengeBaseTop =
          this.challengeBase.y - this.challengeBase.displayHeight / 2;
        const playerBottom = player.y + player.displayHeight / 2;
        const threshold = 20;
        if (Math.abs(playerBottom - challengeBaseTop) < threshold) {
          if (!player.getData("onChallengeBase")) {
            player.setData("onChallengeBase", true);
            console.log(
              "Player landed on challenge base; panning camera to",
              this.challengeQuestionY
            );
            this.cameras.main.pan(
              this.cameras.main.centerX,
              this.challengeQuestionY + 400,
              500,
              "Power2"
            );
          }
        } else if (player.getData("onChallengeBase")) {
          player.setData("onChallengeBase", false);
        }
      }
      // Clean up off screen platforms
      this.cleanupGroup(this.movingPlatforms);
      this.cleanupGroup(this.platforms);
      this.cleanupGroup(this.challengePlatforms);
      this.cleanupGroup(this.challengeStructures);
      if (player.y > cameraY + this.scale.height + 100) {
        this.endGame();
      }
    });
  }

  endGame() {
    // stop physics & tint your player grey
    this.physics.pause();
    this.players.forEach((p) => p.setTint(0x999999));

    // compute a “score” however you like—in this example, height in meters
    const scoreMeters = Math.round(
      (this.initialY - this.highestYReached) / PIXELS_PER_METER
    );

    // show final banner
    this.displayResultBanner(
      `Game Over!\nScore: ${scoreMeters}m`,
      "#ff0000"
    );

    // then go back to your return scene
    this.time.delayedCall(5000, () => {
      this.scene.stop();
      this.scene.resume(this.returnScene);
    });
  }
}

export default MinigameScene;
