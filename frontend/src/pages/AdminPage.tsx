import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2,
    TextField,
    Typography,
    Paper
} from "@mui/material";
import { getUser } from "../services/authService";
import { BACKEND_URL } from "../constants";

interface MatchedSong {
    id: number;
    source_platform: string;
    destination_platform: string;
    source_id: string;
    destination_id: string;
}

interface NonMatchedSong {
    id: number;
    source_platform: string;
    destination_platform: string;
    source_id: string;
}

export default function AdminSongManagerPage() {
    const navigate = useNavigate();
    const [matchedSongs, setMatchedSongs] = useState<MatchedSong[]>([]);
    const [nonMatchedSongs, setNonMatchedSongs] = useState<NonMatchedSong[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<MatchedSong & NonMatchedSong>>({});
    const [editingType, setEditingType] = useState<'matched' | 'nonmatched'>('matched');
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        const checkAdminAndLoadData = async () => {
            const user = await getUser();
            if (!user?.isAdmin) navigate("/");

            const [matchedRes, nonMatchedRes] = await Promise.all([
                fetch(`${BACKEND_URL}/admin/matched-songs`).then(r => r.json()),
                fetch(`${BACKEND_URL}/admin/non-matched-songs`).then(r => r.json())
            ]);

            setMatchedSongs(matchedRes);
            setNonMatchedSongs(nonMatchedRes);
        };
        checkAdminAndLoadData();
    }, [navigate]);

    const handleOpenDialog = (type: 'matched' | 'nonmatched', song?: any) => {
        setEditingType(type);
        setIsEdit(!!song);
        setFormData(song || {});
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        const url = `${BACKEND_URL}/admin/${editingType === 'matched' ? 'matched-songs' : 'non-matched-songs'}`;
        const method = isEdit ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        window.location.reload();
    };

    const handleDelete = async (type: 'matched' | 'nonmatched', id: number) => {
        const url = `${BACKEND_URL}/admin/${type === 'matched' ? 'matched-songs' : 'non-matched-songs'}/${id}`;
        await fetch(url, { method: 'DELETE' });
        window.location.reload();
    };

    return (
        <Container>
            <Box sx={(theme) => theme.mixins.toolbar} />
            <Typography variant="h4" gutterBottom>
                Admin Song Manager
            </Typography>

            <Grid2 container spacing={4}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6">Matched Songs</Typography>
                    <Button variant="contained" onClick={() => handleOpenDialog('matched')} sx={{ mb: 2 }}>
                        Add Matched Song
                    </Button>
                    {matchedSongs.map(song => (
                        <Paper key={song.id} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="body2">
                                {song.source_platform} → {song.destination_platform}
                            </Typography>
                            <Typography variant="caption">
                                {song.source_id} → {song.destination_id}
                            </Typography>
                            <br />
                            <Button size="small" onClick={() => handleOpenDialog('matched', song)}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDelete('matched', song.id)}>Delete</Button>
                        </Paper>
                    ))}
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6">Non-Matched Songs</Typography>
                    <Button variant="contained" onClick={() => handleOpenDialog('nonmatched')} sx={{ mb: 2 }}>
                        Add Non-Matched Song
                    </Button>
                    {nonMatchedSongs.map(song => (
                        <Paper key={song.id} sx={{ p: 2, mb: 1 }}>
                            <Typography variant="body2">
                                {song.source_platform} → {song.destination_platform}
                            </Typography>
                            <Typography variant="caption">{song.source_id}</Typography>
                            <br />
                            <Button size="small" onClick={() => handleOpenDialog('nonmatched', song)}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDelete('nonmatched', song.id)}>Delete</Button>
                        </Paper>
                    ))}
                </Grid2>
            </Grid2>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{isEdit ? 'Edit' : 'Add'} {editingType === 'matched' ? 'Matched' : 'Non-Matched'} Song</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Source Platform"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.source_platform || ''}
                        onChange={(e) => setFormData({ ...formData, source_platform: e.target.value })}
                    />
                    <TextField
                        label="Destination Platform"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.destination_platform || ''}
                        onChange={(e) => setFormData({ ...formData, destination_platform: e.target.value })}
                    />
                    <TextField
                        label="Source ID"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.source_id || ''}
                        onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                    />
                    {editingType === 'matched' && (
                        <TextField
                            label="Destination ID"
                            fullWidth
                            sx={{ mt: 1 }}
                            value={formData.destination_id || ''}
                            onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{isEdit ? 'Save' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}