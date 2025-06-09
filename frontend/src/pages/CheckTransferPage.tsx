import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField, FormControlLabel, Switch } from '@mui/material';
import SongMappingList from '../components/SongMappingList';
import { Mapping } from '@shared/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { proceedTransfer } from '../services/transferService';
import { SnackbarAlert } from '../components/SnackbarAlert';

export default function CheckTransferPage() {
    const { sourcePlatform, destinationPlatform, selectedPlaylist } = JSON.parse(localStorage.getItem("transferData") || "")
    const location = useLocation();
    const initialMappings = location.state?.mappings as Mapping[] | undefined;

    const navigate = useNavigate();

    const [mappings, setMappings] = useState<Mapping[] | undefined>(initialMappings);
    const [title, setTitle] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [activeSnackbar, setActiveSnackbar] = useState(false);
    const [isPublic, setIsPublic] = useState(false);

    const updateMapping = (updatedMapping: Mapping) => {
        setMappings(prev =>
            prev?.map(mapping =>
                mapping.sourceTrack.id === updatedMapping.sourceTrack.id ? updatedMapping : mapping
            )
        );
    };

    const removeMapping = (mappingToDelete: Mapping) => {
        if (!mappings) return;

        const filtered = mappings.filter((m) =>
            !(
                m.sourceTrack.id === mappingToDelete.sourceTrack.id &&
                m.destinationTrack?.id === mappingToDelete.destinationTrack?.id
            )
        );

        setMappings(filtered);
    };

    const handleProceed = async () => {
        if (!mappings) return;

        navigate("/loading");

        try {
            const link = await proceedTransfer(sourcePlatform, destinationPlatform, mappings, title, isPublic, selectedPlaylist.id);

            if (link !== "") {
                const newWindow = window.open(link, '_blank', 'noopener,noreferrer');
                if (newWindow) newWindow.opener = null;
            }

            navigate("/success");
        } catch (error) {
            console.error("Transfer failed:", error);
            setOpenDialog(false);
        }
    };


    if (!mappings) {
        navigate("/transfer");
        return;
    }
    return (
        <>
            <Container>
                <Box sx={(theme) => theme.mixins.toolbar} />

                <Typography variant="h4" gutterBottom>
                    Check Transfer Page
                </Typography>
                <SongMappingList mappings={mappings} onUpdateMapping={updateMapping} sourcePlatform={sourcePlatform} destinationPlatform={destinationPlatform} removeMapping={removeMapping} />
            </Container>
            <Button
                variant="contained"
                size="large"
                sx={{
                    mt: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 1,
                    textTransform: 'none',
                    alignSelf: 'center',
                    mx: 'auto'
                }}
                onClick={() => setOpenDialog(true)}
            >
                Proceed
            </Button>
            <Dialog open={openDialog}>
                <DialogTitle>Select new playlist title</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Title"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ width: '70%', mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={isPublic ? "Public" : "Private"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={title === ""}
                        onClick={() => handleProceed()}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <SnackbarAlert message='No playlist returned' activeSnackbar={activeSnackbar} setActiveSnackbar={setActiveSnackbar} />
        </>
    );
}
