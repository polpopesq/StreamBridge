import { List, ListSubheader, Typography, Box, Divider } from '@mui/material';
import SongMappingItem from './SongMappingItem';
import { Mapping } from '@shared/types';

interface Props {
    mappings: Mapping[],
    onUpdateMapping: (updated: Mapping) => void
}

export default function SongMappingList({ mappings, onUpdateMapping }: Props) {
    const { sourcePlatform, destinationPlatform } = JSON.parse(localStorage.getItem("transferData") || "")
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
                <SongMappingItem key={mapping.sourceTrack.id} mapping={mapping} onUpdateMapping={onUpdateMapping} />
            ))}
        </List>
    );
}
