import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import { SnackbarAlert } from "../components/SnackbarAlert";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingIndicator from "../components/LoadingIndicator";
import { getUserData } from "../services/profileService";
import { ProfileData } from "@shared/types";
import { BACKEND_URL } from "../constants";
import { useAuth } from "../services/AuthContext";


export default function MyAccount() {
    const [user, setUser] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const { setLoggedIn } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        localStorage.removeItem("loggedIn");
        setLoggedIn(false);
        await fetch(`${BACKEND_URL}/auth/logout`, {
            credentials: "include",
        });
        navigate("/login");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const profile = await getUserData();
            setUser(profile);
            setLoading(false);
        };

        fetchUser();
    }, []);

    if (loading) return <LoadingIndicator text="Se încarcă profilul..." />;
    if (!user) return null;

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", py: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                Contul meu
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                        <Box textAlign="center">
                            <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                            <Typography variant="h6">{user.email}</Typography>

                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                gap={1.5}
                                mt={2}
                            >
                                {user.isAdmin && (
                                    <Chip label="Admin" color="secondary" size="small" />
                                )}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => setSnackbarOpen(true)}
                                >
                                    Schimbă parola
                                </Button>
                                <Button
                                    variant="text"
                                    color="error"
                                    onClick={() => setOpenLogoutDialog(true)}
                                >
                                    Deconectează-te
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Platforme conectate
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                                label="Spotify"
                                color={user.isSpotifyConnected ? "primary" : "default"}
                                variant={user.isSpotifyConnected ? "filled" : "outlined"}
                            />
                            <Chip
                                label="YouTube Music"
                                color={user.isYoutubeConnected ? "primary" : "default"}
                                variant={user.isYoutubeConnected ? "filled" : "outlined"}
                            />
                        </Box>
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Ultimele transferuri
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {user.transfers.map((t, idx) => (
                            <Box key={idx} sx={{ mb: 1 }}>
                                <Typography variant="body2">
                                    🔁 <strong>{t.sourcePlatform}</strong> →{" "}
                                    <strong>{t.destinationPlatform}</strong> —{" "}
                                    {new Date(t.createdAt).toLocaleDateString("ro-RO")} —{" "}
                                    <Chip
                                        label={t.status}
                                        size="small"
                                        color={
                                            t.status === "completed"
                                                ? "success"
                                                : t.status === "failed"
                                                    ? "error"
                                                    : t.status === "processing"
                                                        ? "info"
                                                        : "warning"
                                        }
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                            </Box>
                        ))}
                    </Card>
                </Grid>
            </Grid>

            <SnackbarAlert
                message="Funcționalitate în dezvoltare. Contactați administratorul."
                activeSnackbar={snackbarOpen}
                setActiveSnackbar={setSnackbarOpen}
            />

            <ConfirmDialog
                open={openLogoutDialog}
                title="Logout"
                description="Ești sigur că vrei să te deloghezi?"
                onCancel={() => setOpenLogoutDialog(false)}
                onConfirm={async () => {
                    await handleLogout();
                    setOpenLogoutDialog(false);
                }}
            />
        </Box>
    );
}
