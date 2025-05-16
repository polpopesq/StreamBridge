import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Stepper, Step, StepLabel, Box, Card, CardContent } from "@mui/material";
import SelectPlatform from "../components/wizardSteps/SelectPlatform";
import SelectPlaylist from "../components/wizardSteps/SelectPlaylist";
import { BACKEND_URL, PlatformKey } from "../constants";
import { SnackbarAlert } from "../components/SnackbarAlert";
import { Playlist } from "@shared/types";

const steps = ["Sursă", "Playlist", "Destinație"];

export interface TransferData {
    sourcePlatform: PlatformKey | null;
    selectedPlaylist: Playlist | null;
    destinationPlatform: PlatformKey | null;
}

export default function TransferWizard() {
    const [searchParams] = useSearchParams();
    const sourcePlatform = searchParams.get("source") as PlatformKey | null;
    const destinationPlatform = searchParams.get("destination") as PlatformKey | null;
    const [activeStep, setActiveStep] = useState(sourcePlatform ? 1 : 0);
    const [activeSnackbar, setActiveSnackbar] = useState(false);
    const navigate = useNavigate();

    const [data, setData] = useState<TransferData>({
        sourcePlatform: sourcePlatform || null,
        selectedPlaylist: null,
        destinationPlatform: null,
    });

    const updateData = (partial: Partial<TransferData>) => {
        setData((prev) => ({ ...prev, ...partial }));
    }

    useEffect(() => {
        console.log(data);
    }, [data])

    useEffect(() => {
        const params = new URLSearchParams();
        if (data.sourcePlatform) params.set("source", data.sourcePlatform);
        if (data.destinationPlatform) params.set("destination", data.destinationPlatform);
        navigate({ search: params.toString() }, { replace: true });
    }, [data.sourcePlatform, data.destinationPlatform]);


    const wizardFunctions: Record<number, {
        next: () => Promise<void>;
        back: () => Promise<void>;
    }> = {
        0: {
            next: async () => {
                if (!data.sourcePlatform) {
                    setActiveSnackbar(true);
                    return;
                }
                switch (data.sourcePlatform) {
                    case "spotify":
                    case "ytMusic":
                        window.location.href = `${BACKEND_URL}/${data.sourcePlatform}/login?context=source`;
                        break;
                    case "txt":
                        navigate("/transfera?source=txt");
                        break;
                    default:
                        break;
                }

                setActiveStep(activeStep + 1);
            },
            back: async () => {
                setActiveStep(activeStep - 1);
            }
        },
        1: {
            next: async () => {
                if (!data.sourcePlatform || !data.selectedPlaylist) {
                    setActiveSnackbar(true);
                    return;
                }
                setActiveStep(activeStep + 1);
            },
            back: async () => {
                setData((prev) => ({ ...prev, sourcePlatform: null }));
                navigate("/transfera");
                setActiveStep(activeStep - 1);
            }
        },
        2: {
            next: async () => {
                if (!data.destinationPlatform) {
                    setActiveSnackbar(true);
                    return;
                }

                switch (data.destinationPlatform) {
                    case "spotify":
                    case "ytMusic":
                        window.location.href = `${BACKEND_URL}/${data.destinationPlatform}/login?context=destination`;
                        break;
                    case "txt":
                        navigate("/transfera?source=txt");
                    default:
                        break;
                }

                navigate("/loading",
                    {
                        state: {
                            transferData: {
                                sourcePlatform: data.sourcePlatform,
                                selectedPlaylist: data.selectedPlaylist,
                                destinationPlatform: data.destinationPlatform
                            }
                        }
                    }
                );

                console.log(`${BACKEND_URL}/transfer`);

                const transferResults = await fetch(`${BACKEND_URL}/transfer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                    credentials: "include",
                });
                if (!transferResults.ok) {
                    alert("Transfer failed. Please try again later.");
                    return;
                }
                const transferData = await transferResults.json();
                console.log(transferData);
                navigate("/check-transfer", {
                    state: {
                        transferResults: transferResults
                    }
                });

            },
            back: async () => {
                setActiveStep(activeStep - 1);
            }
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
                    <CardContent>
                        {activeStep === 0 && <SelectPlatform onChange={(platform) => updateData({ sourcePlatform: platform })} exclude={null} />}
                        {activeStep === 1 && <SelectPlaylist sourcePlatform={data.sourcePlatform as PlatformKey} selectedPlaylist={data.selectedPlaylist} onChange={(playlist: Playlist) => updateData({ selectedPlaylist: playlist })} />}
                        {activeStep === 2 && <SelectPlatform onChange={(platform) => updateData({ destinationPlatform: platform })} exclude={sourcePlatform || null} />}
                    </CardContent>
                    <button onClick={async () => { await wizardFunctions[activeStep].back() }} disabled={activeStep === 0}>Back</button>
                    <button onClick={async () => { await wizardFunctions[activeStep].next() }}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</button>
                </Card>
            </Box>
            <SnackbarAlert
                message={activeStep === 0 || activeStep === 2 ? "Please select a platform" : "Please select a playlist"}
                activeSnackbar={activeSnackbar}
                setActiveSnackbar={setActiveSnackbar}
            />
        </>
    );
};