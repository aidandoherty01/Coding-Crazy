import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";
// import React, { useEffect, useState } from "react";
import SelectionMenu from "../components/SelectionMenu";

function StudyPage() {
    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh" }}>
            {/* Data Section */}
            <Box textAlign="center" py={5}>
                <h2>Choose Something</h2>
                <SelectionMenu />
            </Box>

            {/* Hero Section */}
            <Box textAlign="center" py={5}>
                <Typography variant="h3" color="primary">TEMP TITLE</Typography>
                <Typography variant="subtitle1">Temp text.</Typography>
                <Box mt={3}>
                    <Button variant="contained" color="secondary" sx={{ mx: 1 }}>Load Study Set</Button>
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

export default StudyPage;