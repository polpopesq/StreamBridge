import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Container, Button } from "@mui/material";
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import MoonIcon from "../assets/icons/dark/MoonIcon.png";
import DarkLogo from "../assets/icons/dark/DarkLogo.png";
import SunIcon from "../assets/icons/light/SunIcon.png";
import LightLogo from "../assets/icons/light/LightLogo.png";
import { navbarPages, loggedNavbarPages, adminNavbarPages } from "../constants";
import { useAuth } from "../services/AuthContext";
import { BACKEND_URL } from "../constants";
import { getUser } from "../services/authService";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { loggedIn, setLoggedIn } = useAuth();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [pagesToDisplay, setPagesToDisplay] = useState<string[]>([]);

  useEffect(() => {
    if (!loggedIn) {
      setPagesToDisplay(navbarPages);
      return;
    }
    const setAdminPages = async () => {
      const user = await getUser();
      setPagesToDisplay(user.isAdmin ? adminNavbarPages : loggedNavbarPages);
    }
    setAdminPages()
  }, [loggedIn])

  const navigate = useNavigate();

  const confirmLogoutHandler = async () => {
    setLoggedIn(false);
    localStorage.removeItem("loggedIn");

    await fetch(`${BACKEND_URL}/auth/logout`, {
      credentials: "include",
    });

    setOpenConfirmDialog(false);

    navigate("/login");
  }

  const handleNavButtonClick = async (page: string) => {
    if (page === "logout") {
      setOpenConfirmDialog(true);
    }
    else {
      navigate(`/${page}`);
    }
  }

  return (
    pagesToDisplay &&
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
              {pagesToDisplay.map((page) => (
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
      <ConfirmDialog
        open={openConfirmDialog}
        title="Logout"
        description="Esti sigur ca vrei sa te deloghezi?"
        onCancel={() => setOpenConfirmDialog(false)}
        onConfirm={async () => { await confirmLogoutHandler() }}
      />
    </>
  );
};

export default Navbar;
