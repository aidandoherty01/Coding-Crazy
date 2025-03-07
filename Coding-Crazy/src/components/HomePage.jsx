import { Box, Button, Typography, Grid, Card, CardContent, Container } from "@mui/material";

function HomePage() {
    return (
        <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100vh" }}>

            {/* Hero Section */}
            <Box textAlign="center" py={5}>
                <Typography variant="h3" color="primary">Welcome to Study Studio</Typography>
                <Typography variant="subtitle1">
                    Strengthen your learning while experiencing the ultimate gaming adventure.
                </Typography>
                <Box mt={3}>
                    <Button variant="contained" color="secondary" sx={{ mx: 1 }}>Start as Guest</Button>
                    <Button variant="contained" color="success" sx={{ mx: 1 }}>Sign Up</Button>
                    <Button variant="contained" color="primary" sx={{ mx: 1 }}>Log In</Button>
                </Box>
            </Box>

            {/* Game Screenshot Section */}
            <Container>
                <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
                    <Box
                        sx={{ width: "80%", height: 200, bgcolor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}
                    >
                        <Typography variant="h6">Screenshot 1</Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center" mt={2}>
                        {["Shot 2", "Shot 3", "Shot 4"].map((text, index) => (
                            <Grid item key={index}>
                                <Box
                                    sx={{ width: 100, height: 80, bgcolor: "#475569", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1 }}
                                >
                                    <Typography variant="body2">{text}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Featured Content Section */}
            <Box mt={5} px={3}>
                <Grid container spacing={3} justifyContent="center">
                    {[
                        { title: "Latest Updates", desc: "Check out our newest features and improvements!" },
                        { title: "Community", desc: "Join our growing community of gamers!" },
                        { title: "Leaderboards", desc: "Compete with players worldwide!" }
                    ].map((item, index) => (
                        <Grid item key={index}>
                            <Card sx={{ width: 250, bgcolor: "#1e293b", color: "white", borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{item.title}</Typography>
                                    <Typography variant="body2">{item.desc}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
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

export default HomePage;
