import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { resetPassword } from "../services/authService";

export default function SetNewPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isReset = await resetPassword(token!, newPassword);
        if (isReset) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
            <Typography variant="h5" gutterBottom>
                Setează o parolă nouă
            </Typography>
            {success ? (
                <Typography>Parola a fost resetată. Vei fi redirecționat...</Typography>
            ) : (
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Parolă nouă"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                        Salvează
                    </Button>
                </form>
            )}
        </Box>
    );
}
