import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MoonIcon from "../assets/icons/dark/MoonIcon.png";
import DarkLogo from "../assets/icons/dark/DarkLogo.png";
//import FullDarkLogo from "../assets/icons/dark/FullDarkLogo.png";
import SunIcon from "../assets/icons/light/SunIcon.png";
import LightLogo from "../assets/icons/light/LightLogo.png";
//import FullLightLogo from "../assets/icons/light/FullLightLogo.png";
import { navbarPages } from "../constants";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {

  const navigate = useNavigate();

  const handleNavButtonClick = (page: string) => {
    navigate(`/${page}`);
  }

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <img
              src={darkMode ? DarkLogo : LightLogo}
              alt="StreamBridge Logo"
              style={{ height: 60, marginRight: 5 }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              onClick={() => { handleNavButtonClick("") }}
              sx={{
                cursor: 'pointer',
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.21rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              streambridge
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navbarPages.map((page) => (
                <Button
                  key={page}
                  onClick={() => { handleNavButtonClick(page) }}
                  sx={{
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                    my: 2,
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>
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
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
