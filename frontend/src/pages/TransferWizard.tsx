import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, Step, StepLabel, Box, Card, CardContent } from "@mui/material";
import SelectPlatform from "../components/wizardSteps/SelectPlatform";
import SelectPlaylist from "../components/wizardSteps/SelectPlaylist";
import { useParams } from "react-router-dom";
import { BACKEND_URL, PlatformKey } from "../constants";
import { SnackbarAlert } from "../components/SnackbarAlert";

const steps = ["Sursă", "Playlist", "Destinație"];

export interface TransferData {
    sourcePlatform: PlatformKey | null;
    selectedPlaylist: any | null;
    destinationPlatform: PlatformKey | null;
}

export default function TransferWizard() {
    const { sourcePlatform } = useParams<{ sourcePlatform?: PlatformKey }>();
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
                        window.location.href = `${BACKEND_URL}/${data.sourcePlatform}/login`;
                        break;
                    case "txt":
                        navigate("/transfera/txt");
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
                        {activeStep === 0 && <SelectPlatform onChange={(platform) => updateData({ sourcePlatform: platform })} type="sursa" exclude={null} />}
                        {activeStep === 1 && <SelectPlaylist sourcePlatform={data.sourcePlatform as PlatformKey} selectedPlaylist={data.selectedPlaylist} onChange={(playlist) => updateData({ selectedPlaylist: playlist })} />}
                        {activeStep === 2 && <SelectPlatform onChange={(platform) => updateData({ destinationPlatform: platform })} type="destinatie" exclude={sourcePlatform || null} />}
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