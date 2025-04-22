import { Box, Button, Typography, Grid, TextField, Card, CardContent, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);

    const navigate = useNavigate();
    
    useEffect(() => {
        checkRedirect();
    });

    const checkRedirect = async () => {
        if(localStorage.getItem("username")) { navigate("/account"); }  // only navigate if the user is logged in
    }

    const loginAccount = async () => {
        try {
            /* Saftey Checks */
            setLoginError("");
            if (!username || !password) {
                throw new Error("Ensure all fields are filled and valid typing.");
            }

            /* Attempt Login */
            const response = await fetch("https://coding-crazy.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password }),   // Formatting data
            });

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }

            /* Login Success */
            localStorage.setItem("username", username);    // Store username to perisist across components
            window.dispatchEvent(new Event("storage")); // Update navbar
            
            setIsLoggedIn(true);    // Block log in page to users who have already logged in
            checkRedirect();    // Redirect to account page
        
        } catch (error) {
            console.error("Error logging into account:", error);
            setLoginError(`Account Login Failed.\nPlease ensure your Username and Password are correct.`);
        }
    };

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Container maxWidth="sm" sx={{ py: 8 }}>
                {isLoggedIn ? (
                    <Box textAlign="center">
                        <Typography variant="h4">You are signed in. Redirecting...</Typography>
                        <Button variant="outlined" color="secondary" component={Link} to="/" sx={{ mt: 3 }}>Return to Home</Button>
                    </Box>
                ) : (
                    <Card sx={{ bgcolor: "#1e293b", borderRadius: 3, color: "white", p: 4 }}>
                        <CardContent>
                            <Typography variant="h4" align="center" gutterBottom>Log In</Typography>
                            <Box mt={3}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    variant="filled"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{ sx: { bgcolor: "#334155", color: "white" }, inputProps: { maxLength: 25 } }}
                                    InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                                    sx={{ mb: 3 }}
                                />

                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Password"
                                    variant="filled"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputProps={{ sx: { bgcolor: "#334155", color: "white" }, inputProps: { maxLength: 25 } }}
                                    InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                                />
                            </Box>
                            {loginError && (
                                <Typography variant="body2" color="error" mt={2}>{loginError}</Typography>
                            )}
                            <Box textAlign="center" mt={4}>
                                <Button variant="contained" color="primary" onClick={loginAccount}>Submit</Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Container>

            {/* Footer */}
            <Footer />
        </Box>
    );
}

export default LoginPage;
