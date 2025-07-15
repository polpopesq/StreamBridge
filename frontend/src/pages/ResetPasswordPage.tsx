import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { requestPasswordReset } from "../services/authService";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestPasswordReset(email);
        setSent(true);
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
            <Typography variant="h5" gutterBottom>
                Resetare parolă
            </Typography>
            {sent ? (
                <Typography>
                    Verifică-ți emailul pentru un link de resetare. Poți închide acest tab.
                </Typography>
            ) : (
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" fullWidth>
                        Trimite link de resetare
                    </Button>
                </form>
            )}
        </Box>
    );
}
