import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface LinkedPlatform {
    id: number;
    name: string;
}

interface Playlist {
    id: number;
    name: string;
    platform: string;
}

interface UserData {
    email: string;
    linkedPlatforms: LinkedPlatform[];
    playlists: Playlist[];
    recentTransfers: { from: string; to: string; date: string }[];
}

const mockData: UserData = {
    email: "user@example.com",
    linkedPlatforms: [
        { id: 1, name: "Spotify" },
        { id: 2, name: "YouTube Music" },
    ],
    playlists: [
        { id: 1, name: "Top Hits", platform: "Spotify" },
        { id: 2, name: "Lo-Fi Chill", platform: "YouTube Music" },
    ],
    recentTransfers: [
        { from: "Spotify", to: "YouTube Music", date: "2025-04-18" },
        { from: "YouTube Music", to: "TXT", date: "2025-04-17" },
    ],
};

export default function MyAccount() {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        setUser(mockData); // înlocuiește cu fetch/axios către backend
    }, []);

    if (!user) return null;

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", py: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                Contul meu
            </Typography>

            <Grid container spacing={4}>
                {/* Secțiunea de profil */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                        <Box textAlign="center">
                            <Avatar sx={{ width: 100, height: 100, mx: "auto", mb: 2 }} />
                            <Typography variant="h6">{user.email}</Typography>
                            <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                                Schimbă parola
                            </Button>
                            <Button variant="text" color="error" sx={{ mt: 1 }}>
                                Deconectează-te
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                {/* Secțiunea principală */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Platforme conectate
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {user.linkedPlatforms.map((p) => (
                                <Chip key={p.id} label={p.name} color="primary" />
                            ))}
                        </Box>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Playlisturi salvate
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {user.playlists.map((pl) => (
                            <Typography key={pl.id}>
                                🎧 {pl.name} — <strong>{pl.platform}</strong>
                            </Typography>
                        ))}
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Ultimele transferuri
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {user.recentTransfers.map((t, idx) => (
                            <Typography key={idx}>
                                🔁 {t.from} → {t.to} — {new Date(t.date).toLocaleDateString()}
                            </Typography>
                        ))}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
