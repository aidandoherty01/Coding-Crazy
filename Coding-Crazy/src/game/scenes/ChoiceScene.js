//THIS SCENE IS AN OVERLAY FOR THE BOARD
//It's used when a player can choose between paths
import Phaser from "phaser";;


class ChoiceScene extends Phaser.Scene{
    constructor() {
        super({ key: "ChoiceScene" });
    }
    
    init(data){
        this.player = data.player;
        this.board = data.board;
        this.currNode = data.currNode;
    }

    preload() {
        this.load.pack("asset_pack", "../assets/assets.json");
    }

    create() {
        const arrows = this.add.group();

        for(let i = 0; i < this.board.getNextMoves(this.currNode).length; i++)
        {
            let adjNode = this.board.getNextMoves(this.currNode)[i];
            let adjNodeDirection = adjNode.getPath()[0];
            
            this.createArrow(this.player.x, this.player.y, adjNode, adjNodeDirection, arrows);
        }
    }

    createArrow(x, y, adjNode, direction, group) {
        
        var arrow;

        switch(direction) {
            case 0: //UP

                arrow = this.add.sprite(x, y - 48, "direction_arrow",);
                arrow.setFrame(30);
                break;

            case 1: //DOWN

                arrow = this.add.sprite(x, y + 48, "direction_arrow",);
                arrow.setFrame(15);
                break;

            case 2: //LEFT

                arrow = this.add.sprite(x - 48, y, "direction_arrow",);
                arrow.setFrame(0);
                break; 

            case 3: //RIGHT

                arrow = this.add.sprite(x + 48, y, "direction_arrow",);
                arrow.setFrame(35);
                break;

            default:
                console.log("DIRECTION NOT FOUND");
                break;
        }
        arrow.setData('adjNode', adjNode);
        this.setArrowInteraction(arrow, group);
        group.add(arrow);
    }

    setArrowInteraction(arrow, group){
        arrow.setInteractive();
        arrow.on('pointerover', () => this.startEffect(arrow));
        arrow.on('pointerout', () => this.stopEffect(arrow));
        arrow.on('pointerdown', () => {
            this.scene.get('BoardScene').events.emit('choiceMade', arrow.getData('adjNode'));
            group.clear(true, true);
            this.scene.stop();
        })
    }

    startEffect(arrow) {

        arrow.setTint(0x0000CC33);

        if (!arrow.glowEffect) {
            arrow.glowEffect = this.tweens.add ({
                targets: arrow,
                alpha: {from:1, to: 0.1},
                duration: 600,
                yoyo: true,
                repeat: -1
            });
        }
    }

    stopEffect(arrow) {

        if(arrow.glowEffect) {

            arrow.clearTint();
            arrow.setAlpha(1);
            arrow.glowEffect.stop();
            arrow.glowEffect.remove();
            arrow.glowEffect = null;
        }
    }

}

export default ChoiceScene;