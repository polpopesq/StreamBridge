import { List } from '@mui/material';
import { SpotifyYoutubeMap } from '../pages/CheckTransferPage';
import SongMappingItem from './SongMappingItem';

interface Props {
    mappings: SpotifyYoutubeMap[];
}

export default function SongMappingList({ mappings }: Props) {
    return (
        <List>
            {mappings.map((map, index) => (
                <SongMappingItem key={index} mapping={map} />
            ))}
        </List>
    );
}
