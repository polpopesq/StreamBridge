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
    TextField,
    Typography,
    Paper,
    Grid2,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio
} from "@mui/material";
import { getUser } from "../services/authService";
import {
    fetchMatchedSongs,
    fetchNonMatchedSongs,
    addMatchedSong,
    addNonMatchedSong,
    updateMatchedSong,
    updateNonMatchedSong,
    deleteMatchedSong,
    deleteNonMatchedSong,
} from "../services/adminService";
import { useTheme } from "@mui/material/styles";
import { MatchedSong, NonMatchedSong } from "@shared/types";

const AdminPage = () => {
    const navigate = useNavigate();
    const [matchedSongs, setMatchedSongs] = useState<MatchedSong[]>([]);
    const [nonMatchedSongs, setNonMatchedSongs] = useState<NonMatchedSong[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<Partial<MatchedSong & NonMatchedSong>>({});
    const [editingType, setEditingType] = useState<'matched' | 'nonmatched'>('matched');
    const [isEdit, setIsEdit] = useState(false);
    const [viewType, setViewType] = useState<'matched' | 'nonmatched'>('nonmatched');
    const theme = useTheme();


    useEffect(() => {
        const checkAdminAndLoadData = async () => {
            const user = await getUser();
            if (!user?.isAdmin) return navigate("/");

            const [matched, nonMatched] = await Promise.all([
                fetchMatchedSongs(),
                fetchNonMatchedSongs()
            ]);

            setMatchedSongs(matched);
            setNonMatchedSongs(nonMatched);
            console.log(matched, nonMatched)
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
        const isMatched = editingType === 'matched';

        const updatedSong = isMatched
            ? (isEdit ? await updateMatchedSong(formData) : await addMatchedSong(formData))
            : (isEdit ? await updateNonMatchedSong(formData) : await addNonMatchedSong(formData));

        if (isMatched) {
            setMatchedSongs(prev =>
                isEdit
                    ? prev.map(song => song.id === updatedSong.id ? updatedSong : song)
                    : [...prev, updatedSong]
            );
        } else {
            setNonMatchedSongs(prev =>
                isEdit
                    ? prev.map(song => song.id === updatedSong.id ? updatedSong : song)
                    : [...prev, updatedSong]
            );
        }

        setOpenDialog(false);
        setFormData({});
        setIsEdit(false);
    };

    const handleDelete = async (type: 'matched' | 'nonmatched', id: number) => {
        if (type === 'matched') {
            await deleteMatchedSong(id);
            setMatchedSongs(prev => prev.filter(song => song.id !== id));
        } else {
            await deleteNonMatchedSong(id);
            setNonMatchedSongs(prev => prev.filter(song => song.id !== id));
        }
    };

    return (
        <Container>
            <Box sx={(theme) => theme.mixins.toolbar} />
            <Typography variant="h4" gutterBottom>
                Admin Song Manager
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
                <RadioGroup
                    row
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value as 'matched' | 'nonmatched')}
                >
                    <FormControlLabel value="matched" control={<Radio />} label="Matched Songs" />
                    <FormControlLabel value="nonmatched" control={<Radio />} label="Non-Matched Songs" />
                </RadioGroup>
            </FormControl>


            <Grid2 container spacing={4} justifyContent="center">
                <Grid2 container direction="column" alignItems="center" size={12}>
                    <Typography variant="h6" align="center">
                        {viewType === 'matched' ? 'Matched Songs' : 'Non-Matched Songs'}
                    </Typography>

                    {viewType === "matched" && (
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Button variant="contained" onClick={() => handleOpenDialog(viewType)}>
                                Add Matched Song
                            </Button>
                        </Box>
                    )}

                    {(viewType === 'matched' ? matchedSongs : nonMatchedSongs).map((song) => (
                        <Paper
                            key={song.id}
                            sx={{
                                p: 2,
                                mb: 2,
                                width: '100%',
                                backgroundColor: theme.palette.background.paper,
                                color: theme.palette.text.primary,
                            }}
                        >
                            <Box
                                display="flex"
                                flexDirection="row"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={2}
                            >
                                <Box flex={1}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {song.source_platform}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>ID:</strong> {song.source_id}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Title:</strong> {song.source_name || '—'}
                                    </Typography>
                                </Box>

                                <Box flexShrink={0} sx={{ fontSize: 32, color: theme.palette.text.secondary }}>
                                    ➜
                                </Box>

                                {(song as any).destination_id && (
                                    <Box flex={1}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            {(song as any).destination_platform}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>ID:</strong> {(song as any).destination_id || '—'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Title:</strong> {(song as any).destination_name || '—'}
                                        </Typography>
                                    </Box>
                                )}

                            </Box>

                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button size="small" onClick={() => handleOpenDialog(viewType, song)}>
                                    Edit
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDelete(viewType, song.id)}>
                                    Delete
                                </Button>
                            </Box>
                        </Paper>
                    ))}

                </Grid2>
            </Grid2>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {isEdit ? 'Edit' : 'Add'} {editingType === 'matched' ? 'Matched' : 'Non-Matched'} Song
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Source Platform"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.source_platform || ''}
                        onChange={(e) => setFormData({ ...formData, source_platform: e.target.value })}
                    />
                    <TextField
                        label="Source Name"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.source_name || ''}
                        onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    />
                    <TextField
                        label="Source ID"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.source_id || ''}
                        onChange={(e) => setFormData({ ...formData, source_id: e.target.value })}
                    />

                    <TextField
                        label="Destination Platform"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.destination_platform || ''}
                        onChange={(e) => setFormData({ ...formData, destination_platform: e.target.value })}
                    />
                    <TextField
                        label="Destination Name"
                        fullWidth
                        sx={{ mt: 1 }}
                        value={formData.destination_name || ''}
                        onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
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
                    <Button variant="contained" onClick={handleSubmit}>
                        {isEdit ? 'Save' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPage;
