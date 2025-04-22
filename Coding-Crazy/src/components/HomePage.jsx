import React from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const HomePage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      {/* Hero Section with gradient background */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "#fff",
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 900,
            fontFamily: "Montserrat, sans-serif",
            textTransform: "uppercase",
          }}
        >
          Welcome to Study Studio
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, px: { xs: 2, md: 0 } }}>
          Strengthen your learning by playing with friends!
        </Typography>
        <Box>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/signup"
            sx={{ mr: 2, px: 4 }}
          >
            Sign Up
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            component={Link}
            to="/login"
            sx={{ px: 4, borderColor: "rgba(255,255,255,0.7)" }}
          >
            Log In
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: 8,
          // darker, shifting gradient
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.grey[900]} 100%)`,
          backgroundSize: "400% 400%",
          animation: "darkGradientShift 10s ease infinite",
          position: "relative",
          overflow: "hidden",
          "@keyframes darkGradientShift": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
        }}
      >
        <Container>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              WebkitTextFillColor: "white",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 4,
            }}
          >
            Why Study Studio?
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: "🚀",
                title: "Latest Updates",
                desc: "Be the first to try new features.",
              },
              {
                icon: "🤝",
                title: "Community",
                desc: "Connect and compete with peers.",
              },
              {
                icon: "🏆",
                title: "Leaderboards",
                desc: "Climb the ranks globally.",
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    p: 2,
                    background: "rgba(0,0,0,0.2)", // slightly darker card
                    backdropFilter: "blur(8px)",
                    transform: "translateY(20px)",
                    opacity: 0,
                    animation: `cardIn 0.6s ease-out forwards ${idx * 0.2}s`,
                    "@keyframes cardIn": {
                      to: { transform: "translateY(0)", opacity: 1 },
                    },
                    transition: "transform 0.3s",
                    "&:hover": { transform: "translateY(-10px)" },
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{
                        animation: "bounce 1.5s ease infinite",
                        "@keyframes bounce": {
                          "0%,100%": { transform: "translateY(0)" },
                          "50%": { transform: "translateY(-6px)" },
                        },
                      }}
                    >
                      {item.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom color="common.white">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="grey.300">
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default HomePage;
