import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);

    const loginAccount = async () => {
        try {
            setLoginError(""); // Reset Success Message
            /* Check Formatting */
            if (!username || !password) {
                throw new Error("Ensure all fields are filled and valid typing.");
            }

            /* Attempt Login */
            const userData = {
                username : username,
                password : password
            };
            const response = await fetch("https://coding-crazy.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData), // send data in json package
            });
            
            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }
            
            /* Login Success */
            const data = await response.json();
            console.log(`Great Success!\nUsername: ${data.username}\nPassword: ${data.password}\nID: ${data._id}`);
            
            localStorage.setItem("username", data.username);    // Store username in local storage
            window.dispatchEvent(new Event("storage")); // Let event handler know that local storage has been modified
            
            setIsLoggedIn(true);    // Block log in page for user who is already logged in

        } catch (error) {
            console.error("Error logging into account:", error);
            setLoginError(`Account Login Failed.\n${error}`);
        }
    };

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh" }}>
            { isLoggedIn ? (
                <Box textAlign="center" py={5}>
                    <h1>You are signed in.</h1>
                    <Button component={Link} to="/">Return to Home Page</Button>
                </Box>
            ) : (
                <Box>
                    {/* Input Section */}
                    <Box textAlign="center" py={5}>
                        {/* Potential pitfall with re-redner on each keystroke: https://react.dev/reference/react-dom/components/input#usage*/}
                        <Box>
                            <label>
                                Username: <input value={username} placeholder="Input Username Here" onChange={event => setUsername(event.target.value)} />
                            </label>
                        </Box>
                        <Box>
                            <label>
                                Password: <input value ={password} placeholder="Input Password Here" onChange={event => setPassword(event.target.value)} />
                            </label>
                        </Box>
                    </Box>

                    {/* Confirmation Section */}
                    <Box textAlign="center" py={5}>
                        <h3>Your Username: {username}</h3>
                        <h3>Your Password: {password}</h3>
                        <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={
                            () => loginAccount()}>Submit Login Info</Button>
                        <h2>{loginError || ""}</h2> {/* Display success message */}
                    </Box>
                </Box>
            )}

            {/* Footer */}
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

export default LoginPage;