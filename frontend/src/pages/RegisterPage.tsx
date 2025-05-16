import { Container, Typography, TextField, Button, Box } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await authService.register(email, password);
      navigate("/login");
    }
    catch (err) {
      console.error("Registration failed", err);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          Creează un cont
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
          Înregistrează-te
        </Button>
        <Typography variant="body2" mt={2}>
          Ai deja un cont?{" "}
          <Button color="secondary" onClick={() => navigate("/login")}>
            Autentifică-te
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage;
