import { Box, Typography, Button } from "@mui/material";
import { PlatformKey } from "../../constants";
import { platformData } from "../../constants";
import { getUser } from "../../services/spotifyService"
import { useState, useEffect } from "react";

interface SelectPlaylistProps {
    sourcePlatform: PlatformKey;
    onChange: (value: PlatformKey) => void;//TODO
}


const SelectPlaylist: React.FC<SelectPlaylistProps> = ({ sourcePlatform, onChange }) => {

    const [userData, setUserData] = useState<{ spotify_user_id: string, spotify_display_name: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUser();
            if (data) setUserData(data);
        };

        fetchUser();
    }, []);

    return (
        <>
            <Typography>
                {platformData[sourcePlatform].name}
            </Typography>
            <div>
                {userData ? (
                    <Typography>
                        {userData.spotify_display_name}
                    </Typography>
                ) : (
                    <Typography>Loading user data...</Typography>
                )}
            </div>
            <Box textAlign="center">
                <Typography variant="h6" mb={3}>Selectează playlistul de transferat</Typography>
            </Box>
        </>
    );
};

export default SelectPlaylist;