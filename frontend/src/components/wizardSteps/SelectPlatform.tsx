import PlatformCardsContainer from "../PlatformCardsContainer";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { PlatformKey } from "../../constants";

interface SelectSourceProps {
    onChange: (platform: PlatformKey) => void;
    exclude: PlatformKey | null;
}

const SelectSource: React.FC<SelectSourceProps> = ({ onChange, exclude }) => {
    const [platform, setPlatform] = useState("");
    useEffect(() => {
        const platformKey = platform as PlatformKey;
        onChange(platformKey);
        console.log(platformKey);
    }, [platform])
    const tip = exclude ? "destinatie" : "sursa";

    return (
        <Box textAlign="center">
            <Typography variant="h6" mb={3}>{`Alege platforma ${tip}`}</Typography>
            <PlatformCardsContainer handleBoxClick={setPlatform} exclude={exclude} />
        </Box>
    );
}

export default SelectSource;