import { Box, Typography, Button } from "@mui/material";
import { platformData } from "../../constants";

interface Props {
    onNext: () => void;
}

export default function SelectSource({ onNext }: Props) {
    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>Alege platforma sursă</Typography>
            {/* Simulează alegerea unei platforme */}
            <Button variant="contained" onClick={onNext}>Continuă</Button>
        </Box>
    );
}
