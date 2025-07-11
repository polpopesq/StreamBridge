import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { useState } from "react";
import { useAuth } from "../services/AuthContext";
import { SnackbarAlert } from "../components/SnackbarAlert";

//TODO: schimba inapoi la 6 cand termini testele
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password: string) => password.length >= 4;

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
    } catch (err) {
      setActiveSnackbar(true);
      console.error("Login failed:", err);
    }
  };

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
          error={email !== "" && !isValidEmail(email)}
          helperText={email !== "" && !isValidEmail(email) ? "Email invalid" : ""}
        />

        <TextField
          fullWidth
          label="Parolă"
          type="password"
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={password !== "" && !isValidPassword(password)}
          helperText={password !== "" && !isValidPassword(password) ? "Parola trebuie să aibă cel puțin 6 caractere" : ""}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={!isValidEmail(email) || !isValidPassword(password)}
        >
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
