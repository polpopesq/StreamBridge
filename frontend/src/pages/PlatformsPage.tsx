import { platformData } from "../constants";
import AboutPlatformCard from "../components/AboutPlatformCard";
import { Box, Grid } from "@mui/material";


const PlatformsPage = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={3}>
        {platformData.map((platform) => (
          <Grid item key={platform.name} xs={12} sm={6} md={4} lg={3}>
            <AboutPlatformCard name={platform.name} image={platform.logo} description={platform.description}/>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlatformsPage;
