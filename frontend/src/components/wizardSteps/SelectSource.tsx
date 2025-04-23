import PlatformCardsContainer from "../PlatformCardsContainer";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PlatformKey } from "../../constants";

interface SelectSourceProps {
    onChange: (platform: PlatformKey) => void;
}

const SelectSource: React.FC<SelectSourceProps> = ({ onChange }) => {
    const [platform, setPlatform] = useState("");
    useEffect(() => {
        const platformKey = platform as PlatformKey;
        onChange(platformKey);
    }, [platform])

    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>Alege platforma sursă</Typography>
            <PlatformCardsContainer handleBoxClick={setPlatform} />
            {/* Simulează alegerea unei platforme */}
        </Box>
    );
}

export default SelectSource;