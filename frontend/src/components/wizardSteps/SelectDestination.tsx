import PlatformCardsContainer from "../PlatformCardsContainer";
import { Box, Typography, Button } from "@mui/material";

interface Props {
    onBack: () => void;
}

export default function SelectDestination({ onBack }: Props) {
    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>Alege platforma destinație</Typography>
            <PlatformCardsContainer handleBoxClick={() => { }} />
            <Button onClick={onBack} sx={{ mr: 2 }}>Înapoi</Button>
            <Button variant="contained" color="success">Finalizează transferul</Button>
        </Box>
    );
}
