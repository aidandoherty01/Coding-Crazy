import Phaser from "phaser";;
import { EventBus } from "../../game/EventBus";
import { Vertex, Digraph, make_original_digraph } from "../../data/board_graph";



class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.pack("asset_pack", "../assets/assets.json");
  }
  create() {
    console.log("🎮 BoardScene is now active!");
    
    this.add.image(0, 0, "board").setOrigin(0).setScale(0.5);

    this.original_board = make_original_digraph();
    this.playerNode = 0;
    this.player1 = this.add.image((this.original_board.getVertex(this.playerNode).x*32)-16, (this.original_board.getVertex(this.playerNode).y*32)-16,"player",6).setScale(0.6);

    this.moveButton = this.add.text(100, 100, 'Move a Space', { 
      font: '20px Arial', 
      fill: '#ffffff', 
      backgroundColor: '#0000ff',
      padding: { x: 10, y: 5 }
    });
    
    // Make the text object interactive
    this.moveButton.setInteractive();
    
    // Add a click listener
    this.moveButton.on('pointerdown', () => {
      // Call your function with argument 6
      this.moveSpace(1);
    });
    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  moveSpace(spacesLeft){
    console.log("Moving one space");
    if(this.original_board.getVertex(this.playerNode).adjacents.length == 1){
      this.playerNode = this.original_board.getVertex(this.playerNode).adjacents[0];
      console.log(this.playerNode);
      this.tweens.add({
        targets: this.player1,  // the sprite to move
        x: (this.original_board.getVertex(this.playerNode).x*32)-16,
        y: (this.original_board.getVertex(this.playerNode).y*32)-16,
        duration: 1000,   // duration in milliseconds
        ease: 'Linear'    // easing function; try others like 'Power2' for different effects
      });
    }else{
      const generatedData = {player: this.player1, board: this.original_board, currNode: this.playerNode}; 
      this.events.once('choiceMade', this.handleChoice, this);
      this.scene.pause();
      this.scene.launch('ChoiceScene', generatedData);
  }
    if (spacesLeft > 1){ //I.e., this is not the last space moved
        this.moveSpace(spacesLeft-1);
    }else{
      return;
    }
  }

  handleChoice(choice){
    this.playerNode = choice;
    this.tweens.add({
        targets: this.player1,  // the sprite to move
        x: (this.original_board.getVertex(this.playerNode).x*32)-16,
        y: (this.original_board.getVertex(this.playerNode).y*32)-16,
        duration: 1000,   // duration in milliseconds
        ease: 'Linear'    // easing function; try others like 'Power2' for different effects
      });
    this.scene.resume();
  }

}



export default BoardScene;