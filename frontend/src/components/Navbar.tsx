import React from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import MoonIcon from "../assets/icons/dark/MoonIcon.png";
import DarkLogo from "../assets/icons/dark/Logo-dark.png";
import FullDarkLogo from "../assets/icons/dark/FullDarkLogo.png";
import SunIcon from "../assets/icons/light/SunIcon.png";
import LightLogo from "../assets/icons/light/LightLogo.png";
import FullLightLogo from "../assets/icons/light/FullLightLogo.png";


interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <img
          src={darkMode ? FullDarkLogo : FullLightLogo}
          alt="StreamBridge Logo"
          style={{ height: 100 }}
        />
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          color="inherit"
          sx={{
            "&:focus": {
              outline: "none",
            },
            "&:focus-visible": {
              outline: "none",
            },
          }}
        >
          <img
            src={darkMode ? MoonIcon : SunIcon}
            alt="theme icon"
            style={{ width: 30, height: 30 }}
          />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
