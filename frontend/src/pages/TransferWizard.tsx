import { use, useEffect, useState } from "react";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const stepParam = parseInt(searchParams.get("step") || "0", 10);
    const [activeStep, setActiveStep] = useState(stepParam);
    const [activeSnackbar, setActiveSnackbar] = useState(false);
    const navigate = useNavigate();

    const [data, setData] = useState<TransferData>({
        sourcePlatform: null,
        selectedPlaylist: null,
        destinationPlatform: null,
    });

    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set("step", activeStep.toString());
        setSearchParams(currentParams, { replace: true });
    }, [activeStep]);

    useEffect(() => {
        if (activeStep > 0) {
            const saved = localStorage.getItem("transferData");
            if (saved) {
                setData(JSON.parse(saved));
                console.log("Transfer data loaded from localStorage:", JSON.parse(saved));
            }
        }
        else {
            localStorage.removeItem("transferData");
        }
        if (activeStep === 3) {
            navigate("/loading", {
                state: { transferData: data }
            });
            // try {
            //     const res = await fetch(`${BACKEND_URL}/transfer`, {
            //         method: "POST",
            //         headers: { "Content-Type": "application/json" },
            //         body: JSON.stringify(data),
            //         credentials: "include",
            //     });
            //     if (!res.ok) throw new Error("Transfer failed");

            //     const results = await res.json();
            //     navigate("/check-transfer", {
            //         state: { transferResults: results },
            //     });
            // } catch (err) {
            //     alert("Transferul a eșuat. Încearcă din nou.");
            // }
            // return;
        }
    }, []);

    const updateData = (partial: Partial<TransferData>) => {
        setData((prev) => ({ ...prev, ...partial }));
    };

    const redirectToOAuth = (platform: PlatformKey, step: number) => {
        window.location.href = `${BACKEND_URL}/${platform}/login?step=${step}`;
    };

    const handleNext = async () => {
        switch (activeStep) {
            case 0:
                if (!data.sourcePlatform) return setActiveSnackbar(true);
                if (["spotify", "ytMusic"].includes(data.sourcePlatform)) {
                    localStorage.setItem("transferData", JSON.stringify(data));
                    return redirectToOAuth(data.sourcePlatform, 0);
                }
                if (data.sourcePlatform === "txt") {
                    return navigate("/transfera?source=txt");
                }
                break;
            case 1:
                if (!data.selectedPlaylist) return setActiveSnackbar(true);
                break;
            case 2:
                if (!data.destinationPlatform) return setActiveSnackbar(true);
                if (["spotify", "ytMusic"].includes(data.destinationPlatform)) {
                    localStorage.setItem("transferData", JSON.stringify(data));
                    return redirectToOAuth(data.destinationPlatform, 2);
                }
                if (data.destinationPlatform === "txt") {
                    return navigate("/transfera?destination=txt");
                }
        }

        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (activeStep === 1) {
            updateData({ sourcePlatform: null });
            navigate("/transfera");
        }
        setActiveStep((prev) => prev - 1);
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
                        {activeStep === 0 && (
                            <SelectPlatform
                                onChange={(platform) => updateData({ sourcePlatform: platform })}
                                exclude={null}
                            />
                        )}
                        {activeStep === 1 && (
                            <SelectPlaylist
                                onChange={(playlist: Playlist) => updateData({ selectedPlaylist: playlist })}
                            />
                        )}
                        {activeStep === 2 && (
                            <SelectPlatform
                                onChange={(platform) => updateData({ destinationPlatform: platform })}
                                exclude={data.sourcePlatform}
                            />
                        )}
                    </CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                        <button onClick={handleBack} disabled={activeStep === 0}>Înapoi</button>
                        <button onClick={handleNext}>{activeStep === steps.length - 1 ? "Finalizare" : "Următorul"}</button>
                    </Box>
                </Card>
            </Box>

            <SnackbarAlert
                message={
                    activeStep === 1
                        ? "Selectează un playlist"
                        : "Selectează o platformă"
                }
                activeSnackbar={activeSnackbar}
                setActiveSnackbar={setActiveSnackbar}
            />
        </>
    );
}
