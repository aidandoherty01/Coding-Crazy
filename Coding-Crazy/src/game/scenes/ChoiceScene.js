//THIS SCENE IS AN OVERLAY FOR THE BOARD
//It's used when a player can choose between paths
import Phaser from "phaser";;
import { EventBus } from "../../game/EventBus";
import { Vertex, Digraph, make_original_digraph } from "../../data/board_graph";


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
        console.log("A choice is to be made");
        const arrows = [];
        for(let index = 0; index < this.board.getVertex(this.currNode).adjacents.length; index++){
            let adjNode = this.board.getVertex(this.currNode).adjacents[index];
            let dx = (this.board.getVertex(adjNode).x*32) - (this.board.getVertex(this.currNode).x*32);
            let dy = (this.board.getVertex(adjNode).y*32) - (this.board.getVertex(this.currNode).y*32);
            let angle = Math.atan2(dy,dx);
            const arrow = this.add.image((this.board.getVertex(adjNode).x*32)-16,(this.board.getVertex(adjNode).y*32)-16,"arrow",0).setScale(0.5).setRotation(angle);
            arrow.customId = adjNode;
            arrow.setInteractive();
            arrow.on('pointerdown', () => {
              console.log('Clicked arrow id:', arrow.customId);
              // Remove/hide all arrows
              arrows.forEach(a => {
                a.destroy();
              });
              this.scene.get('BoardScene').events.emit('choiceMade', arrow.customId);
              this.scene.stop();
            });
            arrows.push(arrow);
        }
    }
}

export default ChoiceScene;