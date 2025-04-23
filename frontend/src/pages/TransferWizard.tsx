import { useEffect, useState } from "react";
import { Stepper, Step, StepLabel, Box, Card, CardContent } from "@mui/material";
import SelectSource from "../components/wizardSteps/SelectSource";
import SelectPlaylist from "../components/wizardSteps/SelectPlaylist";
import SelectDestination from "../components/wizardSteps/SelectDestination";
import { useParams } from "react-router-dom";
import { BACKEND_URL, PlatformKey } from "../constants";

const steps = ["Sursă", "Playlist", "Destinație"];

export interface TransferData {
    sourcePlatform: PlatformKey | null;
    selectedPlaylist: string | null;
    destinationPlatform: PlatformKey | null;
}

export default function TransferWizard() {
    const { sourcePlatform } = useParams<{ sourcePlatform?: PlatformKey }>();
    const [activeStep, setActiveStep] = useState(sourcePlatform ? 1 : 0);

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
                window.location.href = `${BACKEND_URL}/${data.sourcePlatform}/login`;
                setActiveStep(activeStep + 1);
            },
            back: async () => {
                setActiveStep(activeStep - 1);
            }
        },
        1: {
            next: async () => {
                // Implementation for step 1 next
            },
            back: async () => {
                setActiveStep(activeStep - 1);
            }
        },
        2: {
            next: async () => {
                // Implementation for step 2 next
            },
            back: async () => {
                // Implementation for step 2 back
            }
        }
    };


    return (
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
                    {activeStep === 0 && <SelectSource onChange={(platform) => updateData({ sourcePlatform: platform })} />}
                    {activeStep === 1 && <SelectPlaylist sourcePlatform={data.sourcePlatform as PlatformKey} onChange={(playlist) => updateData({ selectedPlaylist: playlist })} />}
                    {activeStep === 2 && <SelectDestination value={data.destinationPlatform} onChange={(value) => updateData({ destinationPlatform: value })} />}
                </CardContent>
                <button onClick={async () => { await wizardFunctions[activeStep].back() }} disabled={activeStep === 0}>Back</button>
                <button onClick={async () => { await wizardFunctions[activeStep].next() }} disabled={activeStep === steps.length - 1}>Next</button>
            </Card>
        </Box>
    );
};