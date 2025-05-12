import PlatformCardsContainer from "../PlatformCardsContainer";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PlatformKey } from "../../constants";

interface SelectSourceProps {
    onChange: (platform: PlatformKey) => void;
    type: string;
    exclude: PlatformKey | null;
}

const SelectSource: React.FC<SelectSourceProps> = ({ onChange, type, exclude }) => {
    const [platform, setPlatform] = useState("");
    useEffect(() => {
        const platformKey = platform as PlatformKey;
        onChange(platformKey);
    }, [platform])

    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>{`Alege platforma ${type}`}</Typography>
            <PlatformCardsContainer handleBoxClick={setPlatform} exclude={exclude} />
        </Box>
    );
}

export default SelectSource;