import React from "react";
import { Box, Typography } from "@mui/material";

interface LoadingIndicatorProps {
    text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text = "Se încarcă..." }) => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" my={4}>
            <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: "16px" }}
            >
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#3f51b5"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset="75"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 50 50;360 50 50"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>
                <text x="50%" y="54%" textAnchor="middle" fontSize="20" fill="#3f51b5" dominantBaseline="middle">
                    ♫
                    <animate
                        attributeName="opacity"
                        values="1;0.5;1"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </text>
            </svg>
            <Typography variant="body2">{text}</Typography>
        </Box>
    );
};

export default LoadingIndicator;
