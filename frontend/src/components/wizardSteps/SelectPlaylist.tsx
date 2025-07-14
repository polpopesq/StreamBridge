import { Box, Card, Typography, Button, TextField } from "@mui/material";
import LoadingIndicator from "../LoadingIndicator";
import { useTheme } from "@mui/material/styles";
import { platformData } from "../../constants";
import { useState, useEffect } from "react";
import { PlaylistFetcher, UserFetcher } from "../../services/fetchers";
import { TrackUI, Playlist, PlatformKey } from "@shared/types";
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import { SnackbarAlert } from "../SnackbarAlert";
import { BACKEND_URL } from "../../constants";
import { extractSpotifyPlaylistId, extractYouTubePlaylistId, detectPlaylistPlatform } from "../../services/transferService";

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
    const [publicLink, setPublicLink] = useState<string>("");
    const [isPublicTransfer, setIsPublicTransfer] = useState(false);
    const [loadingCheck, setLoadingCheck] = useState(false);
    const [checkSuccess, setCheckSuccess] = useState(false);
    const [activeSnackbar, setActiveSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const verifyPublicPlaylist = async (): Promise<void> => {
        if (!isValidUrl(publicLink)) return;

        if (detectPlaylistPlatform(publicLink) !== sourcePlatform) {
            setSnackbarMessage("Linkul furnizat e de la alta platforma!");
            setActiveSnackbar(true);
            return;
        }

        let playlistId = null;

        if (sourcePlatform === "youtube") {
            playlistId = extractYouTubePlaylistId(publicLink);
        } else {
            playlistId = extractSpotifyPlaylistId(publicLink);
        }

        if (!playlistId) {
            setSnackbarMessage("Link-ul nu contine id!");
            setActiveSnackbar(true);
            return;
        }

        setLoadingCheck(true);
        setCheckSuccess(false);

        try {
            const response = await fetch(`${BACKEND_URL}/${sourcePlatform}/get-playlist?id=${encodeURIComponent(playlistId)}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Playlist not found");

            const playlist: Playlist = await response.json();

            setSelectedPlaylist(playlist);
            onChange(playlist);

            setCheckSuccess(true);
        } catch (error) {
            setCheckSuccess(false);
            setSnackbarMessage("Playlistul nu a fost gasit.")
            setActiveSnackbar(true);
        } finally {
            setLoadingCheck(false);
        }
    };

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

    const isValidUrl = (url: string): boolean => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch (err) {
            return false;
        }
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
            <Box textAlign="center" mb={3}>
                <Button
                    variant={isPublicTransfer ? "outlined" : "contained"}
                    onClick={() => setIsPublicTransfer(false)}
                    sx={{ mr: 1 }}
                >
                    Transferă un playlist propriu
                </Button>
                <Button
                    variant={isPublicTransfer ? "contained" : "outlined"}
                    onClick={() => setIsPublicTransfer(true)}
                >
                    Transferă un playlist public
                </Button>
            </Box>

            {!isPublicTransfer && (<div>
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
                                                {`${trackItem.artists
                                                    && trackItem.artists[0] !== ""
                                                    ? trackItem.artists.join(", ") + " - " : ""}${trackItem.name}`}
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
            </div >)}
            {isPublicTransfer && (
                <Box mt={5} textAlign="center">
                    <Typography variant="body1" gutterBottom>
                        Transferă un playlist public
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                        sx={{
                            border: `2px dashed ${theme.palette.primary.main}`,
                            p: 3,
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                        }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <TextField
                                fullWidth
                                label="Link playlist public"
                                variant="outlined"
                                placeholder="Ex: https://open.spotify.com/playlist/..."
                                value={publicLink}
                                onChange={(e) => {
                                    setPublicLink(e.target.value);
                                    setCheckSuccess(false);
                                }}
                                error={publicLink !== "" && !isValidUrl(publicLink)}
                                helperText={
                                    publicLink !== "" && !isValidUrl(publicLink)
                                        ? "Link invalid. Trebuie să înceapă cu http:// sau https://"
                                        : ""
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        verifyPublicPlaylist();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color={checkSuccess ? "success" : "primary"}
                                onClick={verifyPublicPlaylist}
                                disabled={loadingCheck || !isValidUrl(publicLink)}
                                sx={{ minWidth: 48, padding: 1 }}
                            >
                                {loadingCheck ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : checkSuccess ? (
                                    <CheckIcon />
                                ) : (
                                    "Caută"
                                )}
                            </Button>
                        </Box>
                        {isPublicTransfer && selectedPlaylist && (
                            <Card
                                sx={{
                                    mt: 4,
                                    p: 3,
                                    backgroundColor: theme.palette.background.default,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    {selectedPlaylist.name}
                                </Typography>
                                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                                    <img
                                        src={selectedPlaylist.imageUrl}
                                        alt="Playlist cover"
                                        style={{ width: "40%", height: "auto", borderRadius: 8 }}
                                    />
                                    <Typography variant="body2">
                                        {selectedPlaylist.public ? "Public" : "Privat"} • {selectedPlaylist.tracks.length} piese
                                    </Typography>
                                    <Box width="100%" mt={2}>
                                        <Typography variant="subtitle1">Primele 5 piese:</Typography>
                                        {selectedPlaylist.tracks.slice(0, 5).map((track, index) => (
                                            <Typography key={index} variant="body2">
                                                {track.artists?.length ? track.artists.join(", ") + " - " : ""}
                                                {track.name}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            </Card>
                        )}
                    </Box>
                </Box>
            )}

            <SnackbarAlert message={snackbarMessage} activeSnackbar={activeSnackbar} setActiveSnackbar={setActiveSnackbar} />
        </>
    )
};

export default SelectPlaylist;