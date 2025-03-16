import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#d48166" },
        secondary: { main: "#e6e2dd" },
        background: { default: "#373a36", paper: "#2c2f2c" },
        text: { primary: "#e6e2dd", secondary: "#b0aba5" },
    },
    typography: {
        fontFamily: "'Inter', 'Poppins', sans-serif",
    },
});

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#d48166" },
        secondary: { main: "#373a36" },
        background: { default: "#e6e2dd", paper: "#ffffff" },
        text: { primary: "#373a36", secondary: "#5c5c5c" },
    },
    typography: {
        fontFamily: "'Inter', 'Poppins', sans-serif",
    },
});
