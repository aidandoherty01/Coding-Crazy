import { Box, Button, Typography, Grid, Card, CardContent, Container, TextField } from "@mui/material";
import React, { useEffect, useState, useRef} from "react";
import {useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import SelectionMenu from "../components/SelectionMenu";
import DynamicTable from "../components/DynamicTable";
const socket = io("https://coding-crazy.onrender.com");

function LobbyPage() {
    const { accessCode } = useParams();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState(null);
    const [counter, setCounter] = useState(10);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [collection, setCollection] = useState([]);
    const [canJoin, setCanJoin] = useState(false);
    
    const navigate = useNavigate();

    const isReconnect = localStorage.getItem("isReconnect") === "true";
  
    const usernameRef = useRef("");

    /* 

        IMPLEMENT ACTUALLY LEAVING A LOBBY.
        Have a button to leave the lobby (if joined).
        - set isReconnect to false.
        - destroy the lobby if the last user.
        - remove roomCode.

    */

    useEffect(() => {
        initUser(); // Initialize username variable
    },[]);

    useEffect(() => {
        usernameRef.current = username;
    }, [username]);

    useEffect(() => {
        // Listen for updates when users join or leave
        socket.on("lobby_users", (updatedUsers) => {
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
        });

        socket.on("start_game", () => {
            console.log("Navigating to game page.");
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

    const joinLobby = (roomCode, user) => {
        try {
            console.log(`Attempting to Join Lobby.\nUser: ${user}\nRoom Code: ${roomCode}`);

            socket.emit("join_lobby", {
                "accessCode" : roomCode,
                "username" : user
            });

            localStorage.setItem("roomCode", roomCode);

        } catch (error) {
            console.error("Joining Lobby Failed.", error);
        }
    };

    const initUser = async () => {
        try {
            let user = "";
            /* Store Username */
            if(localStorage.getItem("username")) {  // If user account exists, store active username
                console.log("1");
                user = localStorage.getItem("username").trim();
                setUsername(user);
            } else if (isReconnect && localStorage.getItem("guest")) {  // If guest user is reconnecting
                console.log("2");
                user = localStorage.getItem("guest");
                setUsername(user);
            } else {    // If user account does not exist, create randomized guest name
                console.log("3");
                const rand = 1 + (Math.random() * 5000);  // Generate random floating-point number between 1 - 5000 (inclusive)
                const randInt = Math.floor(rand);   // Convert floating-point to int
                user = "guest_".concat(randInt.toString());  // Create user guest id
                setUsername(user);
                localStorage.setItem("guest", user);    // Store guest name for reconnects
            }

            /* Attempt Reconnect */
            if(isReconnect) { joinLobby(accessCode, user); }    // Reconnect user to lobby if disconnected

        } catch (error) {
            console.error("Initializing user failed:", error);
        }
    };

    const fetchCollection = async (subject) => {
        if(subject === "") { throw new Error("TEMP ERROR"); }
        fetch(`https://coding-crazy.onrender.com/collection/${subject}`)
        .then((res) => res.json())
        .then((data) => setCollection(data))
        .then(setCanJoin(true)) // User can now join the lobby
        .catch((error) => console.error("Loading collection failed: ", error))
    };

    const leaveLobby = () => {
        if (joined) {
            socket.emit("leave_lobby", accessCode);
            localStorage.removeItem("roomCode");
            localStorage.setItem("isReconnect", "false");
            window.dispatchEvent(new Event("reconnect"));
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
                    <h2>Selected Subject: {selectedSubject || "None"}</h2>
                    <SelectionMenu onSelect={(value) => {
                        console.log("App selected subject: ", value);
                        setSelectedSubject(value);
                    }} />
                    <Button variant="contained" color="primary" sx={{ mx: 1 }} disabled={!selectedSubject} onClick={ () => {
                        fetchCollection(selectedSubject)
                    }}>Load Study Set</Button> {/* On button click, fetch the specified collection */}

                    <Button variant="contained" color="primary" sx={{ mt: 2 }} disabled={!canJoin} onClick={() => { joinLobby(accessCode, username); }}>
                        Join Lobby
                    </Button>

                    <Box>
                        <DynamicTable collection={collection} />
                    </Box>

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