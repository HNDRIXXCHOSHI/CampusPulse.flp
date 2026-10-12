import { createTheme } from "@mui/material/styles";

export const campusPulseTheme = createTheme({
  palette: {
    primary: { main: "#17466b", contrastText: "#ffffff" },
    secondary: { main: "#f39a45", contrastText: "#12233b" },
    warning: { main: "#f39a45", contrastText: "#12233b" },
    error: { main: "#f85151" },
    background: { default: "var(--cp-bg)", paper: "var(--cp-card)" },
    text: { primary: "var(--cp-text)", secondary: "var(--cp-muted)" },
    divider: "var(--cp-border)",
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-1.8px" },
    h2: { fontWeight: 700, letterSpacing: "-.5px" },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { styleOverrides: { root: { border: "1px solid var(--cp-border)" } } },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});
