import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("username") != null);
    const [reconnectMessage, setReconnectMessage] = useState("");

  /* Event handlers for logging in or reconnecting */
  useEffect(() => {
    const checkLoginStatus = () => {
        console.log("Login event received.");
        setIsLoggedIn(localStorage.getItem("username") != null);
        setUsername(localStorage.getItem("username"));
    };

    const checkReconnectStatus = () => {
      console.log("Reconnect event received.");

      const flag = localStorage.getItem("isReconnect") === "true";
      if (flag) {
        setReconnectMessage("Reconnect");
      } else {
        setReconnectMessage("");
      }

      console.log(`isReconnect: ${flag}`);
      console.log(`Reconnect Message: ${reconnectMessage}`);
    };

    window.addEventListener("storage", checkLoginStatus); // Update Navbar if user is currently logged into an account
    window.addEventListener("reconnect", checkReconnectStatus); // Update Navbar if user is currently in game

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("reconnect", checkReconnectStatus);
    };
  }, []);

  /* Toggle Drawer for smaller screens */
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  /* Signout the active user */
  const signOut = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    console.log(`Signed out: ${localStorage.getItem("username")}`);
  };

  const linkStyles = {
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    border: "2px solid rgba(255,255,255,0.7)",
    borderRadius: 999,
    px: 2,
    py: 0.5,
    transition: "all 0.3s",
    "&:hover": {
      background: theme.palette.secondary.main,
      borderColor: theme.palette.secondary.main,
      boxShadow: `0 0 8px ${theme.palette.secondary.main}`,
    },
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          boxShadow: `0 4px 20px ${theme.palette.primary.main}66`,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "block", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#fff",
              textShadow: `0 0 8px ${theme.palette.secondary.main}`,
              textDecoration: "none",
            }}
          >
            Study Studio
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Links */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            <Button component={Link} to="/" sx={linkStyles}>
              🏠 Home
            </Button>
            <Button component={Link} to="/setupGame" sx={linkStyles}>
              🎮 {reconnectMessage || "Setup Game"}
            </Button>
            <Button
              component={Link}
              to="/account"
              sx={linkStyles}
              disabled={!isLoggedIn}
            >
              👤 Account
            </Button>
            <Button component={Link} to="/findLobby" sx={linkStyles}>
              🔍 Find Game
            </Button>
          </Box>

          {/* Auth Buttons */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, ml: 2, gap: 1 }}>
            {!isLoggedIn ? (
              <>
                <Button component={Link} to="/login" sx={linkStyles}>
                  Log In
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  sx={{
                    ...linkStyles,
                    background: theme.palette.secondary.main,
                    border: "2px solid rgba(255,255,255,0.7)",
                    color: "#fff",
                    "&:hover": {
                      background: theme.palette.primary.main,
                      boxShadow: `0 0 8px ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ color: "#fff", alignSelf: "center" }}>
                  Hi, {username}
                </Typography>
                <Button
                  onClick={signOut}
                  component={Link}
                  to="/"
                  sx={linkStyles}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 240 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List
            sx={{
              p: 1,
              "& .MuiListItemButton-root:hover": {
                backgroundColor: theme.palette.secondary.main,
                color: "#000",
              },
            }}
          >
            {[
              { text: "🏠 Home", to: "/" },
              { text: "🎮 Play Game", to: "/game" },
              { text: "🔑 Log In", to: "/login" },
              { text: "📝 Sign Up", to: "/signup" },
            ].map(({ text, to }) => (
              <ListItem button component={Link} to={to} key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;
