// src/styles/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0B57D0" },
    secondary: { main: "#00A896" },
    error: { main: "#ff3b30" },
    warning: { main: "#ff9f43" },
    background: { default: "#f6f8fb", paper: "#ffffff" },
    text: { primary: "#0F172A" },
  },
  typography: {
    fontFamily: ["Inter", "Roboto", "Helvetica", "Arial", "sans-serif"].join(
      ","
    ),
    h1: { fontSize: "1.5rem", fontWeight: 700 },
    h2: { fontSize: "1.25rem", fontWeight: 600 },
    body1: { fontSize: "0.95rem" },
  },
  components: {
    MuiCard: { defaultProps: { elevation: 2 } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
