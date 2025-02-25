import Phaser from "phaser";;
import { EventBus } from "../../game/EventBus";
import { Direction, EVENT_TYPE, Vertex, Digraph, make_original_digraph } from "../../data/board_graph";


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
    do{
      this.ANode = this.original_board.randomVertex();
    }while(this.ANode === 0);
    this.original_board.getVertex(this.ANode).addEvent(EVENT_TYPE.A_plus);
    this.APlus = this.add.image((this.original_board.getVertex(this.ANode).x*32)-16, (this.original_board.getVertex(this.ANode).y*32)-16,"A+").setScale(0.25);
    this.playerNode = 0;
    this.player1 = this.add.image((this.original_board.getVertex(this.playerNode).x*32)-16, (this.original_board.getVertex(this.playerNode).y*32)-16,"player",6).setScale(0.6);
    this.numAPlusses = 0 //This will soon be data held in player class

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

    this.moveButton_six = this.add.text(300, 100, 'Move 6 Spaces', { 
        font: '20px Arial', 
        fill: '#ffffff', 
        backgroundColor: '#0000ff',
        padding: { x: 10, y: 5 }
      });
      
      // Make the text object interactive
      this.moveButton_six.setInteractive();
      
      // Add a click listener
      this.moveButton_six.on('pointerdown', () => {
        // Call your function with argument 6
        this.moveSpace(6);
      });

      this.APlusText = this.add.text(700, 100, `Number of A+s: ${this.numAPlusses}`, {
        fontSize: "20px",
        fill: "#000000"
      });

    // Emit an event to notify the React component that the scene is ready
    EventBus.emit("current-scene-ready", this);
  }

  

  moveSpace(spacesLeft){
    console.log("Moving one space");
    if(this.original_board.getNextMoves(this.playerNode).length == 1){
      //console.log(this.original_board.getNextMoves(this.playerNode));
      const pathToPoint = this.original_board.getNextMoves(this.playerNode)[0].getPath();
      this.playerNode = this.original_board.getNextMoves(this.playerNode)[0].getTo();
      console.log(this.playerNode);
      this.walkThePath(pathToPoint, 0, spacesLeft);
    }else{
      const generatedData = {player: this.player1, board: this.original_board, currNode: this.playerNode}; 
      this.events.once('choiceMade', (choice) => {
        this.handleChoice(choice, spacesLeft);
    }, this);
      this.scene.pause();
      this.scene.launch('ChoiceScene', generatedData);
  }
    return;
  }


  handleChoice(choice, spacesLeft){
    this.playerNode = choice.getTo();
    this.scene.resume();
    console.log(choice);
    this.walkThePath(choice.path, 0, spacesLeft);
  }

  walkThePath(path, index, spacesLeft) {
    console.log(this.player1.x, this.player1.y);
    const pathDir = path[index];
    let x_val, y_val;
    if (pathDir == Direction.UP){
        x_val = 0;
        y_val = -32;
    }
    else if (pathDir == Direction.DOWN){
        x_val = 0;
        y_val = 32;
    }
    else if (pathDir == Direction.RIGHT){
        x_val = 32;
        y_val = 0;
    }else{
        x_val = -32;
        y_val = 0;
    }
    this.tweens.add({
        targets: this.player1,
        x: this.player1.x + x_val,
        y: this.player1.y + y_val,
        duration: 250,
        ease: 'Linear',
        onComplete: () => {
            console.log("We should be at (", (this.original_board.getVertex(this.playerNode).x * 32) - 16, ", ",(this.original_board.getVertex(this.playerNode).y * 32) - 16,"), and we're at (",this.player1.x,",",this.player1.y,")")
            if(index < path.length - 1){
                this.walkThePath(path,index+1, spacesLeft);
            }else if(spacesLeft > 1){
              this.triggerEvents(this.player1); //Eventually will be so it's based on the player
              this.moveSpace(spacesLeft-1);
            }else{
              this.triggerEvents(this.player1);
              return;
            }
        }
      });
  }


  triggerEvents(player){
    const events = this.original_board.getVertex(this.playerNode).getEvents();
    console.log(this.playerNode);
    console.log(events);
    for(let i = 0; i < events.length; i++){
      this.handleEvent(events.at(i),player);
    }
  }

  handleEvent(ev, player){
    console.log("EVENT:", ev);
    switch (ev){
      case EVENT_TYPE.Nothing:
        break;
      case EVENT_TYPE.A_plus:
        console.log("You got a star!");
        this.numAPlusses += 1;
        this.APlusText.setText(`Number of A+s: ${this.numAPlusses}`);
        let newALoc;
        do{
          newALoc = this.original_board.randomVertex();
        }while(newALoc === this.ANode);
        this.original_board.getVertex(this.ANode).removeEvent(EVENT_TYPE.A_plus);
        this.ANode = newALoc;
        this.original_board.getVertex(this.ANode).addEvent(EVENT_TYPE.A_plus);
        this.APlus.setPosition((this.original_board.getVertex(this.ANode).x*32)-16, (this.original_board.getVertex(this.ANode).y*32)-16);
        break;
      default:
        break;
    }
  }

}



export default BoardScene;