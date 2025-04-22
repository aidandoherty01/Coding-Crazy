import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Container,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

function FindLobbyPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("public");
  const [privateCode, setPrivateCode] = useState("");
  const [publicLobbies, setPublicLobbies] = useState([]);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchLobbies = async (offset) => {
    try {
      const res = await fetch(
        `https://coding-crazy.onrender.com/public_lobbies?offset=${offset}&limit=${limit}`
      );
      const data = await res.json();
      setPublicLobbies(data);
    } catch (err) {
      console.error("Failed to load public lobbies", err);
    }
  };

  useEffect(() => {
    fetchLobbies(offset);
  }, [offset]);

  function joinLobby(roomCode) {
    navigate(`/lobby/${roomCode}`, { state: roomCode });
  }

  const attemptJoin = async () => {
    const code = privateCode.trim();
    if (!code) return;
    try {
      const response = await fetch(
        `https://coding-crazy.onrender.com/getSession?roomCode=${encodeURIComponent(
          code
        )}`
      );
      if (response.ok) joinLobby(code);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  // gradient button style
  const gradientBtn = {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: "#fff",
    textTransform: "none",
    px: 3,
    boxShadow: theme.shadows[2],
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      opacity: 0.9,
    },
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
        py: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="md">
        {/* Tabs */}
        <Box
          sx={{
            display: "flex",
            border: `2px solid ${theme.palette.grey[700]}`,
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Button
            onClick={() => setSelectedTab("public")}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              color:
                selectedTab === "public"
                  ? theme.palette.common.white
                  : theme.palette.grey[400],
              background:
                selectedTab === "public"
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : "transparent",
              "&:hover": {
                background:
                  selectedTab === "public"
                    ? undefined
                    : theme.palette.grey[800],
              },
            }}
          >
            Public
          </Button>
          <Button
            onClick={() => setSelectedTab("private")}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              color:
                selectedTab === "private"
                  ? theme.palette.common.white
                  : theme.palette.grey[400],
              background:
                selectedTab === "private"
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : "transparent",
              "&:hover": {
                background:
                  selectedTab === "private"
                    ? undefined
                    : theme.palette.grey[800],
              },
            }}
          >
            Private
          </Button>
        </Box>

        {/* Public vs Private */}
        {selectedTab === "public" ? (
          publicLobbies.length ? (
            <List>
              {publicLobbies.map((lobby) => (
                <Grid item xs={12} key={lobby.roomCode}>
                  <Card
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      bgcolor: "#1e293b",
                      color: "white",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="warning.main">
                        Room Code: {lobby.roomCode}
                      </Typography>
                      <Typography variant="body2">
                        Players:{" "}
                        {lobby.players ? Object.keys(lobby.players).length : 0}{" "}
                        / {lobby.maxPlayers ?? "?"}
                      </Typography>
                      <Typography variant="body2">
                        Total Turns: {lobby.numTurns ?? "?"}
                      </Typography>
                    </CardContent>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => joinLobby(lobby.roomCode)}
                    >
                      Join Lobby
                    </Button>
                  </Card>
                </Grid>
              ))}
            </List>
          ) : (
            <Typography align="center">Loading...</Typography>
          )
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              label="Room Code"
              variant="filled"
              value={privateCode}
              onChange={(e) => setPrivateCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptJoin()}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                input: { color: "#fff" },
                svg: { color: "#fff" },
                width: 240,
              }}
            />
            <Button onClick={attemptJoin} sx={gradientBtn}>
              Join
            </Button>
          </Box>
        )}
      </Container>
      <Box sx={{ flexGrow: 1 }} />

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default FindLobbyPage;
