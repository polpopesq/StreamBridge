import { platformData } from "../constants";
import { Box, Grid2 as Grid } from "@mui/material";
import AboutPlatformCard from "./AboutPlatformCard";
import { PlatformKey } from "@shared/types";

interface PlatformCardsContainerProps {
    handleBoxClick: (platformKey: PlatformKey) => void;
    exclude: PlatformKey | null;
}

const PlatformCardsContainer = ({ handleBoxClick, exclude }: PlatformCardsContainerProps) => {
    return (
        <Grid container spacing={2} justifyContent={"center"}>
            {Object.entries(platformData).filter(([key]) => key !== exclude).map(([key, { name, description, logo }]) => (
                <Grid key={key} display="flex" justifyContent="center" size={{ lg: 3 }}>
                    <Box onClick={() => handleBoxClick(key as PlatformKey)} sx={{ cursor: "pointer" }}>
                        <AboutPlatformCard
                            name={name}
                            image={logo}
                            description={description}
                        />
                    </Box>
                </Grid>
            ))}
        </Grid>
    )
}

export default PlatformCardsContainer;