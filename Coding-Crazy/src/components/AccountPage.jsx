import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";
import { useEffect, useState } from "react";
import SelectionMenu from "./SelectionMenu";
import DynamicTable from "./DynamicTable";
import { Link } from "react-router-dom";

function AccountPage() {
    const [selectedSubject, setSelectedSubject] = useState("");
    const [collection, setCollection] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);
    const [successMessage, setSuccessMessage] = useState("");

    const fetchCollection = async (subject) => {
        if(subject === "") { throw new Error("TEMP ERROR"); }
        fetch(`https://coding-crazy.onrender.com/collection/${subject}`)
        .then((res) => res.json())
        .then((data) => setCollection(data))
        .then(() => console.log(collection))
        .catch((error) => console.error("Loading collection failed: ", error))
    };

    const deleteAccount = async () => {
        try {
            console.log("In deleteAccount()");
            
            /* Saftey Checks */
            if(localStorage.getItem("roomCode")) { throw new Error("Account is associated with a game. Please finish game session before attempting account delete."); }
            const username = localStorage.getItem("username");
            if(username == null) { throw new Error("User is not logged in."); }

            /* Formatting Data */
            const userData = {
                username : [ username ]
            };

            /* Attempting Delete */
            const response = await fetch("https://coding-crazy.onrender.com/remove/Accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`${response.status} - ${response.statusText}`);
            }

            /* Deletion Success */
            console.log(`${username} has been deleted`);

            localStorage.clear();
            window.dispatchEvent(new Event("storage"));

            setSuccessMessage("Account Successfully Deleted.");
            setIsLoggedIn(false);

        } catch(error) {
            console.error("Account deletion failed: ", error);
        }
    }

    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh" }}>
        { isLoggedIn ? (
            <Box>
                {/* Account Information */}
                <Box textAlign={"center"} py={5}>
                    <Typography>Username: {localStorage.getItem("username")}</Typography>
                </Box>
                {/* Account Deletion */}
                <Box textAlign={"center"} py={5}>
                    <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={deleteAccount}>Delete Account</Button>
                </Box>

                {/* Data Section */}
                <Box textAlign="center" py={5}>
                    <h2>Selected Subject: {selectedSubject || "None"}</h2>
                    <SelectionMenu onSelect={(value) => {   {/* For cleaner syntax, can be reduced to onSelect={setSelectedSubject} */}
                        console.log("App selected subject: ", value);
                        setSelectedSubject(value);
                    }} />
                    <Button variant="contained" color="primary" sx={{ mx: 1 }} onClick={ () => {
                        fetchCollection(selectedSubject);
                    }
                    }>Load Study Set</Button> {/* On button click, fetch the specified collection */}
                </Box>

                <Box>
                    <DynamicTable collection={collection} />    {/* Create a table based off the current collection/subject */}
                </Box>
            </Box>
        ) : (
            <Box textAlign="center" py={5}>
                <Typography>{ successMessage || "You are not logged into an account." }</Typography>
                <Button component={Link} to="/">Return to Home</Button>
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

export default AccountPage;