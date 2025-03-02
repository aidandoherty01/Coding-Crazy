import { PhaserGame } from "../game/PhaserGame";
import { useRef } from "react";

function GamePage() {
    const gameRef = useRef({ game: null, scene: null });

    return (
        <div id="game-page">
            <h1>🎮 Welcome to the Game</h1>
            <p>Enjoy playing!</p>
            <PhaserGame ref = {gameRef} />
        </div>
    );
}

export default GamePage;
