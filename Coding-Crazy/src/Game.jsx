import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import MainGameScene from "./scenes/MainGameScene";
import QuestionScene from "./scenes/QuestionScene";

const Game = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1024,
      height: 576,
      parent: gameRef.current,
      pixelArt: true,
      scene: [MainGameScene, QuestionScene],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default Game;
