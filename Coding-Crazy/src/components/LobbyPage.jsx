import { Box, Button, Typography, Grid, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { io } from "socket.io-client";
import SelectionMenu from "../components/SelectionMenu";

const socket = io("http://localhost:5000");

function LobbyPage() {
    const { accessCode } = useParams();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState(null);
    const [counter, setCounter] = useState(10);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [canJoin, setCanJoin] = useState(false);
    const navigate = useNavigate();
    
    const usernameRef = useRef("");

    useEffect(() => {
        initUsername(); // Initialize username variable
    },[]);

    /*
        Is there potential redundancy here?
        I removed the username input box to instead work with the local storage variable.
        Now username is checked on page load, and if they are a guest (i.e., don't have a username in storage) a random username is generated.
        Also, I am unfamiliar with useRef(), so I avoided it for now :p
    */
    
    useEffect(() => {
        usernameRef.current = username;
    }, [username]);

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

        socket.on("start_game", () => {
            navigate(`/game`, {state: {"name": usernameRef.current}});
        });

        socket.on("countdown_update", (count) => {
            setCounter(count);
        })

        return () => {
            socket.off("lobby_users"); // Cleanup on unmount
            socket.off("lobby_full");
            socket.off("lobby_not_found");
            socket.off("lobby_good");
            socket.off("start_game");
            socket.off("countdown_update");
        };
    }, []);

    const joinLobby = () => {
        if (username.trim()) {
            console.log(username);
            socket.emit("join_lobby", {accessCode, username});
            sessionStorage.setItem("roomCode", accessCode);
        }
    };

    const initUsername = async () => {
        try {
            if(sessionStorage.getItem("username")) {  // If user account exists, load into lobby
                setUsername(
                    sessionStorage.getItem("username")
                    .trim()
                );
            } else {    // If user account does not exist, create random guest name
                const rand = 1 + (Math.random() * 5000);  // Generate random floating-point number between 1 - 5000 (inclusive)
                const guestUser = "guest_".concat(
                    rand.toString()
                );  // Create user guest id
                setUsername(guestUser.trim());
            }
        } catch (error) {
            console.error("Initializing user failed: ", error);
        }
    };

    const fetchCollection = async (subject) => {
        if(subject === "") { throw new Error("TEMP ERROR"); }
        fetch(`http://localhost:5000/collection/${subject}`)
        .then(setCanJoin(true)) // User can now join the lobby
        .catch((error) => console.error("Loading collection failed: ", error))
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
                    {/*<Typography variant="h4">Enter Your Name</Typography>
                    <TextField
                        variant="outlined"
                        placeholder="Your Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mt: 2, bgcolor: "white" , input:{ color: "black"}}}
                    />*/}
                    <h2>Selected Subject: {selectedSubject || "None"}</h2>
                    <SelectionMenu onSelect={(value) => {
                        console.log("App selected subject: ", value);
                        setSelectedSubject(value);
                    }} />
                    <Button variant="contained" color="primary" sx={{ mx: 1 }} disabled={!selectedSubject} onClick={ () => {
                        fetchCollection(selectedSubject)
                    }}>Load Study Set</Button> {/* On button click, fetch the specified collection */}

                    <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!canJoin} onClick={joinLobby}>
                        Join Lobby
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h4">Lobby: {accessCode}</Typography>
                    <Typography variant="h6">Players:</Typography>
                    <ul>
                        {users.map((user, index) => (
                            <li key={index}>{user}</li>
                        ))}
                    </ul>

                    <Box>
                        <Typography variant="h6">Countdown: {counter}</Typography>
                    </Box>
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