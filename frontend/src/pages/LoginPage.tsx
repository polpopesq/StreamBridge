import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { useState } from "react";


const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event : React.FormEvent) => {
      event.preventDefault();
      try {
        await authService.login(email, password);
        navigate("/dashboard");
      }
      catch(err) {
        console.error("Login failed", err);
      }
    }

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Autentificare
        </Typography>
        <TextField fullWidth label="Email" margin="normal" variant="outlined" />
        <TextField fullWidth label="Parolă" type="password" margin="normal" variant="outlined" />
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
    </Container>
  );
};

export default LoginPage;
