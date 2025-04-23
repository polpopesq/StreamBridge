import { platformData } from "../constants";
import { Box, Grid2 as Grid } from "@mui/material";
import AboutPlatformCard from "./AboutPlatformCard";
import { useState } from "react";
import { PlatformKey } from "../constants";

interface PlatformCardsContainerProps {
    handleBoxClick: (platformKey: string) => void;
}

const PlatformCardsContainer = ({ handleBoxClick }: PlatformCardsContainerProps) => {
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const options: PlatformKey[] = ["spotify", "ytMusic", "txt"];

    return (
        <Grid container spacing={2} justifyContent={"center"}>
            {Object.entries(platformData).map(([key, { name, description, logo }]) => (
                <Grid key={key} display="flex" justifyContent="center" size={{ lg: 3 }}>
                    <Box onClick={() => handleBoxClick(key)} sx={{ cursor: "pointer" }}>
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