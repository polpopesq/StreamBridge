import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Stepper,
    Step,
    StepLabel,
    Box,
    Card,
    CardContent,
    Button,
} from "@mui/material";

import SelectPlatform from "../components/wizardSteps/SelectPlatform";
import SelectPlaylist from "../components/wizardSteps/SelectPlaylist";
import { TxtInput } from "../components/TxtInput";
import { SnackbarAlert } from "../components/SnackbarAlert";

import { BACKEND_URL } from "../constants";
import { Playlist, TransferData, PlatformKey } from "@shared/types";
import { transferPlaylist } from "../services/transferService";

const steps = ["Sursă", "Playlist", "Destinație"];

const getTransferDataFromStorage = (): TransferData => {
    return JSON.parse(localStorage.getItem("transferData") || "{}");
};

const saveTransferDataToStorage = (data: TransferData) => {
    localStorage.setItem("transferData", JSON.stringify(data));
};

export default function TransferWizard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialStep = parseInt(searchParams.get("step") || "0", 10);
    const [activeStep, setActiveStep] = useState(initialStep);
    const [data, setData] = useState<TransferData>({
        sourcePlatform: null,
        selectedPlaylist: null,
        destinationPlatform: null,
    });
    const [activeSnackbar, setActiveSnackbar] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set("step", activeStep.toString());
        setSearchParams(params, { replace: true });

        if (activeStep > 0) {
            const saved = getTransferDataFromStorage();
            setData(saved);
        } else {
            localStorage.removeItem("transferData");
        }

        if (activeStep === steps.length) {
            initiateTransfer();
        }
    }, [activeStep]);

    const updateData = (partial: Partial<TransferData>) => {
        const newData = { ...data, ...partial };
        setData(newData);
        saveTransferDataToStorage(newData);
    };

    const validateStep = (): boolean => {
        const valid =
            (activeStep === 0 && !!data.sourcePlatform) ||
            (activeStep === 1 && !!data.selectedPlaylist) ||
            (activeStep === 2 && !!data.destinationPlatform);

        if (!valid) setActiveSnackbar(true);
        return valid;
    };

    const redirectToOAuth = (platform: PlatformKey, step: number) => {
        window.location.href = `${BACKEND_URL}/${platform}/login?step=${step}`;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        const { sourcePlatform, destinationPlatform } = data;
        const isOAuth = (platform: PlatformKey | null) =>
            platform && ["spotify", "youtube"].includes(platform);

        if (activeStep === 0 && isOAuth(sourcePlatform)) {
            redirectToOAuth(sourcePlatform!, activeStep);
            return;
        }

        if (activeStep === 2 && isOAuth(destinationPlatform)) {
            redirectToOAuth(destinationPlatform!, activeStep);
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (activeStep === 1) {
            updateData({ sourcePlatform: null });
        }
        setActiveStep((prev) => prev - 1);
    };

    const initiateTransfer = async () => {
        navigate("/loading");

        try {
            const {
                sourcePlatform,
                destinationPlatform,
                selectedPlaylist,
            } = getTransferDataFromStorage();

            if (!sourcePlatform || !destinationPlatform || !selectedPlaylist) {
                console.error("Transfer data is incomplete");
                return navigate("/transfera");
            }

            const mappings = await transferPlaylist(
                sourcePlatform,
                destinationPlatform,
                selectedPlaylist
            );

            navigate("/checkout", { state: { mappings } });
        } catch (err) {
            console.error("Transfer failed:", err);
            navigate("/transfera");
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <SelectPlatform
                        onChange={(platform) => updateData({ sourcePlatform: platform })}
                        exclude={null}
                    />
                );
            case 1:
                return data.sourcePlatform === "txt" ? (
                    <TxtInput
                        transferData={data}
                        setTransferData={(newData) => {
                            updateData(newData);
                        }}
                    />
                ) : (
                    <SelectPlaylist
                        onChange={(playlist: Playlist) =>
                            updateData({ selectedPlaylist: playlist })
                        }
                    />
                );
            case 2:
                return (
                    <SelectPlatform
                        onChange={(platform) =>
                            updateData({ destinationPlatform: platform })
                        }
                        exclude={data.sourcePlatform}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Box sx={{ maxWidth: 800, mx: "auto", mt: 6 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Card sx={{ mt: 4 }}>
                    <CardContent>{renderStepContent()}</CardContent>

                    <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleBack}
                            disabled={activeStep === 0}
                        >
                            Înapoi
                        </Button>
                        <Button variant="contained" onClick={handleNext}>
                            {activeStep === steps.length - 1 ? "Finalizare" : "Următorul"}
                        </Button>
                    </Box>
                </Card>
            </Box>

            <SnackbarAlert
                message={
                    activeStep === 1 ? "Selectează un playlist" : "Selectează o platformă"
                }
                activeSnackbar={activeSnackbar}
                setActiveSnackbar={setActiveSnackbar}
            />
        </>
    );
}
