import Phaser from "phaser";

class MinigameScene extends Phaser.Scene {
    constructor() {
        super({ key: "MinigameScene", physics: { arcade: true } });

        this.platforms = [];
        this.correctAnswer = null;
        this.players = [];
    }

    preload() {
        this.load.pack("minigameAsset_pack", "../assets/minigameAssets.json");
        this.load.spritesheet("player", "../assets/player.png", { frameWidth: 32, frameHeight: 48 });
        this.load.animation("SpriteAnimation", "../assets/sprite_animation.json");
    }

    init(data) {
        this.returnScene = data.returnScene || "BoardScene"; 
    }

    create() {
        console.log("🎮 Minigame Started!");

        // Background
        this.add.image(400, 300, "blue_bg_layer1").setOrigin(0.5).setScale(1);

        // Flashcard Area
        this.flashcard = this.add.text(400, 50, "Flashcard Question?", {
            fontSize: "28px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.createPlayers();

        // Generate first question
        this.spawnPlatforms();

        // Timer for new questions
        this.time.addEvent({
            delay: 5000, // New question every 5 seconds
            loop: true,
            callback: () => this.spawnPlatforms()
        });
    }


    createPlayer(x, y) {
        let player = this.physics.add.sprite(x, y, "player", 6).setScale(0.6);
        player.setCollideWorldBounds(true);
        player.setBounce(0.2);
        player.setGravityY(800);
        player.setData("alive", true);

        // Enable animations (reuse from BoardScene)
        player.play("walk_south"); // Default idle animation

        this.physics.add.collider(player, this.platforms);

        this.input.keyboard.on("keydown-SPACE", () => {
            if (player.body.touching.down) {
                player.setVelocityY(-400);
                player.play("walk_north");
            }
        });

        return player;
    }

    createPlayers() {
        let player1 = this.createPlayer(300, 500);

        this.players.push(player1); 

        this.setupPlayerControls(player1, "W", "A", "D"); 
    }



    spawnPlatforms() {
        console.log("🛠 Spawning new platforms...");

        // Remove old platforms
        this.platforms.forEach(platform => platform.destroy());
        this.platforms = [];

        // Dummy question
        const question = "What is 2 + 2?";
        const answers = ["3", "4", "5"];
        this.correctAnswer = "4"; // Correct answer

        this.flashcard.setText(question);

        // Shuffle answers
        Phaser.Utils.Array.Shuffle(answers);

        // Create platforms with answers
        let positions = [200, 400, 600]; // X positions for platforms
        positions.forEach((x, index) => {
            let platform = this.createPlatform(x, 400, answers[index]);
            this.platforms.push(platform);
        });

        // Make platforms disappear after X seconds
        this.time.delayedCall(3000, () => this.removePlatforms());
    }


    createPlatform(x, y, answer) {
        let platform = this.physics.add.staticImage(x, y, "grass_platform");
        platform.setData("answer", answer);

        this.physics.add.collider(this.players, platform, (player, platform) => {
            this.checkAnswer(player, platform);
        });

        return platform;
    }


    checkAnswer(player, platform) {
        if (!player.getData("alive")) return; 

        let answer = platform.getData("answer");
        if (answer === this.correctAnswer) {
            console.log("✅ Correct!");
        } else {
            console.log("❌ Wrong!");
            player.setData("alive", false);
            player.setTint(0xff0000); // Red tint for eliminated players
            player.setVelocityY(-300);
            this.time.delayedCall(1000, () => player.destroy());
        }
    }


    removePlatforms() {
        console.log("⚠ Platforms disappearing...");
        this.platforms.forEach(platform => platform.destroy());
        this.platforms = [];
    }


    setupPlayerControls(player, upKey, leftKey, rightKey) {
        const keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes[upKey],
            left: Phaser.Input.Keyboard.KeyCodes[leftKey],
            right: Phaser.Input.Keyboard.KeyCodes[rightKey]
        });

        this.input.keyboard.on("keydown", (event) => {
            if (!player.getData("alive")) return;

            if (event.key.toUpperCase() === upKey && player.body.blocked.down) {
                player.setVelocityY(-400);
                player.play("walk_south");
            }

            // Move Left
            if (event.key.toUpperCase() === leftKey) {
                player.setVelocityX(-160);
                player.play("walk_west");
            }

            // Move Right
            if (event.key.toUpperCase() === rightKey) {
                player.setVelocityX(160);
                player.play("walk_east");
            }
        });

        this.input.keyboard.on("keyup", (event) => {
            if (!player.getData("alive")) return;

            if (event.key.toUpperCase() === leftKey || event.key.toUpperCase() === rightKey) {
                if (!keys.left.isDown && !keys.right.isDown) {
                    player.setVelocityX(0);

                    // Only switch to idle animation if the player is on the ground
                    if (player.body.blocked.down) {
                        player.play("walk_south");
                    }
                }   
            }
        });
    }


}

export default MinigameScene;
