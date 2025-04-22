import {
  Box, Button, Typography, Grid, Card, CardContent,
  Container, TextField
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

function AccountPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);
    const [successMessage, setSuccessMessage] = useState("");
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");
    const [errorMessage, seterrorMessage] = useState("");

    const updateAccount = async () => {
        try {
            /* Saftey Checks */
            seterrorMessage("");
            setSuccessMessage("");
            if (localStorage.getItem("roomCode")) {
                throw new Error("Account is associated with a game. Finish the session first.");
            }
            if (!isLoggedIn) {
                throw new Error("User is not logged in.");
            }
            if (!updatedUsername && !updatedPassword) { // XOR
                throw new Error("Please provide a new username or password.");
            }

            /* Select Target */
            let target = "";
            let value = "";
            if (updatedUsername) {
                target = "username";
                value = updatedUsername;
            }
            else {
                target = "password";
                value = updatedPassword;
            }

            /* Attempt Update */
            const username = localStorage.getItem("username");
            console.log(`Target: ${target}, Key: ${username}, Value: ${value}`);
            const response = await fetch("https://coding-crazy.onrender.com/update/Accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "target" : target,
                    "key" : username,
                    "value" : value,
                }),
            });

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }

            /* On Success */
            if (target == "username") { // Check if username was updated
                console.log("Updating username in local storage.");
                localStorage.setItem("username", value);
                window.dispatchEvent(new Event("storage"));
            } else {
                console.log("whhhhhattata");
            }

            setSuccessMessage(response.message);

        } catch (error) {
            console.error("Error updating account:", error);
            seterrorMessage(error.message);
        }
    };

    const deleteAccount = async () => {
        try {
            /* Saftey Checks */
            if (localStorage.getItem("roomCode")) {
                throw new Error("Account is associated with a game. Finish the session first.");
            }
            if (!isLoggedIn) {
                throw new Error("User is not logged in.");
            }

            /* Attempt Delete */
            const username = localStorage.getItem("username");
            const response = await fetch("https://coding-crazy.onrender.com/remove/Accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: [username] }),
            });

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }

            localStorage.clear();   // Remove stored credentials
            window.dispatchEvent(new Event("storage"));
            setIsLoggedIn(false);

        } catch (error) {
            console.error("Account deletion failed:", error);
        }
    };

return (
    <Box sx={{
        bgcolor: "#0f172a",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
    }}>
        <Container maxWidth="sm" sx={{ py: 8 }}>
            { isLoggedIn ? (
                <Card sx={{ bgcolor: "#1e293b", borderRadius: 3, color: "white", p: 4 }}>
                    <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>Update Account</Typography>

                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="New Username"
                            variant="filled"
                            value={updatedUsername}
                            onChange={(e) => setUpdatedUsername(e.target.value)}
                            InputProps={{ sx: { bgcolor: "#334155", color: "white" }, inputProps: { maxLength: 25 } }}
                            InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            variant="filled"
                            value={updatedPassword}
                            onChange={(e) => setUpdatedPassword(e.target.value)}
                            InputProps={{ sx: { bgcolor: "#334155", color: "white" }, inputProps: { maxLength: 25 } }}
                            InputLabelProps={{ sx: { color: "#cbd5e1" } }}
                        />
                    </Box>

                    { errorMessage && (
                        <Typography variant="body2" color="error" mt={2}>{errorMessage}</Typography>
                    )}

                    { successMessage && (
                        <Typography variant="body2" color="success" mt={2}>{successMessage}</Typography>
                    )}

                    <Box textAlign="center" mt={4}>
                        <Button variant="contained" color="primary" onClick={updateAccount}>Update Account</Button>
                    </Box>

                    <Box textAlign="center" mt={2}>
                        <Button variant="outlined" color="error" onClick={deleteAccount}>Delete Account</Button>
                    </Box>
                    </CardContent>
                </Card>
            ) : (
                <Box textAlign="center">
                    <Typography variant="h5" gutterBottom>{"You are not logged into an account."}</Typography>
                    <Button variant="outlined" color="secondary" component={Link} to="/">Return to Home</Button>
                </Box>
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

export default AccountPage;