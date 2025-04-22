import {
  Box,
  Button,
  Checkbox,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

function HostPage() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [difficulty, setDifficulty] = useState(5);
  const [isPublic, setPublic] = useState(false);
  const [numTurns, setNumTurns] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    checkReconnect();
  }, []);

  /* Create game lobby */
  const createLobby = async () => {
    /* Create session in database */
    const response = await fetch(
      "https://coding-crazy.onrender.com/create_lobby",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numPlayers, difficulty, isPublic, numTurns }), // Formatting data
      }
    );

    if (!response.ok) {
      console.log("Lobby creation failed:", response);
      return;
    }

    /* On Success */
    const data = await response.json();
    navigate(`/lobby/${data}`, { state: data }); // Navigate to lobby with roomCode (data)
  };

  /* Check if player needs to be reconnected to active game */
  const checkReconnect = async () => {
    /* Check if lobby is still active */
    const roomCode = localStorage.getItem("roomCode");
    const response = await fetch(
      `https://coding-crazy.onrender.com/getSession?roomCode=${encodeURIComponent(
        roomCode
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // If lobby no longer exists
      localStorage.removeItem("roomCode");
      localStorage.setItem("isReconnect", "false");
      window.dispatchEvent(new Event("reconnect"));
    } else {
      // If lobby still exists
      localStorage.setItem("isReconnect", "true");
      window.dispatchEvent(new Event("reconnect"));
      navigate(`/lobby/${roomCode}`);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#0f172a",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ bgcolor: "#1e293b", borderRadius: 3, p: 4 }}>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Host a Game Lobby
            </Typography>

            {/* Number of Players */}
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel sx={{ color: "#cbd5e1" }}>
                Number of Players
              </InputLabel>
              <Select
                value={numPlayers}
                onChange={(e) => setNumPlayers(e.target.value)}
                variant="filled"
                sx={{
                  bgcolor: "#334155",
                  color: "white",
                  "& .MuiSelect-icon": { color: "white" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e293b",
                      color: "white",
                    },
                  },
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num} sx={{ color: "#cbd5e1" }}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Number of Turns */}
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel sx={{ color: "#cbd5e1" }}>Number of Turns</InputLabel>
              <Select
                value={numTurns}
                onChange={(e) => setNumTurns(e.target.value)}
                variant="filled"
                sx={{
                  bgcolor: "#334155",
                  color: "white",
                  "& .MuiSelect-icon": { color: "white" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e293b",
                      color: "white",
                    },
                  },
                }}
              >
                {[5, 10, 15, 20, 25].map((num) => (
                  <MenuItem key={num} value={num} sx={{ color: "#cbd5e1" }}>
                    {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Difficulty (optional) */}
            {/* <FormControl fullWidth sx={{ mt: 3 }}>
                            <InputLabel sx={{ color: "#cbd5e1" }}>Difficulty</InputLabel>
                            <Select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                variant="filled"
                                sx={{
                                    bgcolor: "#334155",
                                    color: "white",
                                    "& .MuiSelect-icon": { color: "white" }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: "#1e293b",
                                            color: "white"
                                        }
                                    }
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <MenuItem key={num} value={num} sx={{ color: "#cbd5e1" }}>{num}</MenuItem>
                                ))}
                            </Select>
                        </FormControl> */}

            {/* Public Lobby */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPublic}
                  onChange={(e) => setPublic(e.target.checked)}
                  sx={{
                    color: "white",
                    "&.Mui-checked": {
                      color: "primary.main",
                    },
                  }}
                />
              }
              label="Make Lobby Public"
              sx={{ mt: 3, color: "#cbd5e1" }}
            />

            {/* Start Button */}
            <Box textAlign="center" mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={createLobby}
                disabled={localStorage.getItem("isReconnect") === "true"}
              >
                Start Lobby
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default HostPage;
