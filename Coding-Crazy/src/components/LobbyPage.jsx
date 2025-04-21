import {
    Box,
    Button,
    Typography,
    Grid,
    Card,
    CardContent,
    Container,
    Paper,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import SelectionMenu from "../components/SelectionMenu";
import DynamicTable from "../components/DynamicTable";

const socket = io("https://coding-crazy.onrender.com");

function LobbyPage() {
    const { accessCode } = useParams();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");

    const isReconnect = localStorage.getItem("isReconnect") === "true";
    const [joined, setJoined] = useState(isReconnect);

    const [error, setError] = useState(null);
    const [counter, setCounter] = useState(10);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [collection, setCollection] = useState([]);
    const [canJoin, setCanJoin] = useState(false);

    const navigate = useNavigate();
    const usernameRef = useRef("");

    useEffect(() => {
        initUser(); // Initialize user
    }, []);

    useEffect(() => {
        usernameRef.current = username;
    }, [username]);

    useEffect(() => {
        socket.on("lobby_users", (updatedUsers) => {    // Listen for updates when users join or leave
            console.log(`lobby users: ${updatedUsers}`);
            setUsers(updatedUsers);
        });

        socket.on("lobby_full", (message) => {
            console.log(message);
            setError(message);  // Set the error message if the lobby is full
        });

        socket.on("lobby_not_found", (message) => {
            console.log(message);
            setError(message);  // Set the error message if the lobby is not found
        });

        socket.on("lobby_good", (message) => {
            console.log(message);
            setJoined(true);
            localStorage.setItem("isReconnect", "true");    // Allows user to reconnect if they disconnected after successfully connecting
        });

        socket.on("start_game", () => {
            console.log("Navigating to game page.");
            navigate(`/game`, { state: { "name": usernameRef.current } });
        });

        socket.on("countdown_update", (count) => {
            setCounter(count);
        });

        return () => {
            /* Cleanup on unmount */
            socket.off("lobby_users");
            socket.off("lobby_full");
            socket.off("lobby_not_found");
            socket.off("lobby_good");
            socket.off("start_game");
            socket.off("countdown_update");
        };
    }, []);

    const joinLobby = (user) => {
        try {
            console.log(`Attempting to Join Lobby.\nUser: ${user}\nRoom Code: ${accessCode}`);

            socket.emit("join_lobby", {
                "accessCode": accessCode,
                "username": user
            });

            localStorage.setItem("roomCode", accessCode);   // On success, update user's affiliated room code

        } catch (error) {
            console.error("Joining Lobby Failed.", error);
        }
    };

    const initUser = async () => {
        try {
            console.log(`In initUser. isReconnect: ${isReconnect}`);
            let user = "";
            /* Store Username */
            if (localStorage.getItem("username")) {
                user = localStorage.getItem("username").trim();
                setUsername(user);
            } else if (isReconnect && localStorage.getItem("guest")) {
                user = localStorage.getItem("guest");
                setUsername(user);
            } else {
                const rand = 1 + (Math.random() * 5000);
                const randInt = Math.floor(rand);
                user = "guest_".concat(randInt.toString());
                setUsername(user);
                localStorage.setItem("guest", user);
            }

            /* Attempt Reconnect */
            if (isReconnect) { joinLobby(user); }

        } catch (error) {
            console.error("Initializing user failed:", error);
        }
    };

    const fetchCollection = async (subject) => {
        if (subject === "") { throw new Error("TEMP ERROR"); }
        fetch(`https://coding-crazy.onrender.com/collection/${subject}`)
            .then((res) => res.json())
            .then((data) => setCollection(data))
            .then(setCanJoin(true)) // User can now join the lobby
            .catch((error) => console.error("Loading collection failed: ", error));
    };

    const leaveLobby = () => {
        if (joined) {
            /* Clear stored user information from session */
            console.log("Attempting to leave lobby.");
            
            socket.emit("leave_lobby", {
                "accessCode": accessCode,
                "username": username
            });
            
            localStorage.removeItem("roomCode");
            localStorage.setItem("isReconnect", "false");
            window.dispatchEvent(new Event("reconnect"));
            
            setJoined(false);
            navigate(`/`);  // Return user to home page after disconnecting
        }
    };

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Container maxWidth="md" sx={{ py: 6 }}>
                {!joined ? (
                    <Card sx={{ bgcolor: "#1e293b", p: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" align="center" gutterBottom>Lobby Setup</Typography>
                            <Typography variant="h6" mt={2}>Selected Subject: {selectedSubject || "None"}</Typography>

                            <Box mt={2}>
                                <SelectionMenu onSelect={(value) => {
                                    console.log("App selected subject: ", value);
                                    setSelectedSubject(value);
                                }} />
                            </Box>

                            <Box mt={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => {
                                        fetchCollection(selectedSubject);
                                    }}
                                    disabled={!selectedSubject}
                                    sx={{ mb: 2 }}
                                >
                                    Load Study Set
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={() => { joinLobby(username); }}
                                    disabled={!canJoin}
                                >
                                    Join Lobby
                                </Button>
                            </Box>

                            <Box mt={4}>
                                <DynamicTable collection={collection} />
                            </Box>

                            {error && (
                                <Typography variant="body2" color="error" sx={{ mt: 3 }}>{error}</Typography>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card sx={{ bgcolor: "#1e293b", p: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" align="center">Lobby: {accessCode}</Typography>
                            <Typography variant="h6" sx={{ mt: 2 }}>Players:</Typography>

                            <Paper elevation={1} sx={{ bgcolor: "#334155", mt: 1 }}>
                                <List dense>
                                    {users.map((user, index) => (
                                        <ListItem key={index}>
                                            <ListItemText primary={user} sx={{ color: "white" }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            <Typography variant="h6" sx={{ mt: 3 }}>Countdown: {counter}</Typography>

                            {/* Potential Bug with leaving lobby during countdown? */}
                            <Box textAlign="center" mt={4}>
                                <Button variant="outlined" color="error" onClick={() => { leaveLobby(); }}>
                                    Leave Lobby
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Container>

            {/* Footer */}
            <Box sx={{ bgcolor: "#1e293b", py: 3, textAlign: "center" }}>
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