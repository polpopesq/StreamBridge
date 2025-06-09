import {
    Box,
    TextField,
    Typography,
    IconButton,
    useTheme
} from "@mui/material";
import { SnackbarAlert } from "./SnackbarAlert";
import { useState, DragEvent, useEffect } from "react";
import { TransferData, TrackUI } from "@shared/types";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
    transferData: TransferData;
    setTransferData: (data: TransferData) => void;
}

export const TxtInput = ({ transferData, setTransferData }: Props) => {
    const [input, setInput] = useState("");
    const [snackbarError, setSnackbarError] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("transferData") || "{}");
        const savedTracks = savedData?.selectedPlaylist?.tracks || [];
        if (savedTracks.length > 0) {
            const savedInput = savedTracks.map((track: TrackUI) => `${track.artists.join(", ")} - ${track.name}`).join("\n");
            setInput(savedInput);
        }
    }, []);

    const parseTracks = (text: string): TrackUI[] => {
        return text.split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .map((line, index) => {
                let artists = "", title = "";
                if (line.includes(" - ")) {
                    [artists, title] = line.split(" - ");
                } else {
                    title = line;
                }
                return {
                    id: `manual-${index}`,
                    name: title.trim(),
                    artists: artists.split(",").map(a => a.trim()).filter(Boolean),
                };
            });
    };

    useEffect(() => {
        const tracks = parseTracks(input);
        const updated: TransferData = {
            ...transferData,
            selectedPlaylist: {
                id: "txt-import",
                name: "Manual import",
                tracks,
                imageUrl: "",
                public: true
            }
        };
        setTransferData(updated);
    }, [input]);

    const handleFile = (file: File) => {
        if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
            setSnackbarError(true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            setInput(text);
            setUploadedFileName(file.name);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const resetFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedFileName(null);
        setInput("");
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    return (
        <Box maxWidth="md" mx="auto" mt={5} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h5">
                Paste or upload your playlist (format: <i>artist - song</i>)
            </Typography>

            <Box
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                sx={{
                    border: "2px dashed",
                    borderColor: dragOver ? theme.palette.primary.main : theme.palette.divider,
                    padding: 3,
                    borderRadius: 2,
                    textAlign: "center",
                    backgroundColor: dragOver ? "#f0f0f0" : "transparent",
                    cursor: "pointer",
                    position: "relative"
                }}
                onClick={() => document.getElementById("fileInput")?.click()}
            >
                {!uploadedFileName ? (
                    <Typography>
                        Drag and drop a <strong>.txt</strong> file here or click to select
                    </Typography>
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography><strong>Uploaded:</strong> {uploadedFileName}</Typography>
                        <IconButton size="small" onClick={resetFile}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
                <input
                    id="fileInput"
                    type="file"
                    accept=".txt"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </Box>

            <TextField
                multiline
                minRows={10}
                placeholder={`Example:\nColdplay - Yellow\nDaft Punk - Get Lucky\nAdele - Hello`}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    if (uploadedFileName) setUploadedFileName(null);
                }}
                fullWidth
                variant="outlined"
            />

            <SnackbarAlert
                activeSnackbar={snackbarError}
                setActiveSnackbar={setSnackbarError}
                message="Only .txt files are accepted!"
            />
        </Box>
    );
};
