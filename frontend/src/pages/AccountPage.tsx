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
    useTheme,
} from "@mui/material";
import ConfirmDialog from "../components/ConfirmDialog";
import LoadingIndicator from "../components/LoadingIndicator";
import { getUserData } from "../services/profileService";
import { ProfileData } from "@shared/types";
import { BACKEND_URL } from "../constants";
import { useAuth } from "../services/AuthContext";

export default function MyAccount() {
    const [user, setUser] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
    const { setLoggedIn } = useAuth();
    const theme = useTheme();
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
        <Box sx={{
            maxWidth: "1200px",
            mx: "auto",
            py: 4,
            px: { xs: 2, sm: 3 },
            minHeight: "calc(100vh - 128px)"
        }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Contul meu
            </Typography>

            <Grid container spacing={4}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            p: 3,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2.5,
                            borderRadius: theme.shape.borderRadius * 2,
                            boxShadow: theme.shadows[2],
                            "&:hover": {
                                boxShadow: theme.shadows[4]
                            }
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                fontSize: "3rem",
                                bgcolor: theme.palette.primary.main
                            }}
                        >
                            {user.email.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{
                            width: "100%",
                            textAlign: "center",
                            overflow: "hidden"
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {user.email}
                            </Typography>
                            {user.isAdmin && (
                                <Chip
                                    label="Admin"
                                    color="secondary"
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>

                        <Box sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            mt: 2
                        }}>
                            <Button
                                variant="contained"
                                fullWidth
                                color="primary"
                                size="medium"
                                onClick={() => navigate("/reset-password")}
                                sx={{
                                    py: 1,
                                    borderRadius: theme.shape.borderRadius
                                }}
                            >
                                Schimbă parola
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                color="error"
                                size="medium"
                                onClick={() => setOpenLogoutDialog(true)}
                                sx={{
                                    py: 1,
                                    borderRadius: theme.shape.borderRadius
                                }}
                            >
                                Deconectează-te
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                {/* Content Section */}
                <Grid item xs={12} md={8}>
                    {/* Connected Platforms */}
                    <Card sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: theme.shape.borderRadius * 2,
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                            boxShadow: theme.shadows[4]
                        }
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Platforme conectate
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center"
                        }}>
                            <Chip
                                label="Spotify"
                                color={user.isSpotifyConnected ? "primary" : "default"}
                                variant={user.isSpotifyConnected ? "filled" : "outlined"}
                                sx={{
                                    px: 1,
                                    ...(user.isSpotifyConnected && {
                                        "& .MuiChip-label": {
                                            color: "white"
                                        }
                                    })
                                }}
                            />
                            <Chip
                                label="YouTube Music"
                                color={user.isYoutubeConnected ? "primary" : "default"}
                                variant={user.isYoutubeConnected ? "filled" : "outlined"}
                                sx={{
                                    px: 1,
                                    ...(user.isYoutubeConnected && {
                                        "& .MuiChip-label": {
                                            color: "white"
                                        }
                                    })
                                }}
                            />
                        </Box>
                    </Card>

                    {/* Recent Transfers */}
                    <Card sx={{
                        p: 3,
                        borderRadius: theme.shape.borderRadius * 2,
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                            boxShadow: theme.shadows[4]
                        }
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            Istoric transferuri
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        {user.transfers.length > 0 ? (
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2
                            }}>
                                {user.transfers.map((t, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            p: 2,
                                            borderRadius: theme.shape.borderRadius,
                                            backgroundColor: idx % 2 === 0 ?
                                                theme.palette.grey[50] : "transparent",
                                            "&:hover": {
                                                backgroundColor: theme.palette.action.hover
                                            }
                                        }}
                                    >
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                                Transfer #{user.transfers.length - idx}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {t.sourcePlatform} → {t.destinationPlatform}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(t.createdAt).toLocaleDateString("ro-RO", {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={t.status === "completed" ? "Finalizat" :
                                                t.status === "failed" ? "Eșuat" :
                                                    t.status === "processing" ? "În curs" : "În așteptare"}
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
                                            sx={{
                                                fontWeight: 500,
                                                minWidth: 100,
                                                justifyContent: "center"
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                py: 4,
                                gap: 2
                            }}>
                                <Typography color="text.secondary">
                                    Nu ai efectuat niciun transfer încă
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate("/transfera")}
                                >
                                    Transferă acum
                                </Button>
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openLogoutDialog}
                title="Deconectare"
                description="Ești sigur că vrei să te deconectezi?"
                onCancel={() => setOpenLogoutDialog(false)}
                onConfirm={async () => {
                    await handleLogout();
                    setOpenLogoutDialog(false);
                }}
            />
        </Box>
    );
}