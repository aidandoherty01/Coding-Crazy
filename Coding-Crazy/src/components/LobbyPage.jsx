import { Box, Button, Typography, Grid, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function LobbyPage() {
    const { accessCode } = useParams();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState(null);
    

    useEffect(() => {
        // Listen for updates when users join or leave
        socket.on("lobby_users", (updatedUsers) => {
            setUsers(updatedUsers);
        });

        socket.on("lobby_full", (message) => {
            setError(message);  // Set the error message if the lobby is full
            setJoined(false);  // Make sure joined is false
          });

        socket.on("lobby_not_found", (message) => {
            setError(message);  // Set the error message if the lobby is not found
            setJoined(false);  // Make sure joined is false
        });

        socket.on("lobby_good", (message) => {
            setJoined(true);
        });

        return () => {
            socket.off("lobby_users"); // Cleanup on unmount
            socket.off("lobby_full");
            socket.off("lobby_not_found");
            socket.off("lobby_good");
        };
    }, []);

    const joinLobby = () => {
        if (username.trim()) {
            console.log(username);
            socket.emit("join_lobby", {accessCode, username});
        }
    };

    const leaveLobby = () => {
        if (joined) {
            socket.emit("leave_lobby", accessCode);
            setJoined(false);
        }
    };

    useEffect(() => {
        // Flag to check if leaveLobby was called
        let isCleanup = false;
    
        const handleBeforeUnload = () => {
            if (!isCleanup) {
                leaveLobby();
                isCleanup = true; // Mark as cleanup done
            }
        };
    
        // Add beforeunload listener to handle page close/refresh
        window.addEventListener("beforeunload", handleBeforeUnload);
    
        return () => {
            // Clean up: Only call leaveLobby if it hasn't been called already
            if (!isCleanup) {
                leaveLobby();
            }
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [joined]);

    return (
        <Box>
            {!joined ? (
                <Box>
                    <Typography variant="h4">Enter Your Name</Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Your Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mt: 2, bgcolor: "white" , input:{ color: "black"}}}
                    />
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={joinLobby}>
                        Join Lobby
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h4">Lobby: {accessCode}</Typography>
                    <Typography variant="h6">Players:</Typography>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user.name}</li>
                        ))}
                    </ul>
                </Box>
            )}
            
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

export default LobbyPage;