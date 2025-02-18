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
    let arrows = [];
    this.add.image(0, 0, "board").setOrigin(0).setScale(0.5);

    const original_board = make_original_digraph();
    let playerNode = 0;
    const player1 = this.add.image((original_board.getVertex(playerNode).x*32)-16, (original_board.getVertex(playerNode).y*32)-16,"player",6).setScale(0.6);

    const moveButton = this.add.text(100, 100, 'Move a Space', { 
      font: '20px Arial', 
      fill: '#ffffff', 
      backgroundColor: '#0000ff',
      padding: { x: 10, y: 5 }
    });
    
    // Make the text object interactive
    moveButton.setInteractive();
    
    // Add a click listener
    moveButton.on('pointerdown', () => {
      // Call your function with argument 6
      playerNode = moveSpace(this, arrows, original_board, playerNode, player1, 1);
    });
    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

}

function moveSpace(scene, arrows, original_board, playerNode, player1, spacesLeft){
  console.log("Moving one space");
  if(original_board.getVertex(playerNode).adjacents.length == 1){
    playerNode = original_board.getVertex(playerNode).adjacents[0];
    console.log(playerNode);
    scene.tweens.add({
      targets: player1,  // the sprite to move
      x: (original_board.getVertex(playerNode).x*32)-16,
      y: (original_board.getVertex(playerNode).y*32)-16,
      duration: 1000,   // duration in milliseconds
      ease: 'Linear'    // easing function; try others like 'Power2' for different effects
    });
  }else{
    for(let index = 0; index < original_board.getVertex(playerNode).adjacents.length; index++){
      let adjNode = original_board.getVertex(playerNode).adjacents[index];
      let dx = (original_board.getVertex(adjNode).x*32) - (original_board.getVertex(playerNode).x*32);
      let dy = (original_board.getVertex(adjNode).y*32) - (original_board.getVertex(playerNode).y*32);
      let angle = Math.atan2(dy,dx);
      const arrow = scene.add.image((original_board.getVertex(adjNode).x*32)-16,(original_board.getVertex(adjNode).y*32)-16,"arrow",0).setScale(0.5).setRotation(angle);
      arrow.customId = index;
      arrow.setInteractive();
      arrow.on('pointerdown', () => {
        console.log('Clicked arrow id:', arrow.customId);
        playerNode = original_board.getVertex(playerNode).adjacents[arrow.customId];
          console.log(playerNode);
          scene.tweens.add({
            targets: player1,  // the sprite to move
            x: (original_board.getVertex(playerNode).x*32)-16,
            y: (original_board.getVertex(playerNode).y*32)-16,
            duration: 1000,   // duration in milliseconds
            ease: 'Linear'    // easing function; try others like 'Power2' for different effects
          });
        // Remove/hide all arrows
        arrows.forEach(a => {
          a.destroy(); // or a.setVisible(false);
        });
      });
    }
  }
  if (spacesLeft > 0){
    return playerNode;
  }else{
    return playerNode;
  }
  
}

export default BoardScene;