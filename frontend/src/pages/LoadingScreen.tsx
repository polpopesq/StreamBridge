import { Box, Typography, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import type { TransferData } from "./TransferWizard";
import LoadingIndicator from "../components/LoadingIndicator";

const LoadingScreen = () => {
    const location = useLocation();
    const theme = useTheme();
    const transferData = location.state?.transferData as TransferData;

    useEffect(() => {
        document.body.classList.add(theme.palette.mode === "dark" ? "theme-dark" : "theme-light");
        return () => document.body.classList.remove("theme-dark", "theme-light");
    }, [theme.palette.mode]);

    if (!transferData) return <Typography>Transfer data missing</Typography>;

    return (
        <Box>
            <Typography variant="h4">
                🎵 Transfering playlist <strong>{transferData.selectedPlaylist?.name}</strong> from <strong>{transferData.sourcePlatform}</strong> to <strong>{transferData.destinationPlatform}</strong>
            </Typography>

            <LoadingIndicator text="" />

            <Typography variant="body2">
                Sit back and relax while we migrate your music 🎧
            </Typography>
        </Box>
    );
};

export default LoadingScreen;