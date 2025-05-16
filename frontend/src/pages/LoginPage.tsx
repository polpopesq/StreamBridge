import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { SnackbarAlert } from "../components/SnackbarAlert";


const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSnackbar, setActiveSnackbar] = useState(false);
  const { setLoggedIn } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await authService.login(email, password);
      setLoggedIn(true);
      navigate("/");
    }
    catch (err) {
      setActiveSnackbar(true);
      console.error("Login failed:", err);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Autentificare
        </Typography>
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          fullWidth
          label="Parolă"
          type="password"
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={handleSubmit}>
          Autentifică-te
        </Button>
        <Typography variant="body2" mt={2}>
          Nu ai cont?{" "}
          <Button color="secondary" onClick={() => navigate("/register")}>
            Creează unul
          </Button>
        </Typography>
      </Box>
      <SnackbarAlert
        message="Autentificare eșuată"
        activeSnackbar={activeSnackbar}
        setActiveSnackbar={setActiveSnackbar}
      />
    </Container>
  );
};

export default LoginPage;
