import { Container, Typography, Box, Button } from '@mui/material';
import SongMappingList from '../components/SongMappingList';
import { Mapping } from '@shared/types';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function CheckTransferPage() {
    const location = useLocation();
    const initialMappings = location.state?.mappings as Mapping[] | undefined;

    const [mappings, setMappings] = useState<Mapping[] | undefined>(initialMappings);

    const updateMapping = (updatedMapping: Mapping) => {
        setMappings(prev =>
            prev?.map(m =>
                m.sourceTrack.id === updatedMapping.sourceTrack.id ? updatedMapping : m
            )
        );
    };

    if (!mappings) {
        return <div>No data provided.</div>; // TODO: redirect
    }
    return (
        <>
            <Container>
                <Box sx={(theme) => theme.mixins.toolbar} />

                <Typography variant="h4" gutterBottom>
                    Check Transfer Page
                </Typography>
                <SongMappingList mappings={mappings} onUpdateMapping={updateMapping} />
            </Container>
            <Button>
                Proceed
            </Button>
        </>
    );
}
