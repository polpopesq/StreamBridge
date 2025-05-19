import { Box, Typography, useTheme } from "@mui/material";
import { useEffect } from "react";
import type { TransferData } from "./TransferWizard";
import LoadingIndicator from "../components/LoadingIndicator";
import { transferPlaylist } from "../services/transferService";

const LoadingScreen = () => {
    const theme = useTheme();
    const transferData = JSON.parse(localStorage.getItem("transferData") || "") as TransferData;

    useEffect(() => {
        document.body.classList.add(theme.palette.mode === "dark" ? "theme-dark" : "theme-light");
        return () => document.body.classList.remove("theme-dark", "theme-light");
    }, [theme.palette.mode]);

    useEffect(() => {
        const transfer = async () => {
            if (!transferData) {
                console.error("Transfer data is missing");
                return;
            }

            const { sourcePlatform, destinationPlatform, selectedPlaylist } = transferData;

            if (!sourcePlatform || !destinationPlatform || !selectedPlaylist) {
                console.error("Transfer data is incomplete");
                return;
            }

            try {
                console.log("Transfer started with data:", transferData);
                await transferPlaylist(sourcePlatform, destinationPlatform, selectedPlaylist.id);
            } catch (error) {
                console.error("Error during transfer:", error);
            }
        }
        transfer();
        console.log("Transfer started");
        return;
    }, [])

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