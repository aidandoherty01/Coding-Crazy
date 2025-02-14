import { useRef } from "react";
import { PhaserGame } from "./game/PhaserGame";

function App() {
    const phaserRef = useRef();

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <div id="game-container"></div>
        </div>
    );
}

export default App;
