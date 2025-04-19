import { useState } from "react";
import { Stepper, Step, StepLabel, Box, Button, Card, CardContent } from "@mui/material";
import SelectSource from "../components/wizardSteps/SelectSource";
import SelectPlaylist from "../components/wizardSteps/SelectPlaylist";
import SelectDestination from "../components/wizardSteps/SelectDestination";

const steps = ["Sursă", "Playlist", "Destinație"];

export default function Wizard() {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
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
                    {activeStep === 0 && <SelectSource onNext={handleNext} />}
                    {activeStep === 1 && <SelectPlaylist onNext={handleNext} onBack={handleBack} />}
                    {activeStep === 2 && <SelectDestination onBack={handleBack} />}
                </CardContent>
            </Card>
        </Box>
    );
};