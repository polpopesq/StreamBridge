import { Box, Typography, Button, useTheme } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const SuccessScreen = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add(theme.palette.mode === "dark" ? "theme-dark" : "theme-light");
        return () => document.body.classList.remove("theme-dark", "theme-light");
    }, [theme.palette.mode]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
            gap={3}
        >
            <Box display="flex" gap={1}>
                {[0, 1, 2].map((i) => (
                    <MusicNoteIcon
                        key={i}
                        sx={{
                            fontSize: 40,
                            animation: `${bounce} 1s ease-in-out ${i * 0.2}s infinite`,
                            color: theme.palette.primary.main,
                        }}
                    />
                ))}
            </Box>

            <Typography variant="h4" fontWeight="bold">
                Playlist transferred successfully!
            </Typography>

            <Typography variant="body1">
                All your favorite tracks are now available on the new platform 🎶
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
                sx={{ mt: 2 }}
            >
                Return Home
            </Button>
        </Box>
    );
};

export default SuccessScreen;
