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
    ListItemText
} from '@mui/material';

import { TrackUI, PlatformKey, Mapping } from '../../../shared/types';
import { SpotifyService } from '../services/spotifyService';
import { YoutubeService } from '../services/youtubeService';

interface Props {
    open: boolean;
    onClose: (chosenMapping: Mapping) => void;
    initialMapping: Mapping;
}

export default function MatchManualDialog({ open, onClose, initialMapping }: Props) {
    const [query, setQuery] = useState(initialMapping.sourceTrack.name);
    const [results, setResults] = useState<(TrackUI)[]>([]);
    const [destinationPlatform, setDestinationPlatform] = useState<PlatformKey>('youtube');
    const [mapping, setMapping] = useState<Mapping>(initialMapping);

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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
                    <List sx={{ width: '100%' }}>
                        {results.map((track) => (
                            <ListItem
                                key={track.id}
                                onClick={() => setMapping({ ...mapping, destinationTrack: track })}
                            >
                                <ListItemText
                                    primary={track.name}
                                    secondary={track.artists.join(', ')}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(mapping)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
