import { platformData } from "../constants";
import AboutPlatformCard from "../components/AboutPlatformCard";
import { Box, Grid2 as Grid, Fab } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PlatformsPage = () => {
  const navigate = useNavigate();

  const handleTransferButtonClick = () => {
    navigate("/platformselector");
  }

  const handlePlatformInfoClick = (platformKey: string) => {
    console.log(platformKey);
  }

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Grid container spacing={2} justifyContent={"center"}>
        {Object.entries(platformData).map(([key, { name, description, logo }]) => (
          <Grid key={key} display="flex" justifyContent="center" size={{ lg: 3 }}>
            <Box onClick={() => handlePlatformInfoClick(key)} sx={{ cursor: "pointer" }}>
              <AboutPlatformCard
                name={name}
                image={logo}
                description={description}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "20vh" }}>
        <Fab variant="extended" onClick={handleTransferButtonClick}>
          Transfera
        </Fab>
      </Box>
    </Box>
  );
};

export default PlatformsPage;
