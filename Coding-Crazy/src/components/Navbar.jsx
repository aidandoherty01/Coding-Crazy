import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setDrawerOpen(open);
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <AppBar position="static" sx={{ backgroundColor: "#1f2937", paddingX: 2 }}>
                <Toolbar>
                    {/* Mobile Menu Icon */}
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        aria-label="menu" 
                        onClick={toggleDrawer(true)} 
                        sx={{ display: { xs: "block", sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Title */}
                    <Typography variant="h6" component="div">
                        Study Party
                    </Typography>

                    {/* Flex Container for Button Groups */}
                    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "space-between", alignItems: "center", ml: 3 }}>
                        {/* Desktop Navigation Links */}
                        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
                            <Button color="inherit" component={Link} to="/">🏠 Home</Button>
                            <Button color="inherit" component={Link} to="/game">🎮 Play Game</Button>
                            <Button color="inherit" component={Link} to="/study">Study Sets</Button>
                            <Button color="inherit" component={Link} to="/setupGame">Setup Game</Button>
                        </Box>
                        {/* Log In & Sign Up Buttons (Desktop) */}
                        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
                            <Button color="inherit" variant="outlined" component={Link} to="/login">Log In</Button>
                            <Button color="success" variant="contained" component={Link} to="/signup">Sign Up</Button>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer Menu */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List sx={{ width: 250 }}>
                    <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
                        <ListItemText primary="🏠 Home" />
                    </ListItem>
                    <ListItem button component={Link} to="/game" onClick={toggleDrawer(false)}>
                        <ListItemText primary="🎮 Play Game" />
                    </ListItem>
                    <ListItem button component={Link} to="/login" onClick={toggleDrawer(false)}>
                        <ListItemText primary="🔑 Log In" />
                    </ListItem>
                    <ListItem button component={Link} to="/signup" onClick={toggleDrawer(false)}>
                        <ListItemText primary="📝 Sign Up" />
                    </ListItem>
                </List>
            </Drawer>
        </>
    );
}

export default Navbar;
