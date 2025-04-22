import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";
import { useState } from "react";
import SelectionMenu from "./SelectionMenu";
import DynamicTable from "./DynamicTable";
import { Link } from "react-router-dom";

function AccountPage() {
    const [selectedSubject, setSelectedSubject] = useState("");
    const [collection, setCollection] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchCollection = async (subject) => {
        /* Saftey Check */
        if (!subject) {
            console.error("Subject not selected.");
            return;
        }

        /* Attempt Subject Fetch */
        try {
            const res = await fetch(`https://coding-crazy.onrender.com/collection/${subject}`);
            const data = await res.json();
            setCollection(data);    // Store response for displaying in DynamicTable
            localStorage.setItem("subject", subject);
        } catch (error) {
            console.error("Loading collection failed:", error);
        }
    };

    const deleteAccount = async () => {
        try {
            /* Saftey Checks */
            if (localStorage.getItem("roomCode")) {
                throw new Error("Account is associated with a game. Please finish game session before attempting account delete.");
            }

            const username = localStorage.getItem("username");
            if (!username) {
                throw new Error("User is not logged in.");
            }

            /* Attempt Account Removal */
            const response = await fetch("https://coding-crazy.onrender.com/remove/Accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: [username] }), // Formatting data
            });

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }

            /* On Success */
            localStorage.clear();   // Remove any stored credentials
            window.dispatchEvent(new Event("storage"));

            setSuccessMessage("Account Successfully Deleted.");
            setIsLoggedIn(false);   // Update page state

        } catch (error) {
            console.error("Account deletion failed:", error);
        }
    };

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Container maxWidth="md" sx={{ py: 8 }}>
                {isLoggedIn ? (
                    <Card sx={{ bgcolor: "#1e293b", p: 4, borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h4" align="center" gutterBottom>Welcome to Your Dashboard</Typography>

                            {/* Account Actions */}
                            <Box textAlign="center" mt={4}>
                                <Button variant="contained" color="error" onClick={deleteAccount}>Delete Account</Button>
                            </Box>

                            {/* Subject Selection */}
                            <Box textAlign="center" mt={5}>
                                <Typography variant="h6">Selected Subject: {selectedSubject || "None"}</Typography>
                                <Box mt={2}>
                                    <SelectionMenu onSelect={(value) => {
                                        console.log("Selected subject: ", value);
                                        setSelectedSubject(value);
                                    }} />
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3 }}
                                    onClick={() => fetchCollection(selectedSubject)}
                                >
                                    Load Study Set
                                </Button>
                            </Box>

                            {/* Dynamic Table */}
                            <Box mt={5}>
                                <DynamicTable collection={collection} />
                            </Box>
                        </CardContent>
                    </Card>
                ) : (
                    <Box textAlign="center">
                        <Typography variant="h5" gutterBottom>{successMessage || "You are not logged into an account."}</Typography>
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
