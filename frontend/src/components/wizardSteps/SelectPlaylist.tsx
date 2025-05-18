import { Box, Card, Typography, Button } from "@mui/material";
import LoadingIndicator from "../LoadingIndicator";
import { useTheme } from "@mui/material/styles";
import { PlatformKey } from "../../constants";
import { platformData } from "../../constants";
import { useState, useEffect } from "react";
import { PlaylistFetcher, UserFetcher } from "../../services/fetchers";
import { TrackUI } from "@shared/types";
import { Playlist } from "@shared/types";

interface SelectPlaylistProps {
    onChange: (value: Playlist) => void;
}

const SelectPlaylist: React.FC<SelectPlaylistProps> = ({ onChange }) => {
    const theme = useTheme();
    const sourcePlatform = JSON.parse(localStorage.getItem("transferData") || "{}").sourcePlatform as PlatformKey;
    const [userData, setUserData] = useState<{ spotify_user_id: string, spotify_display_name: string } | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [shownImages, setShownImages] = useState<Set<string>>(new Set());
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

    useEffect(() => {
        if (!sourcePlatform) return;

        const fetch = async () => {
            const fetchUser = UserFetcher[sourcePlatform];
            const fetchPlaylists = PlaylistFetcher[sourcePlatform];

            const user = await fetchUser?.();
            const playlistData = await fetchPlaylists?.();

            console.log("User data:", user);
            console.log("Playlist data:", playlistData);

            setUserData(user);
            setPlaylists(playlistData || []);
        };

        fetch();
    }, [sourcePlatform]);

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
                    <LoadingIndicator text="Se încarcă utilizatorul..." />
                )}
            </div>
            <Box textAlign="center">
                <Typography variant="h6" mb={3}>Selectează playlistul de transferat</Typography>
            </Box>
            <div>
                {playlists ?
                    (
                        playlists.map((playlist: Playlist) => (
                            <Card
                                key={playlist.id}
                                onClick={() => [onChange(playlist), setSelectedPlaylist(playlist)]}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    cursor: "pointer",
                                    backgroundColor: selectedPlaylist && playlist.id === selectedPlaylist?.id
                                        ? theme.palette.action.selected
                                        : theme.palette.background.paper,
                                    border: selectedPlaylist && playlist.id === selectedPlaylist?.id
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : "1px solid #ccc",
                                    transition: "background-color 0.3s, border 0.3s"
                                }}
                            >
                                <Typography variant="h6">{playlist.name}</Typography>
                                <Typography variant="body2">Number of tracks: {playlist.tracks.length}</Typography>
                                <Button onClick={(e) => { e.stopPropagation(); toggleImage(playlist.id); }}>
                                    {shownImages.has(playlist.id) ? "Less info" : "More info"}
                                </Button>
                                {shownImages.has(playlist.id) && (
                                    <>
                                        <Typography variant="body2">First five tracks:</Typography>
                                        {playlist.tracks.slice(0, 5).map((trackItem: TrackUI, index: number) => (
                                            <Typography key={index} variant="body2">
                                                {`${trackItem.artistsNames[0] !== "" ? trackItem.artistsNames.join(", ") + " - " : ""}${trackItem.name}`}
                                            </Typography>
                                        ))}
                                        <img src={playlist.imageUrl} alt="Playlist cover" style={{ width: "20%", height: "auto" }} />
                                    </>
                                )}
                            </Card>
                        ))
                    )
                    : (
                        <LoadingIndicator text="Se încarcă playlisturile..." />
                    )
                }
            </div >
        </>
    )
};

export default SelectPlaylist;