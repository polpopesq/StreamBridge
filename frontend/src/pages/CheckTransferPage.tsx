import { Container, Typography, Box, Button } from '@mui/material';
import SongMappingList from '../components/SongMappingList';
import { Mapping } from '@shared/types';
import { redirect, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { proceedTransfer } from '../services/transferService';

export default function CheckTransferPage() {
    const { sourcePlatform, destinationPlatform } = JSON.parse(localStorage.getItem("transferData") || "")
    const location = useLocation();
    const initialMappings = location.state?.mappings as Mapping[] | undefined;

    const navigate = useNavigate();

    const [mappings, setMappings] = useState<Mapping[] | undefined>(initialMappings);

    const updateMapping = (updatedMapping: Mapping) => {
        setMappings(prev =>
            prev?.map(mapping =>
                mapping.sourceTrack.id === updatedMapping.sourceTrack.id ? updatedMapping : mapping
            )
        );
    };

    const handleProceed = async () => {
        if (mappings) await proceedTransfer(sourcePlatform, destinationPlatform, mappings);
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
                <SongMappingList mappings={mappings} onUpdateMapping={updateMapping} sourcePlatform={sourcePlatform} destinationPlatform={destinationPlatform} />
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
                onClick={() => handleProceed()}
            >
                Proceed
            </Button>
        </>
    );
}
