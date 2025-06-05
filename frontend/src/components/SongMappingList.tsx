import { List, ListSubheader, Typography, Box, Divider } from '@mui/material';
import SongMappingItem from './SongMappingItem';
import { Mapping, PlatformKey } from '@shared/types';

interface Props {
    mappings: Mapping[],
    onUpdateMapping: (updated: Mapping) => void,
    sourcePlatform: PlatformKey,
    destinationPlatform: PlatformKey,
    removeMapping: (toRemove: Mapping) => void
}

export default function SongMappingList({ mappings, onUpdateMapping, sourcePlatform, destinationPlatform, removeMapping }: Props) {
    return (
        <List
            subheader={
                <ListSubheader>
                    <Box display="flex" justifyContent="space-between" px={2}>
                        <Typography variant="subtitle2" sx={{ flex: 5 }}>
                            {sourcePlatform ? sourcePlatform : "Source platform"}
                        </Typography>
                        <Box sx={{ flex: 2 }} />
                        <Typography variant="subtitle2" sx={{ flex: 4 }}>
                            {destinationPlatform ? destinationPlatform : "Destination platform"}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                    </Box>
                    <Divider />
                </ListSubheader>
            }>
            {mappings.map((mapping) => (
                <SongMappingItem key={mapping.sourceTrack.id} mapping={mapping} onUpdateMapping={onUpdateMapping} handleRemoveMapping={removeMapping} />
            ))}
        </List>
    );
}
