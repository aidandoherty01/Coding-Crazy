import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";
import { useEffect, useState } from "react";

function SignupPage() {
    /* IMPLEMENT EMAIL CHECKING TO PREVENT ACCOUNT CREATION SPAM */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState("");

    const signupAccount = async () => {
        try {
            setSuccess(""); // Reset Success Message
            /* Check Formatting */
            if (!username || !password) {
                throw new Error("Ensure all fields are filled and valid typing.");
            }

            /* Attempt Signup */
            const userData = [{
                username : username,
                password : password
            }]; // create json array for user data

            const response = await fetch("http://localhost:5000/send/Accounts", {
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
            localStorage.setItem("username", data.username);
            console.log(`Local Storage: ${localStorage.getItem("username")}`);
            setSuccess("Account Successfully Created.");    // Update success message
        
        } catch (error) {
            console.error("Error creating account:", error);
            setSuccess(`Account Creation Failed. ${error}`);
        }
    };

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh" }}>
            {/* Input Section */}
            <Box textAlign="center" py={5}>
                {/* Potential pitfall with re-redner on each keystroke: https://react.dev/reference/react-dom/components/input#usage*/}
                <div>
                    <label>
                        Username: <input value={username} placeholder="Input Username Here" onChange={event => setUsername(event.target.value)} />
                    </label>
                </div>
                <div>
                    <label>
                        Password: <input value ={password} placeholder="Input Password Here" onChange={event => setPassword(event.target.value)} />
                    </label>
                </div>
            </Box>

            {/* Confirmation Section */}
            <Box textAlign="center" py={5}>
                <h3>Your Username: {username}</h3>
                <h3>Your Paswword: {password}</h3>
                <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={
                    () => signupAccount()}>Submit Signup Info</Button>
                <h2>{success || ""}</h2> {/* Display success message */}
            </Box>

            {/* Reference Formatting */}
            <Box textAlign="center" py={5}>
                <Typography variant="h3" color="primary">TEMP TITLE</Typography>
                <Typography variant="subtitle1">Temp text.</Typography>
                <Box mt={3}>
                    <Button variant="contained" color="secondary" sx={{ mx: 1 }}>temp button</Button>
                </Box>
            </Box>

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

export default SignupPage;