import React from "react";
import { Snackbar, Slide, SlideProps, Typography } from "@mui/material";

interface SnackbarAlertProps {
    message: string;
    activeSnackbar: boolean;
    setActiveSnackbar: (value: boolean) => void;
    direction?: SlideProps["direction"];
}

export const SnackbarAlert: React.FC<SnackbarAlertProps> = ({
    message,
    activeSnackbar,
    setActiveSnackbar,
    direction = "up",
}) => {
    const SlideTransition = (props: SlideProps) => <Slide {...props} direction={direction} />;
    return (
        <Snackbar
            key={activeSnackbar.toString()}
            open={activeSnackbar}
            autoHideDuration={3000}
            onClose={() => setActiveSnackbar(false)}
            message={message}
            slots={{ transition: SlideTransition }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{
                zIndex: 1400,
                position: "fixed",
            }}
        />
    );
};
