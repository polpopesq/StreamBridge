import { Box, Typography, useTheme } from "@mui/material";
import LoadingIndicator from "../components/LoadingIndicator";

const LoadingScreen = () => {
    const theme = useTheme();
    const transferData = JSON.parse(localStorage.getItem("transferData") || "");

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            className={theme.palette.mode === "dark" ? "theme-dark" : "theme-light"}
        >
            <Typography variant="h4" mb={2}>
                🎵 Transferring playlist{" "}
                <strong>{transferData?.selectedPlaylist?.name || "..."}</strong> from{" "}
                <strong>{transferData?.sourcePlatform || "..."}</strong> to{" "}
                <strong>{transferData?.destinationPlatform || "..."}</strong>
            </Typography>

            <LoadingIndicator text="" />

            <Typography variant="body2" mt={2}>
                Sit back and relax while we migrate your music 🎧
            </Typography>
        </Box>
    );
};

export default LoadingScreen;
