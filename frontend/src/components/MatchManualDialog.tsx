import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemButton
} from '@mui/material';

import { TrackUI, PlatformKey, Mapping } from '../../../shared/types';
import { SpotifyService } from '../services/spotifyService';
import { YoutubeService } from '../services/youtubeService';

interface Props {
    open: boolean;
    onClose: (chosenMapping: Mapping | null) => void;
    initialMapping: Mapping;
}

export default function MatchManualDialog({ open, onClose, initialMapping }: Props) {
    const [query, setQuery] = useState(initialMapping.sourceTrack.name);
    const [results, setResults] = useState<(TrackUI)[]>([]);
    const [destinationPlatform, setDestinationPlatform] = useState<PlatformKey>('youtube');
    const [mapping, setMapping] = useState<Mapping>(initialMapping);
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

    useEffect(() => {
        const transferData = localStorage.getItem("transferData");
        if (transferData) {
            const { destinationPlatform } = JSON.parse(transferData);
            setDestinationPlatform(destinationPlatform);
        }
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) return;
            const results = destinationPlatform === 'youtube'
                ? await YoutubeService.searchYoutubeTracks(query)
                : await SpotifyService.searchSpotifyTracks(query);
            setResults(results);
        };

        fetchResults();
    }, [query, destinationPlatform]);

    return (
        <Dialog open={open} onClose={() => onClose(mapping)} fullWidth maxWidth="sm">
            <DialogTitle>Select match manually</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1} alignItems="center">
                    <TextField
                        label="Search"
                        fullWidth
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={{ width: '70%' }}
                    />
                    {results.map((track, index) => (
                        <ListItem key={track.id || `${track.name}-${index}`} disablePadding>
                            <ListItemButton
                                selected={selectedTrackId === track.id}
                                onClick={() => {
                                    setSelectedTrackId(track.id);
                                    setMapping({ ...mapping, destinationTrack: track });
                                }}
                            >
                                <ListItemText
                                    primary={track.name}
                                    secondary={Array.isArray(track.artists) ? track.artists.join(", ") : "Unknown artist"}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(null)}>Cancel</Button>
                <Button
                    variant="contained"
                    disabled={!selectedTrackId}
                    onClick={() => onClose(mapping)}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
