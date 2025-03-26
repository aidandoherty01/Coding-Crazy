import Phaser from "phaser";

class MinigameScene extends Phaser.Scene {
    constructor() {
        super({ key: "MinigameScene", physics: { arcade: true } });
        this.platforms = [];
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

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        this.add.image(400, 300, "blue_bg_layer1").setOrigin(0.5).setScale(1);

        this.platforms = this.physics.add.staticGroup();
        this.floor = this.physics.add.staticImage(400, 800, "grass_platform").setScale(4, 1).refreshBody();
        
        const worldHeight = 100000;
        const wallY = this.floor.y - worldHeight
        
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

        this.distanceText = this.add.text(20, 20, "Height: 0", {
            fontSize: "20px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0);

        this.spawnPlatforms(700);
        this.initializeMainPlayer();

        this.physics.add.overlap(this.players[0], this.platforms, (player, platform) => {
            const isFalling = player.body.velocity.y > 0;
            const isAbove = player.y + player.height / 2 < platform.y;

            if (isFalling && isAbove) {
                this.physics.world.collide(player, platform);
            }
        });
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
        const platform = this.platforms.create(x, y, "grass_platform").setScale(0.6).refreshBody();
        platform.setData('oneWay', true);
        return platform;
    }

    spawnPlatforms(startY = this.lastPlatformY) {
        const spacingY = 150;
        const minGapX = 200;
        let lastX = null;

        for (let i = 0; i < 10; i++) {
            const y = startY - spacingY * (i + 1);

            // Respect spawn limits
            if (!this.platformSpawningEnabled) break;
            if (y < this.platformSpawnLimitY) break;
            if (this.resumePlatformSpawnY !== null && y < this.resumePlatformSpawnY) break;

            let x;
            do {
                x = Phaser.Math.Between(100, this.scale.width - 100);
            } while (lastX !== null && Math.abs(x - lastX) < minGapX);

            lastX = x;

            this.createPlatform(x, y);
            this.lastPlatformY = y;
        }

        // Once passed the resume point allow free spawning again
        if (this.resumePlatformSpawnY !== null && this.lastPlatformY <= this.resumePlatformSpawnY) {
            this.resumePlatformSpawnY = null;
        }
    }

    spawnChallengeStructure(baseY) {
        const centerX = this.scale.width / 2;

        // Base platform
        this.createPlatform(centerX, baseY);

        // Trampoline
        const trampoline = this.physics.add.staticImage(centerX, baseY - 20, "grass_brown2").setScale(0.5).refreshBody();
        this.physics.add.collider(this.players, trampoline, (player) => {
            player.setVelocityY(-1000);
        });

        // Answer platforms above
        const answerY = baseY - 200;
        const totalPlatforms = 4;
        const sidePadding = 150;
        const spacingX = (this.scale.width - 2 * sidePadding) / (totalPlatforms - 1);


       for (let i = 0; i < totalPlatforms; i++) {
            const x = sidePadding + i * spacingX;
            this.createPlatform(x, answerY);
        }

        // Question text
        const questionY = answerY - 200;
        this.add.text(centerX, questionY, "What is 2 + 2?", {
            fontSize: "24px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(1);

        // Update resume position and allow platform spawning above
        this.resumePlatformSpawnY = baseY - 500;
        this.lastPlatformY = this.resumePlatformSpawnY; // so spawnPlatforms() starts here
        this.platformSpawningEnabled = true;
        this.platformSpawnLimitY = -Infinity;
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
                const baseY = this.highestYReached - 100;
                this.spawnChallengeStructure(baseY);
                this.nextChallengeHeight += 5000;
            }

            const highestY = Math.min(...this.platforms.getChildren().map(p => p.y));
            if (this.platformSpawningEnabled && highestY > cameraY - 300) {
                this.spawnPlatforms();
            }

            this.platforms.getChildren().forEach(platform => {
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
