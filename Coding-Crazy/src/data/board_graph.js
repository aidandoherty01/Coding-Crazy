import Phaser from "phaser";

export const Direction = Object.freeze({
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
});

export class Vertex {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.adjacents = []; // List of adjacent vertex IDs
    }

    addEdge(toId,path) {
        if (!this.adjacents.includes(toId)) {
            this.adjacents.push(new Edge(this.id,toId,path));
        }
    }

    getID(){
        return this.id;
    }
}

export class Edge{
    constructor(fromID, toID, path){
        this.fromID = fromID;
        this.toID = toID;
        this.path = path;
    }
    getFrom(){
        return this.fromID;
    }
    getTo(){
        return this.toID;
    }
    getPath(){
        return this.path;
    }
}

export class Digraph {
    constructor() {
        this.vertices = new Map(); // Store vertices using a Map for quick access
    }

    addVertex(id, x, y) {
        if (!this.vertices.has(id)) {
            this.vertices.set(id, new Vertex(id, x, y));
        }
    }

    addEdge(fromId, toId, path) {
        this.vertices.get(fromId).addEdge(toId, path);
    }

    getVertex(id) {
        return this.vertices.get(id);
    }

    getNextMoves(id) {
        return this.vertices.get(id).adjacents;
    }

    addVertexByOffset(new_id, base_id, offsetX, offsetY, path){
        if(this.vertices.has(base_id)){
            
            const baseX = this.vertices.get(base_id).x;
            const baseY = this.vertices.get(base_id).y;
            this.vertices.set(new_id, new Vertex(new_id, baseX+offsetX, baseY+offsetY));
            this.addEdge(base_id,new_id, path);
            console.log(this.vertices.get(base_id));
        }
    }
}

export function make_original_digraph(){
    const original_board_graph = new Digraph();
    //I'm doing this by hand for now because we have only one board
    //But in the future, this would be easy to do with the tiled js map, just takes some effort to define which direction edges go
    original_board_graph.addVertex(0,5,23);
    original_board_graph.addVertexByOffset(1,0,0,-3, [Direction.UP, Direction.UP, Direction.UP]);
    original_board_graph.addVertexByOffset(2,1,0,-3, [Direction.UP, Direction.UP, Direction.UP]);
    original_board_graph.addVertexByOffset(3,2,0,-3, [Direction.UP, Direction.UP, Direction.UP]);
    original_board_graph.addVertexByOffset(4,3,0,-3, [Direction.UP, Direction.UP, Direction.UP]);
    original_board_graph.addVertexByOffset(5,4,0,-3, [Direction.UP, Direction.UP, Direction.UP]);
    original_board_graph.addVertexByOffset(6,5,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(7,6,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(8,7,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(9,8,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(10,9,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(11,10,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(12,11,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(13,12,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(14,13,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(15,14,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(16,15,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(17,16,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(18,17,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(19,18,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(20,19,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(21,20,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(22,21,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(23,22,-3,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addEdge(23,0, [Direction.LEFT, Direction.LEFT, Direction.LEFT]);
    original_board_graph.addVertexByOffset(24,3,3,0, [Direction.RIGHT, Direction.RIGHT, Direction.RIGHT]);
    original_board_graph.addVertexByOffset(25,7,0,3, [Direction.DOWN, Direction.DOWN, Direction.DOWN]);
    original_board_graph.addVertexByOffset(26,25,-1,1, [Direction.LEFT, Direction.DOWN]);
    original_board_graph.addVertexByOffset(27,26,0,2,[Direction.DOWN,Direction.DOWN]);
    original_board_graph.addEdge(24,27,[Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(28,27,3,-1,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT,Direction.UP]);
    original_board_graph.addVertexByOffset(29,25,4,-2,[Direction.RIGHT,Direction.RIGHT,Direction.UP,Direction.UP,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(30,28,3,-1,[Direction.UP,Direction.RIGHT,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addEdge(29,30,[Direction.RIGHT,Direction.DOWN,Direction.DOWN,Direction.DOWN]);
    original_board_graph.addVertexByOffset(31,30,2,-1,[Direction.RIGHT,Direction.RIGHT,Direction.UP]);
    original_board_graph.addVertexByOffset(32,31,2,-2,[Direction.UP,Direction.RIGHT,Direction.UP,Direction.RIGHT]);
    original_board_graph.addEdge(10,32, [Direction.DOWN]);
    original_board_graph.addEdge(32,11,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT,Direction.UP]);
    original_board_graph.addVertexByOffset(33,32,0,3, [Direction.DOWN,Direction.DOWN,Direction.DOWN]);
    original_board_graph.addVertexByOffset(34,33,0,3, [Direction.DOWN,Direction.DOWN,Direction.DOWN]);
    original_board_graph.addVertexByOffset(35,30,0,3, [Direction.DOWN,Direction.DOWN,Direction.DOWN]);
    original_board_graph.addEdge(35,34,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(36,27,2,3,[Direction.DOWN,Direction.DOWN,Direction.RIGHT,Direction.RIGHT,Direction.DOWN]);
    original_board_graph.addVertexByOffset(37,36,3,0,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(38,37,1,2,[Direction.DOWN,Direction.DOWN,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(39,38,3,0,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(40,39,3,0,[Direction.RIGHT,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addEdge(34,40,[Direction.DOWN,Direction.DOWN,Direction.RIGHT,Direction.RIGHT,Direction.DOWN,Direction.DOWN]);
    original_board_graph.addEdge(40,16,[Direction.RIGHT,Direction.RIGHT,Direction.DOWN,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(41,36,1,2,[Direction.DOWN,Direction.DOWN,Direction.RIGHT]);
    original_board_graph.addVertexByOffset(42,41,2,2,[Direction.DOWN,Direction.DOWN,Direction.RIGHT,Direction.RIGHT]);
    original_board_graph.addEdge(42,20,[Direction.RIGHT,Direction.RIGHT,Direction.DOWN,Direction.DOWN]);
    return original_board_graph;
}