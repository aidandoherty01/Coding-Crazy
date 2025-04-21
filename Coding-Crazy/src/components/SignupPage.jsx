import { Box, Button, Typography, Grid, TextField, Card, CardContent, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [signUpError, setSignUpError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        checkRedirect();
    });

    const checkRedirect = async () => {
        if(localStorage.getItem("username")) { navigate("/account"); }  // only navigate if the user is logged in
    }
    
    const signupAccount = async () => {
        try {
            setSignUpError(""); // Reset Success Message
            /* Check Formatting */
            if (!username || !password) {
                throw new Error("Ensure all fields are filled and valid typing.");
            }

            /* Attempt Signup */
            const userData = [{
                username : username,
                password : password
            }]; // create json array for user data

            const response = await fetch("https://coding-crazy.onrender.com/send/Accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }
            
            /* Signup Success */
            const temp = await response.json();
            const data = temp[0];   // Data comes back in array form with single element
            console.log(`Great Success!\nUsername: ${data.username}\nPassword: ${data.password}\nID: ${data._id}`);
            
            localStorage.setItem("username", data.username);    // Set username is local storage
            window.dispatchEvent(new Event("storage")); // Let event handler know that local storage has changed
            
            setIsLoggedIn(true);    // Block sign in page from user who is already signed in
            checkRedirect();    // Redirect to account page

        } catch (error) {
            console.error("Error creating account:", error);
            setSignUpError(`Account Creation Failed.\nUsername has already been taken.`);
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
                            <Typography variant="h4" align="center" gutterBottom>Sign Up</Typography>
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
                            {signUpError && (
                                <Typography variant="body2" color="error" mt={2}>{signUpError}</Typography>
                            )}
                            <Box textAlign="center" mt={4}>
                                <Button variant="contained" color="primary" onClick={signupAccount}>Submit</Button>
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

export default SignupPage;