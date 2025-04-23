import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    open,
    title = "Ești sigur?",
    description = "Această acțiune este ireversibilă.",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">Anulează</Button>
                <Button onClick={onConfirm} color="error" variant="contained">Confirmă</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
