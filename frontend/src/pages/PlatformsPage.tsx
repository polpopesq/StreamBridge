import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PlatformCardsContainer from "../components/PlatformCardsContainer";

const PlatformsPage = () => {
  const navigate = useNavigate();

  const navigateTransfer = (platformKey: string | null) => {
    navigate(`/transfera?step=0`);
  }

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <PlatformCardsContainer handleBoxClick={navigateTransfer} exclude={null} />
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "20vh" }}>
      </Box>
    </Box >
  );
};

export default PlatformsPage;
