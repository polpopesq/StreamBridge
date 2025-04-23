import { Box, Typography, Button } from "@mui/material";
import { PlatformKey } from "../../constants";
import { platformData } from "../../constants";

interface SelectPlaylistProps {
    sourcePlatform: PlatformKey;
    onChange: (value: PlatformKey) => void;//TODO
}


const SelectPlaylist: React.FC<SelectPlaylistProps> = ({ sourcePlatform, onChange }) => {
    return (
        <>
            <Typography>
                {platformData[sourcePlatform].name}
            </Typography>
            <Box textAlign="center">
                <Typography variant="h6" mb={3}>Selectează playlistul de transferat</Typography>
            </Box>
        </>
    );
};

export default SelectPlaylist;