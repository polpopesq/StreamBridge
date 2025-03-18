import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box textAlign="center" mt={5}>
        <Typography variant="h2" gutterBottom>
          Bine ai venit la StreamBridge
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Transferă playlist-uri între platformele tale preferate rapid și ușor.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={() => navigate("/login")}>
          Începe acum
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;
