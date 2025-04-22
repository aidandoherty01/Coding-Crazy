import { Box, Container, Typography, useTheme } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
        backgroundSize: "200% 200%",
        animation: "footerShift 10s ease infinite",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        "@keyframes footerShift": {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      }}
    >
      <Container>

        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} Study Studio. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;