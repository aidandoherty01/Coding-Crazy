import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, TextField, Button, Divider, LinearProgress } from "@mui/material";
import { PhaserGame } from "../game/PhaserGame"; 
import { useRef, useState, useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";

const GamePage = () => {
    
    const socket = io("http://localhost:5000");
    const gameRef = useRef({ game: null, scene: null });
    const location = useLocation();
    console.log(location.state);
    const playerNames = location.state?.players || [];
    const roomCode = location.state?.roomCode || 0;
    const username = location.state?.name || "MISSING";
    socket.emit("join_room",{roomCode, username});
    console.log("Players: ", playerNames);
    const stateObject = {socket: socket, players: playerNames, username: username, roomCode: roomCode};

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#0f172a", color: "white", display: "flex", flexDirection: "column" }}>
            {/* Game Container */}
            <Grid container spacing={2} sx={{ flexGrow: 1, padding: 3 }}>
                {/* Left Side: Game Window */}
                <Grid item xs={12} md={10}>
                    <Paper sx={{ bgcolor: "#1e293b", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {/* Embedded Phaser Game */}
                        <Box sx={{ width: "100%", height: "100%" }}>
                            <PhaserGame ref={gameRef} SO={stateObject} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Side: Scoreboard, Stats, and Chat */}
                <Grid item xs={12} md={2}>
                    {/* Scoreboard */}
                    <Paper sx={{ bgcolor: "#1e293b", padding: 2, mb: 2 }}>
                        <Typography variant="h6">Score</Typography>
                        {["Player 1", "Player 2", "Player 3"].map((player, index) => (
                            <Typography key={index} sx={{ mt: 1 }}>
                                {player}: <span style={{ color: "#22c55e" }}>{Math.floor(Math.random() * 50)} Points</span>
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
