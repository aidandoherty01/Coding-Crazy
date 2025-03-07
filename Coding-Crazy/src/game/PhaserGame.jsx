import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";

export const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef();
    const containerRef = useRef(); // React ref for game container

    useLayoutEffect(() => {
        if (!game.current && containerRef.current) {
            game.current = StartGame("game-container");

            if (ref) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    useEffect(() => {
        const handleSceneReady = (currentScene) => {
            if (typeof currentActiveScene === "function") {
                currentActiveScene(currentScene);
            }

            if (ref.current) {
                ref.current.scene = currentScene;
            } else {
                console.warn("PhaserGame ref.current is null. Scene not assigned.");
            }
        };

        EventBus.on("current-scene-ready", handleSceneReady);

        return () => {
            EventBus.off("current-scene-ready", handleSceneReady);
        };
    }, [currentActiveScene, ref]);

    return <div id="game-container" ref={containerRef} />;
});

PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
};
