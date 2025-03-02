import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText } from "@mui/material";
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
            <AppBar 
                position="static"
                sx={{ backgroundColor: "#1f2937" }}
            >
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Study Party
                    </Typography>

                    {/* Navigation Links */}
                    <Button color="inherit" component={Link} to="/" sx={{ display: { xs: "none", sm: "block" } }}>
                        🏠 Home
                    </Button>
                    <Button color="inherit" component={Link} to="/game" sx={{ display: { xs: "none", sm: "block" } }}>
                        🎮 Play Game
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Mobile Menu */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <List sx={{ width: 250 }}>
                    <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
                        <ListItemText primary="🏠 Home" />
                    </ListItem>
                    <ListItem button component={Link} to="/game" onClick={toggleDrawer(false)}>
                        <ListItemText primary="🎮 Play Game" />
                    </ListItem>
                </List>
            </Drawer>
        </>
    );
}

export default Navbar;
