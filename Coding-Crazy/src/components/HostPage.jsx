import { Box, Button, Checkbox, Typography, Grid, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";


function HostPage() {

    const [numPlayers, setNumPlayers] = useState(2);
    const [difficulty, setDifficulty] = useState(5);
    const [isPublic, setPublic] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkReconnect();
    })

    const createLobby = async () => {
        console.log("In create lobby.");
        const response = await fetch("http://localhost:5000/create_lobby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ numPlayers, difficulty, isPublic }),
        });
        console.log(response);
        if(!response.ok) {
            console.log(response);
            return;
        }
        
        const data = await response.json();
        navigate(`/lobby/${data}`, {state: data});
    };

    const checkReconnect = async () => {
        const roomCode = localStorage.getItem("roomCode");
        const response = await fetch(`http://localhost:5000/getSession?roomCode=${encodeURIComponent(roomCode)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });
        if (!response.ok) {
            console.log("Removing stale roomCode.");
            localStorage.removeItem("roomCode");
            localStorage.setItem("isReconnect", "false");
            window.dispatchEvent(new Event("reconnect"));
        } else {
            console.log(`Attempting Reconnect to ${roomCode}`);
            localStorage.setItem("isReconnect", "true");
            window.dispatchEvent(new Event("reconnect"));
            navigate(`/lobby/${roomCode}`); // avoid creating a new lobby
        }
    }

    return (
        <Box>
            <Box>
                <FormControl fullWidth sx={{ mb: 2, bgcolor: "background.paper" }}>
                    <InputLabel>Number of Players</InputLabel>
                    <Select
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(e.target.value)}
                    label="Number of Players"
                    sx={{
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        "& .MuiSelect-icon": {
                          color: "text.secondary",
                        },
                      }}
                    >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                        <MenuItem key={num} value={num} sx={{color: "text.secondary"}}>
                        {num}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2, bgcolor: "background.paper" }}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    label="Difficulty"
                    sx={{
                        bgcolor: "background.paper",
                        color: "text.secondary",
                        "& .MuiSelect-icon": {
                          color: "text.secondary",
                        },
                      }}
                    >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num} sx={{color: "text.secondary"}}>
                        {num}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                    <Checkbox
                        checked={isPublic}
                        onChange={(e) => setPublic(e.target.checked)}
                        sx={{
                        color: "background.paper",
                        "&.Mui-checked": {
                            color: "primary.main",
                        },
                        }}
                    />
                    }
                    label="Make Lobby Public"
                    sx={{ mb: 2 }}
                />

                <Button variant="contained" color="primary" onClick={createLobby} disabled={localStorage.getItem("isReconnect") === "true"}>
                    Start
                </Button>
            </Box>
            
            {
            //Footer
            }
            <Box sx={{ bgcolor: "#1e293b", mt: 5, py: 3, textAlign: "center" }}>
                <Grid container justifyContent="center" spacing={4}>
                    {[
                        { title: "About", links: ["Our Story", "Team", "Careers"] },
                        { title: "Support", links: ["FAQ", "Contact", "Help Center"] },
                        { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
                        { title: "Connect", links: ["Twitter", "Discord", "Reddit"] }
                    ].map((section, index) => (
                        <Grid item key={index}>
                            <Typography variant="h6" color="warning.main">{section.title}</Typography>
                            {section.links.map((link, i) => (
                                <Typography key={i} variant="body2" sx={{ mt: 1 }}>{link}</Typography>
                            ))}
                        </Grid>
                    ))}
                </Grid>
                <Typography variant="body2" sx={{ mt: 2 }}>© 2025 Study Studio. All rights reserved.</Typography>
            </Box>
        </Box>
    );
}

export default HostPage;