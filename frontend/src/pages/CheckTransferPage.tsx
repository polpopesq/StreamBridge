import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField } from '@mui/material';
import SongMappingList from '../components/SongMappingList';
import { Mapping } from '@shared/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { proceedTransfer } from '../services/transferService';

export default function CheckTransferPage() {
    const { sourcePlatform, destinationPlatform } = JSON.parse(localStorage.getItem("transferData") || "")
    const location = useLocation();
    const initialMappings = location.state?.mappings as Mapping[] | undefined;

    const navigate = useNavigate();

    const [mappings, setMappings] = useState<Mapping[] | undefined>(initialMappings);
    const [title, setTitle] = useState("");
    const [openDialog, setOpenDialog] = useState(false);

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
        if (mappings) await proceedTransfer(sourcePlatform, destinationPlatform, mappings, title);
    }

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
                        sx={{ width: '70%' }}
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
        </>
    );
}
