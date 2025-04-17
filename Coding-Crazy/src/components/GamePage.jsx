import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, TextField, Button, Divider, LinearProgress } from "@mui/material";
import { PhaserGame } from "../game/PhaserGame"; 
import { useRef, useState, useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";
import { gameSession } from "../../server/gameSessionClass";

/* Grabs session from backend, updates with current information */
const grabSession = async (roomCode, socket, username) => {
    if(!roomCode){
        const tempSess = new gameSession("AAAAAA", 1, 1, false, 10);
        tempSess.gameStarted = true;
        tempSess.addUser("Guest");
        tempSess.username = "Guest";
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
        const tempSess = new gameSession("AAAAAA", 1, 1, false, 10);
        tempSess.gameStarted = true;
        tempSess.addUser("Guest");
        tempSess.username = "Guest";
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
    const roomCode = localStorage.getItem("roomCode");
    const username = localStorage.getItem("username") || localStorage.getItem("guest"); // guest is cheap workaround for username checking
    const [stateObject, setStateObject] = useState({});
    const [players, setPlayers] = useState({});
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
    
        if (socket.current) {
            socket.current.on("APlus_movement", handleAPlus);
        }
    
        return () => {
            if (socket.current) {
                socket.current.off("APlus_movement", handleAPlus);
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
                        <Typography variant="h6">Score</Typography>
                        {Object.entries(scoreDict).map(([player,score], index) => (
                            <Typography key={index} sx={{ mt: 1 }}>
                                {player}: <span style={{ color: "#22c55e" }}>{score} Points</span>
                            </Typography>
                        ))}
                    </Paper>

                    {/* Current Stats */}
                    <Paper sx={{ bgcolor: "#1e293b", padding: 2, mb: 2 }}>
                        <Typography variant="h6">Current Stats</Typography>
                        <Typography variant="body2">Total Questions</Typography>
                        <LinearProgress variant="determinate" value={80} sx={{ bgcolor: "#334155", mb: 1 }} />
                        <Typography variant="body2">Correctly Answered</Typography>
                        <LinearProgress variant="determinate" value={60} sx={{ bgcolor: "#334155", mb: 1 }} />
                        <Typography variant="body2">Needs Work</Typography>
                        <LinearProgress variant="determinate" value={20} sx={{ bgcolor: "#334155" }} />
                    </Paper>

                    {/* Chat Box */}
                    <Paper sx={{ bgcolor: "#1e293b", padding: 2, display: "flex", flexDirection: "column", height: "250px" }}>
                        <Typography variant="h6">Chat</Typography>
                        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                            <ListItem><ListItemText primary="Player 1: Hello!" /></ListItem>
                            <ListItem><ListItemText primary="Player 2: Hi there!" /></ListItem>
                            <ListItem><ListItemText primary="Player 3: Good game!" /></ListItem>
                        </List>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: "flex" }}>
                            <TextField fullWidth size="small" placeholder="Type a message..." sx={{ bgcolor: "white", borderRadius: 1 }} />
                            <Button variant="contained" sx={{ ml: 1 }}>Send</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Footer */}
            <Box sx={{ textAlign: "center", py: 2, bgcolor: "#1e293b" }}>
                <Typography variant="body2">© 2025 Study Studio. All rights reserved.</Typography>
            </Box>
        </Box>
    );
};

export default GamePage;
