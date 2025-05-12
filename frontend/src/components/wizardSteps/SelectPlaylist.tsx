import { Box, Card, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PlatformKey } from "../../constants";
import { platformData } from "../../constants";
import { SpotifyService } from "../../services/spotifyService"
import { useState, useEffect } from "react";

interface SelectPlaylistProps {
    sourcePlatform: PlatformKey;
    selectedPlaylist: any | null;
    onChange: (value: PlatformKey) => void;
}

const SelectPlaylist: React.FC<SelectPlaylistProps> = ({ sourcePlatform, selectedPlaylist, onChange }) => {
    const theme = useTheme();
    const [userData, setUserData] = useState<{ spotify_user_id: string, spotify_display_name: string } | null>(null);
    const [playlists, setPlaylists] = useState<any>();
    const [shownImages, setShownImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchUser = async () => {
            const data = await SpotifyService.getUser();
            if (data) setUserData(data);
        };

        const fetchPlaylists = async () => {
            const playlists = await SpotifyService.getUserPlaylists();
            console.log(playlists);
            setPlaylists(playlists);
        }

        fetchUser();
        fetchPlaylists();
    }, []);

    const toggleImage = (id: string) => {
        setShownImages(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    return (
        <>
            <Typography>
                {platformData[sourcePlatform].name}
            </Typography>
            <div>
                {userData ? (
                    <Typography>
                        {userData.spotify_display_name}
                    </Typography>
                ) : (
                    <Typography>Loading user data...</Typography>
                )}
            </div>
            <Box textAlign="center">
                <Typography variant="h6" mb={3}>Selectează playlistul de transferat</Typography>
            </Box>
            <div>
                {playlists ?
                    (
                        playlists.map((playlist: any) => (
                            <Card
                                key={playlist.id}
                                onClick={() => onChange(playlist)}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    cursor: "pointer",
                                    backgroundColor: selectedPlaylist && playlist.id === selectedPlaylist.id
                                        ? theme.palette.action.selected
                                        : theme.palette.background.paper,
                                    border: selectedPlaylist && playlist.id === selectedPlaylist.id
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : "1px solid #ccc",
                                    transition: "background-color 0.3s, border 0.3s"
                                }}
                            >
                                <Typography variant="h6">{playlist.name}</Typography>
                                <Typography variant="body2">{playlist.description}</Typography>
                                <Typography variant="body2">Number of tracks: {playlist.tracks.length}</Typography>
                                <Button onClick={(e) => { e.stopPropagation(); toggleImage(playlist.id); }}>
                                    {shownImages.has(playlist.id) ? "Less info" : "More info"}
                                </Button>
                                {shownImages.has(playlist.id) && (
                                    <>
                                        <Typography variant="body2">First three tracks:</Typography>
                                        <Typography variant="body2">{playlist.tracks[0].track.artists[0].name + " - " + playlist.tracks[0].track.name}</Typography>
                                        <Typography variant="body2">{playlist.tracks[1].track.artists[0].name + " - " + playlist.tracks[1].track.name}</Typography>
                                        <Typography variant="body2">{playlist.tracks[2].track.artists[0].name + " - " + playlist.tracks[2].track.name}</Typography>
                                        <img src={playlist.images[0]?.url} alt="Playlist cover" style={{ width: "20%", height: "auto" }} />
                                    </>
                                )}
                            </Card>
                        ))
                    )
                    : (
                        < Typography > Loading playlists...</Typography>
                    )
                }
            </div >
        </>
    )
};

export default SelectPlaylist;