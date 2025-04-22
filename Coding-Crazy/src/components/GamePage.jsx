import { Box, Typography, Grid, Paper } from "@mui/material";
import { PhaserGame } from "../game/PhaserGame"; 
import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { gameSession } from "../../server/gameSessionClass";
import Footer from "./Footer";

/* Grabs session from backend, updates with current information */
const grabSession = async (roomCode, socket, username) => {
    if(!roomCode){
        const tempSess = new gameSession("AA", 1, 1, false, 10);
        tempSess.gameStarted = true;
        const un = localStorage.getItem("username") || localStorage.getItem("guest");
        tempSess.addUser(un);
        tempSess.username = un;
        tempSess.socket = socket.current; 
        return tempSess;
    }
    const response = await fetch(`https://coding-crazy.onrender.com/getSession?roomCode=${encodeURIComponent(roomCode)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    }); // Grabs entire session from DB
    console.log(response);
    if(!response.ok){
        console.log(response);
        const tempSess = new gameSession("AA", 1, 1, false, 10);
        tempSess.gameStarted = true;
        const un = localStorage.getItem("username") || localStorage.getItem("guest");
        tempSess.addUser(un);
        tempSess.username = un;
        tempSess.socket = socket.current;
        return tempSess;
    }else{
        const jsonData = await response.json();
        console.log(jsonData);
        jsonData.socket = socket.current;   // Update socket with current socket (refreshes/reconnects)
        jsonData.username = username;   // Update user with current username
        return jsonData;
    }
};

const GamePage = () => {
    const socket = useRef(null);
    const gameRef = useRef({ game: null, scene: null });
    const location = useLocation();
    console.log(location.state);
    console.log("STRG", localStorage.getItem("roomCode"));
    const roomCode = localStorage.getItem("roomCode") || "AA";
    const username = localStorage.getItem("username") || localStorage.getItem("guest"); // guest is cheap workaround for username checking
    const [stateObject, setStateObject] = useState({});
    const [scoreDict, updateScoreDict] = useState({});

    useEffect(() => {
        if (!socket.current) {
            socket.current = io("https://coding-crazy.onrender.com");
        }
    
        const fetchSessionData = async () => {
            const sessionData = await grabSession(roomCode, socket, username);
            setStateObject(sessionData);
            console.log("SO", stateObject);

            if (sessionData.players) {
                const initialScores = {};
                for (const username in sessionData.players) {
                    initialScores[username] = sessionData.players[username].numAPlusses || 0;
                }
                updateScoreDict(initialScores);
            }
    
            if (!socket.current.connected) {
                socket.current.connect();
            }
    
            socket.current.emit("join_room", { roomCode });
        };
    
        fetchSessionData();
    
        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
                console.log("Socket disconnected");
            }
        };
    }, []); 

    useEffect(() => {
        const handleAPlus = (data) => {
            updateScoreDict((prevScores) => ({
                ...prevScores,
                [data.collector]: (prevScores[data.collector] || 0) + 1
            }));
        };

        const handleSingleAPlus = (data) => {
            if(data.collector === username){
                handleAPlus(data);
            }
        }
    
        if (socket.current) {
            socket.current.on("APlus_movement", handleAPlus);
            socket.current.on("singleplayer_APlus", handleSingleAPlus);
        }
    
        return () => {
            if (socket.current) {
                socket.current.off("APlus_movement", handleAPlus);
                socket.current.off("singleplayer_APlus", handleSingleAPlus);
            }
        };
    }, []);
    

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", color: "white", display: "flex", flexDirection: "column" }}>
            {/* Game Container */}
            <Grid container spacing={2} sx={{ flexGrow: 1, padding: 3 }}>
                {/* Left Side: Game Window */}
                <Grid item xs={12} md={10}>
                    <Paper sx={{ bgcolor: "#1e293b", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {/* Embedded Phaser Game */}
                        <Box sx={{ width: "100%", height: "100%" }}>
                        {Object.keys(stateObject).length > 0 && (
                                <PhaserGame ref={gameRef} SO={stateObject} />
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Side: Scoreboard, Stats, and Chat */}
                <Grid item xs={12} md={2}>
                    {/* Scoreboard */}
                    <Paper sx={{ bgcolor: "#1e293b", padding: 2, mb: 2 }}>
                        <Typography variant="h6">A+&apos;s Collected</Typography>
                        {Object.entries(scoreDict).map(([player,score], index) => (
                            <Typography key={index} sx={{ mt: 1 }}>
                                {player}: <span style={{ color: "#22c55e" }}>{score}</span>
                            </Typography>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default GamePage;
