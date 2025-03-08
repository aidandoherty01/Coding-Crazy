import { Box, Button, Typography, Grid, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom";
import SelectionMenu from "./SelectionMenu";

function LobbyPage() {
    const { accessCode } = useParams();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);

    const fetchUsers = async () => {
        const response = await fetch(`http://localhost:5000/lobby/${accessCode}`);
        const data = await response.json();
        setUsers(data);
    };

    useEffect(() => {
        const interval = setInterval(fetchUsers, 3000); //3 Seconds
        return () => clearInterval(interval);
    }, [accessCode]);

    const joinLobby = async () => {
        if (username.trim()) {
            const response = await fetch("http://localhost:5000/join-lobby", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessCode, username }),
            });
            const data = await response.json();
            setUsers(data);
            setJoined(true);
        }
    };

    const leaveLobby = async () => {
        if (username.trim()) {
            const response = await fetch("http://localhost:5000/leave-lobby", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessCode, username }),
            });
            const data = await response.json();
            setUsers(data);
            setJoined(false);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (joined) {
                leaveLobby(); // Call leaveLobby function when the page is being unloaded
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup on component unmount
        return () => {
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