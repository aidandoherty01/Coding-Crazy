import { Box, Button, Checkbox, Typography, Grid, FormControl, FormControlLabel, InputLabel, List, ListItem, ListItemText, Select, MenuItem, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";


function FindLobbyPage() {
    const navigate = useNavigate();
    const [publicLobbies, setPublicLobbies] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 10;

    const fetchLobbies = async (offset) => {
        try {
          const res = await fetch(`http://localhost:5000/public_lobbies?offset=${offset}&limit=${limit}`);
          const data = await res.json();
          setPublicLobbies(data);
        } catch (err) {
          console.error("Failed to load public lobbies", err);
        }
      };

      useEffect(() => {
        fetchLobbies(offset);
      }, [offset]);

    function joinLobby(roomCode){
        navigate(`/lobby/${roomCode}`, {state: roomCode});
    }

    return (
        <Box>
            {publicLobbies.length > 0 ? (
            <List>
                {publicLobbies.map((lobby) => (
                <ListItem key={lobby.roomCode}>
                    <ListItemText
                    primary={`Room Code: ${lobby.roomCode}`}
                    secondary={`Players: ${lobby.usernames?.length || 0}`}
                    slots={{
                        primary: Typography,
                        secondary: Typography,
                      }}
                      slotProps={{
                        primary: {
                          sx: { color: "text.primary" },
                        },
                        secondary: {
                          sx: { color: "text.primary" },
                        },
                      }}
                    />
                    <Button variant="contained" color="primary" sx={{ mt: 2 }}  onClick={() => {joinLobby(lobby.roomCode)}}>
                        Join Lobby
                    </Button>
                </ListItem>
                ))}
            </List>
            ) : (
            <Typography variant="body1">Loading...</Typography>
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

export default FindLobbyPage;