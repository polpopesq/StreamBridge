import { useState } from 'react';
import {
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ListItemSecondaryAction,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SpotifyYoutubeMap } from '../pages/CheckTransferPage';

interface Props {
    mapping: SpotifyYoutubeMap;
}

export default function SongMappingItem({ mapping }: Props) {
    const [open, setOpen] = useState(false);

    const handleOpenDialog = () => {
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    return (
        <>
            <ListItem divider>
                <ListItemText
                    primary={mapping.track.name}
                    secondary={
                        mapping.result
                            ? `Matched: ${mapping.result.name} - ${mapping.result.description || ''}`
                            : 'No match found'
                    }
                />
                <ListItemSecondaryAction>
                    <Tooltip title="Open details">
                        <IconButton edge="end" onClick={handleOpenDialog}>
                            <SearchIcon />
                        </IconButton>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>

            <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Details</DialogTitle>
                <DialogContent>
                    {/* Poți adăuga aici componente pentru detalii, preview, manual matching etc */}
                    <p>Spotify: {mapping.track.name}</p>
                    <p>YouTube: {mapping.result?.name || 'No match'}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
