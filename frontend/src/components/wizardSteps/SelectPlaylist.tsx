import { Box, Typography, Button } from "@mui/material";

interface Props {
    onNext: () => void;
    onBack: () => void;
}

export default function SelectPlaylist({ onNext, onBack }: Props) {
    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>Selectează playlistul de transferat</Typography>
            <Button onClick={onBack} sx={{ mr: 2 }}>Înapoi</Button>
            <Button variant="contained" onClick={onNext}>Continuă</Button>
        </Box>
    );
}
