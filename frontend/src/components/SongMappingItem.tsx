import { useState } from 'react';
import {
    Tooltip,
    IconButton,
    Stack,
    ListItem,
    Box,
    ListItemText,
    Typography
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import { Mapping } from '@shared/types';
import MatchManualDialog from './MatchManualDialog';

interface Props {
    mapping: Mapping;
    onUpdateMapping: (updated: Mapping) => void;
};

export default function SongMappingItem({ mapping, onUpdateMapping }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ListItem divider>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                >
                    <Box flex={5}>
                        <ListItemText
                            primary={mapping.sourceTrack.name}
                            secondary={mapping.sourceTrack.artists.join(', ')}
                        />
                    </Box>

                    <Box flex={1} textAlign="center">
                        <ChevronRightIcon fontSize="small" color="action" />
                    </Box>

                    <Box flex={5}>
                        {mapping.destinationTrack ? (
                            <ListItemText
                                primary={mapping.destinationTrack.name}
                                secondary={mapping.destinationTrack.artists.join(', ')}
                            />
                        ) : (
                            <Typography variant="body2" color="error">
                                No match
                            </Typography>
                        )}
                    </Box>
                </Stack>
                <Tooltip title="Match manually">
                    <IconButton onClick={() => setOpen(true)}>
                        <SearchIcon />
                    </IconButton>
                </Tooltip>
            </ListItem>


            <MatchManualDialog
                open={open}
                onClose={(chosenMapping: Mapping | null) => {
                    if (chosenMapping) onUpdateMapping(chosenMapping);
                    setOpen(false);
                }}
                initialMapping={mapping}
            />
        </>
    );
}
