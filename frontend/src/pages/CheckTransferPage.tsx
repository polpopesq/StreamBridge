import { Container, Typography } from '@mui/material';
import SongMappingList from '../components/SongMappingList';

export interface SpotifyTrack {
    id: string;
    name: string;
    description?: string;
}

export interface YoutubeTrack {
    id: string;
    name: string;
    description?: string;
}

export interface SpotifyYoutubeMap {
    track: SpotifyTrack;
    result: YoutubeTrack | null;
}

// Exemplu de date mock
const mockData: SpotifyYoutubeMap[] = [
    {
        track: { id: '1', name: 'Song A', description: 'Spotify song A' },
        result: { id: 'a', name: 'YouTube A', description: 'Matched with YouTube A' },
    },
    {
        track: { id: '2', name: 'Song B', description: 'Spotify song B' },
        result: null,
    },
];

export default function CheckTransferPage() {
    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Check Transfer Page
            </Typography>
            <SongMappingList mappings={mockData} />
        </Container>
    );
}
