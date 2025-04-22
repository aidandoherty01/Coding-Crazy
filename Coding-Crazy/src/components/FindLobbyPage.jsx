import { Box, Button, Checkbox, Typography, Grid, FormControl, FormControlLabel, InputLabel, List, ListItem, ListItemText, Select, MenuItem, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";


function FindLobbyPage() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("public");
    const [privateCode, setPrivateCode] = useState("");
    const [publicLobbies, setPublicLobbies] = useState([]);
    const [offset, setOffset] = useState(0);
    const limit = 10;

    const fetchLobbies = async (offset) => {
        try {
          const res = await fetch(`https://coding-crazy.onrender.com/public_lobbies?offset=${offset}&limit=${limit}`);
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

    const attemptJoin = async () => {
        if (privateCode.trim()) {
          try{
            const response = await fetch(`https://coding-crazy.onrender.com/getSession?roomCode=${encodeURIComponent(privateCode.trim())}`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json"
              },
            }); // Grabs entire session from DB
            if(response.ok){
              joinLobby(privateCode.trim());
            }
          }catch(err){
            console.log("Error: ", err);
          }
        }
    }

    return (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
            <Button
              variant={selectedTab === "public" ? "contained" : "outlined"}
              onClick={() => setSelectedTab("public")}
            >
              Public
            </Button>
            <Button
              variant={selectedTab === "private" ? "contained" : "outlined"}
              onClick={() => setSelectedTab("private")}
            >
              Private
            </Button>
          </Box>
          {selectedTab === "public" ? (
            publicLobbies.length > 0 ? (
              <Container maxWidth="md">
              <Grid container spacing={2}>
                {publicLobbies.map((lobby) => (
                  <Grid item xs={12} key={lobby.roomCode}>
                    <Card sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, bgcolor: "#1e293b", color: "white" }}>
                      <CardContent>
                        <Typography variant="h6" color="warning.main">
                          Room Code: {lobby.roomCode}
                        </Typography>
                        <Typography variant="body2">
                          Players:  {lobby.players ? Object.keys(lobby.players).length : 0} / {lobby.maxPlayers ?? "?"}
                        </Typography>
                        <Typography variant="body2">
                          Total Turns: {lobby.numTurns ?? "?"}
                        </Typography>
                      </CardContent>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => joinLobby(lobby.roomCode)}
                      >
                        Join Lobby
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
            ) : (
            <Typography variant="h3">Loading...</Typography>
            )
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <TextField
                label="Enter Room Code"
                value={privateCode}
                onChange={(e) => setPrivateCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    joinLobby(privateCode.trim());
                  }
                }}
                sx={{ width: 300 }}
              />
              <Button
              variant="contained"
              onClick={attemptJoin}>Join</Button>
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

export default FindLobbyPage;